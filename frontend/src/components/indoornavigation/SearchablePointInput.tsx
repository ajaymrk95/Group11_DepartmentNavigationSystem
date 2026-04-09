import { useState, useEffect, useRef } from "react";

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
}

export function SearchablePointInput({ label, value, buildingId, buildingEntries, onChange }: Props) {
    const [query, setQuery] = useState(value);
    const [options, setOptions] = useState<PointOption[]>([]);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const [isSelecting, setIsSelecting] = useState(false);

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

    return (
        <div className="relative flex items-center gap-3 w-full" ref={ref}>
            <label className="text-[15px] text-[#FAB95B] font-semibold min-w-10 shrink-0 tracking-wide text-left">
                {label}
            </label>
            <div className="relative w-full">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => query.length > 0 && setOpen(true)}
                    onBlur={() => {
                        setTimeout(() => setOpen(false), 200);
                    }}
                    placeholder="Search room..."
                    className="w-full sm:w-56 lg:w-64 px-5 py-[10px] rounded-full border-none bg-white/10 text-white font-[Outfit] text-[14px] outline-none transition-all duration-[180ms] placeholder-white/50 focus:bg-white/20 focus:shadow-[0_0_0_2px_#FAB95B] tracking-wide"
                />
                {open && options.length > 0 && (
                    <ul className="absolute top-full left-0 mt-2 w-[110%] min-w-[240px] bg-[#1A3263] border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-[9999] max-h-64 overflow-y-auto overflow-hidden divide-y divide-white/5 custom-scrollbar">
                        {options.map((o) => (
                            <li
                                key={o.value}
                                onClick={() => {
                                    setIsSelecting(true); // Tell the effect NOT to fetch
                                    setQuery(o.label);
                                    onChange(o.value, o.coordinates, o.floor);  // ← pass coordinates
                                    setOpen(false);

                                    const inputElement = ref.current?.querySelector("input");
                                    inputElement?.blur();
                                }}
                                className="px-4 py-3 text-[14px] text-white/90 hover:bg-white/10 hover:text-[#FAB95B] cursor-pointer transition-colors duration-150 break-words"
                            >
                                {o.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}