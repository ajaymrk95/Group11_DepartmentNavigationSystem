import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Html5Qrcode } from "html5-qrcode";

interface PointOption {
    value: string;
    label: string;
    coordinates: [number, number];
    floor: number;
}

interface Props {
    label: string;
    value: string;
    buildingId: number;
    buildingEntries: [number, number][];
    onChange: (value: string, coordinates: [number, number], floor: number) => void;
    showQr?: boolean;
}

export function SearchablePointInput({ label, value, buildingId, buildingEntries, onChange, showQr = false }: Props) {
    const [query, setQuery] = useState(value);
    const [options, setOptions] = useState<PointOption[]>([]);
    const [open, setOpen] = useState(false);
    const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const inputWrapRef = useRef<HTMLDivElement>(null);
    const [isSelecting, setIsSelecting] = useState(false);

    // QR scanner state
    const [qrOpen, setQrOpen] = useState(false);
    const [qrError, setQrError] = useState<string | null>(null);
    const [qrLoading, setQrLoading] = useState(false);
    const qrScannerRef = useRef<Html5Qrcode | null>(null);
    const qrStartedRef = useRef(false);
    const qrStoppedRef = useRef(false);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Compute dropdown anchor position whenever it opens
    useEffect(() => {
        if (open && inputWrapRef.current) {
            const r = inputWrapRef.current.getBoundingClientRect();
            setDropdownRect({ top: r.bottom + 8, left: r.left, width: Math.max(r.width, 260) });
        }
    }, [open]);

    // Fetch suggestions on query change
    useEffect(() => {
        if (isSelecting) {
            setIsSelecting(false); // Reset flag and skip
            return;
        }

        if (query.trim().length < 1) {
            setOptions([]);
            setOpen(false);
            return;
        }

        if (!buildingId) {
            console.warn("buildingId is not set yet");
            return;
        }

        const timeout = setTimeout(() => {
            const url = `${import.meta.env.VITE_API_URL}/api/rooms/search?buildingId=${buildingId}&q=${encodeURIComponent(query)}`;
            console.log("Fetching:", url);

            fetch(url)
                .then((res) => res.json())
                .then((rooms) => {
                    console.log("rooms response:", rooms);
                    const pts: PointOption[] = [];

                    buildingEntries.forEach((coords, i) => {
                        pts.push({
                            value: `building-entry-${i}`,
                            label: `Building Entry ${i + 1}`,
                            coordinates: coords,
                            floor: 1
                        });
                    });

                    rooms.forEach((room: any) => {
                        if (room.entries?.coordinates) {
                            room.entries.coordinates.forEach((coords: [number, number], i: number) => {
                                pts.push({
                                    value: `room-${room.id}-entry-${i}`,
                                    label: `${room.name} (Floor ${room.floor}) — Door ${i + 1}`,
                                    coordinates: coords,
                                    floor: room.floor
                                });
                            });
                        }
                    });

                    console.log("options:", pts);
                    setOptions(pts);
                    setOpen(pts.length > 0);
                })
                .catch((err) => console.error("Search failed:", err));
        }, 300);

        return () => clearTimeout(timeout);
    }, [query, buildingId]);

    // ── QR Scanner Logic ──
    function openQrScanner() {
        setQrError(null);
        setQrLoading(false);
        setQrOpen(true);
        qrStartedRef.current = false;
        qrStoppedRef.current = false;
    }

    function closeQrScanner() {
        setQrOpen(false);
        qrStoppedRef.current = true;
        if (qrScannerRef.current) {
            qrScannerRef.current.stop().catch(() => {});
            qrScannerRef.current = null;
        }
        qrStartedRef.current = false;
    }

    // Initialize scanner when modal opens
    useEffect(() => {
        if (!qrOpen || qrStartedRef.current) return;

        // Longer delay to ensure the portal DOM element is mounted and sized
        const initTimeout = setTimeout(() => {
            const readerEl = document.getElementById("indoor-qr-reader");
            if (!readerEl) {
                console.error("indoor-qr-reader element not found in DOM");
                return;
            }

            console.log("Starting QR scanner, element size:", readerEl.offsetWidth, readerEl.offsetHeight);
            qrStartedRef.current = true;
            const scanner = new Html5Qrcode("indoor-qr-reader");
            qrScannerRef.current = scanner;

            scanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                        const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.8;
                        return { width: size, height: size };
                    },
                },
                (decodedText: string) => {
                    if (qrStoppedRef.current) return;
                    console.log("QR scanned raw:", decodedText);

                    let searchValue: string | null = null;
                    try {
                        const parsed = JSON.parse(decodedText);
                        if (parsed.name) {
                            searchValue = parsed.name;
                        }
                    } catch {
                        // QR was not JSON — invalid
                    }

                    if (!searchValue) {
                        setQrError("This QR code isn't a valid location. Please scan a location QR code.");
                        return;
                    }

                    console.log("QR decoded name:", searchValue);
                    qrStoppedRef.current = true;
                    setQrLoading(true);
                    setQrError(null);

                    // Stop camera then search for the room
                    scanner.stop().then(() => {
                        handleQrResult(searchValue!);
                    }).catch(() => {
                        handleQrResult(searchValue!);
                    });
                },
                () => {}
            ).catch((err: any) => {
                console.error("QR scanner failed to start:", err);
                setQrError("Could not access camera. Please allow camera permissions and try again.");
            });
        }, 600);

        return () => {
            clearTimeout(initTimeout);
        };
    }, [qrOpen]);

    // Cleanup scanner on unmount
    useEffect(() => {
        return () => {
            if (qrScannerRef.current) {
                qrScannerRef.current.stop().catch(() => {});
            }
        };
    }, []);

    async function handleQrResult(scannedName: string) {
        if (!buildingId) {
            setQrError("Building data not loaded yet. Please try again.");
            setQrLoading(false);
            return;
        }

        try {
            const url = `${import.meta.env.VITE_API_URL}/api/rooms/search?buildingId=${buildingId}&q=${encodeURIComponent(scannedName)}`;
            const res = await fetch(url);
            const rooms = await res.json();

            if (!rooms || rooms.length === 0) {
                setQrError(`No room named "${scannedName}" found in this building. Try scanning again.`);
                setQrLoading(false);
                // Re-enable scanning
                qrStoppedRef.current = false;
                qrStartedRef.current = false;
                return;
            }

            // Find the first room with entry coordinates
            let matched = false;
            for (const room of rooms) {
                if (room.entries?.coordinates && room.entries.coordinates.length > 0) {
                    const coords = room.entries.coordinates[0];
                    const labelText = `${room.name} (Floor ${room.floor}) — Door 1`;
                    setIsSelecting(true);
                    setQuery(labelText);
                    onChange(`room-${room.id}-entry-0`, coords, room.floor);
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                setQrError(`Room "${scannedName}" was found but has no entry points configured.`);
                setQrLoading(false);
                qrStoppedRef.current = false;
                qrStartedRef.current = false;
                return;
            }

            setQrLoading(false);
            setQrOpen(false);
        } catch (err) {
            console.error("QR room search failed:", err);
            setQrError("Couldn't reach the server. Please check your connection and try again.");
            setQrLoading(false);
            qrStoppedRef.current = false;
            qrStartedRef.current = false;
        }
    }

    return (
        <>
            <div className="relative flex items-center gap-2 sm:gap-3 w-full" ref={ref}>
                <label className="text-[15px] text-[#FAB95B] font-semibold min-w-10 shrink-0 tracking-wide text-left">
                    {label}
                </label>
                <div className="relative w-full flex items-center gap-1.5" ref={inputWrapRef}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setOpen(true);
                        }}
                        onFocus={() => query.length > 0 && setOpen(true)}
                        onBlur={() => {
                            setTimeout(() => { if (!isSelecting) setOpen(false); }, 150);
                        }}
                        placeholder="Search room..."
                        className="w-full sm:w-56 lg:w-64 px-5 py-[10px] rounded-full border-none bg-white/10 text-white font-[Outfit] text-[14px] outline-none transition-all duration-[180ms] placeholder-white/50 focus:bg-white/20 focus:shadow-[0_0_0_2px_#FAB95B] tracking-wide"
                    />

                    {/* QR Scan Button */}
                    {showQr && (
                        <button
                            type="button"
                            onClick={openQrScanner}
                            title="Scan QR Code"
                            className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[rgba(250,185,91,0.12)] border border-[rgba(250,185,91,0.25)] flex items-center justify-center text-[#FAB95B] hover:bg-[rgba(250,185,91,0.25)] hover:border-[#FAB95B] hover:shadow-[0_0_12px_rgba(250,185,91,0.2)] transition-all duration-200 active:scale-95"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                {/* QR code icon */}
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="5.5" y="5.5" width="2" height="2" fill="currentColor" stroke="none" />
                                <rect x="16.5" y="5.5" width="2" height="2" fill="currentColor" stroke="none" />
                                <rect x="5.5" y="16.5" width="2" height="2" fill="currentColor" stroke="none" />
                                <path d="M14 14h3v3" />
                                <path d="M21 14h-1" />
                                <path d="M21 18h-4v3" />
                                <path d="M14 21v-1" />
                            </svg>
                        </button>
                    )}

                    {open && options.length > 0 && dropdownRect && createPortal(
                        <ul
                            style={{
                                position: "fixed",
                                top: dropdownRect.top,
                                left: dropdownRect.left,
                                minWidth: dropdownRect.width,
                                zIndex: 99999,
                            }}
                            className="bg-[#0B2D72] border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.55)] max-h-64 overflow-y-auto divide-y divide-white/[0.06] custom-scrollbar"
                        >
                            {options.map((o) => (
                                <li
                                    key={o.value}
                                    onMouseDown={() => {
                                        setIsSelecting(true);
                                        setQuery(o.label);
                                        onChange(o.value, o.coordinates, o.floor);
                                        setOpen(false);
                                        setTimeout(() => setIsSelecting(false), 200);
                                    }}
                                    className="px-5 py-3 text-[13px] text-[#F6E7BC] hover:bg-[rgba(250,185,91,0.08)] hover:text-[#FAB95B] cursor-pointer transition-colors duration-150 break-words flex items-center gap-2"
                                >
                                    <svg className="shrink-0 text-[rgba(250,185,91,0.5)]" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                                    {o.label}
                                </li>
                            ))}
                        </ul>,
                        document.body
                    )}
                </div>
            </div>

            {/* ── QR Scanner Modal ── */}
            {qrOpen && createPortal(
                <div
                    className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                    onClick={(e) => { if (e.target === e.currentTarget) closeQrScanner(); }}
                >
                    <div
                        className="relative w-full max-w-[420px] bg-[#0B2D72] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                        style={{ animation: "qrModalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[rgba(250,185,91,0.15)] border border-[rgba(250,185,91,0.3)] flex items-center justify-center">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAB95B" strokeWidth="1.8">
                                        <rect x="3" y="3" width="7" height="7" rx="1" />
                                        <rect x="14" y="3" width="7" height="7" rx="1" />
                                        <rect x="3" y="14" width="7" height="7" rx="1" />
                                        <rect x="5.5" y="5.5" width="2" height="2" fill="#FAB95B" stroke="none" />
                                        <rect x="16.5" y="5.5" width="2" height="2" fill="#FAB95B" stroke="none" />
                                        <rect x="5.5" y="16.5" width="2" height="2" fill="#FAB95B" stroke="none" />
                                        <path d="M14 14h3v3" />
                                        <path d="M21 14h-1" />
                                        <path d="M21 18h-4v3" />
                                        <path d="M14 21v-1" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-[#FAB95B] tracking-wide">Scan QR Code</p>
                                    <p className="text-[11px] text-[rgba(246,231,188,0.5)]">Set your starting location</p>
                                </div>
                            </div>
                            <button
                                onClick={closeQrScanner}
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[rgba(246,231,188,0.5)] hover:text-[#FAB95B] transition-all duration-200"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Scanner Viewfinder */}
                        <div className="relative px-5 py-4">
                            <div
                                id="indoor-qr-reader"
                                className="w-full overflow-hidden rounded-2xl border-2 border-[rgba(250,185,91,0.3)]"
                                style={{
                                    minHeight: "280px",
                                    maxHeight: "min(60vh, 380px)",
                                    boxShadow: "0 0 0 4px rgba(250,185,91,0.08), 0 8px 32px rgba(0,0,0,0.4)",
                                }}
                            />

                            {/* Loading overlay */}
                            {qrLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#0B2D72]/80 rounded-2xl mx-5 my-4">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-10 h-10 border-3 border-[#FAB95B]/30 border-t-[#FAB95B] rounded-full"
                                            style={{ animation: "qrSpin 0.8s linear infinite", borderWidth: "3px" }}
                                        />
                                        <span className="text-[13px] font-semibold text-[#FAB95B]">Finding room...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Error message */}
                        {qrError && (
                            <div className="mx-5 mb-4 flex items-start gap-3 bg-[rgba(220,53,69,0.08)] border border-[rgba(220,53,69,0.25)] rounded-xl px-4 py-3"
                                style={{ animation: "qrModalIn 0.25s ease" }}
                            >
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[rgba(250,185,91,0.15)] flex items-center justify-center mt-0.5">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                            stroke="#FAB95B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-semibold text-[#FAB95B] mb-0.5">Invalid QR Code</p>
                                    <p className="text-[11px] text-[rgba(246,231,188,0.6)] leading-relaxed">{qrError}</p>
                                </div>
                                <button
                                    onClick={() => setQrError(null)}
                                    className="flex-shrink-0 text-[rgba(246,231,188,0.4)] hover:text-[#FAB95B] transition-colors"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Footer hint */}
                        <div className="px-5 pb-4 pt-0">
                            <p className="text-[11px] text-center text-[rgba(246,231,188,0.35)] leading-relaxed">
                                Point your camera at a location QR code to set it as the starting point
                            </p>
                        </div>
                    </div>

                    <style>{`
                        @keyframes qrModalIn {
                            from { opacity: 0; transform: scale(0.92) translateY(12px); }
                            to   { opacity: 1; transform: scale(1) translateY(0); }
                        }
                        @keyframes qrSpin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>,
                document.body
            )}
        </>
    );
}