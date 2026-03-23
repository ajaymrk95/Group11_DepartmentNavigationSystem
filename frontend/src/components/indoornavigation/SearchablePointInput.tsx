import { useState, useEffect, useRef } from "react";

interface PointOption {
    value: string;
    label: string;
    coordinates: [number, number];
}

interface Props {
    label: string;
    value: string;
    buildingId: number;
    buildingEntries: [number, number][];
    onChange: (value: string) => void;
}

export function SearchablePointInput({ label, value, buildingId, buildingEntries, onChange }: Props) {
    const [query, setQuery] = useState(value);
    const [options, setOptions] = useState<PointOption[]>([]);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

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
            const url = `http://localhost:8080/api/rooms/search?buildingId=${buildingId}&q=${encodeURIComponent(query)}`;
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
                        });
                    });

                    rooms.forEach((room: any) => {
                        if (room.entries?.coordinates) {
                            room.entries.coordinates.forEach((coords: [number, number], i: number) => {
                                pts.push({
                                    value: `room-${room.id}-entry-${i}`,
                                    label: `${room.name} (Floor ${room.floor}) — Door ${i + 1}`,
                                    coordinates: coords,
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
        <div className="relative flex items-center gap-3" ref={ref}>
            <label className="text-sm text-[#E8E2DB] font-semibold w-9 sm:w-auto shrink-0">
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => query.length > 0 && setOpen(true)}
                    placeholder="Search room..."
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                />
                {open && options.length > 0 && (
                    <ul className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-[9999] max-h-48 overflow-y-auto">
                        {options.map((o) => (
                            <li
                                key={o.value}
                                onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                                onClick={() => {
                                    setQuery(o.label);
                                    onChange(o.value);
                                    setOpen(false);
                                }}
                                className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
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