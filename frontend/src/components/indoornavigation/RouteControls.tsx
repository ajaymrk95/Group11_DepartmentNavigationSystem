import type { RouteControlsProps } from "../../types/types";

export const POI_OPTIONS = [
    { value: "entry1", label: "Entry 1" },
    { value: "entry2", label: "Entry 2" },
    { value: "entry3", label: "Entry 3" },
    { value: "101entry1", label: "Room 101 – Door 1" },
    { value: "101entry2", label: "Room 101 – Door 2" },
    { value: "102entry1", label: "Room 102 – Door 1" },
    { value: "102entry2", label: "Room 102 – Door 2" },
    { value: "103entry1", label: "Room 103 – Door 1" },
    { value: "103entry2", label: "Room 103 – Door 2" },
    { value: "104entry1", label: "Room 104 – Door 1" },
    { value: "104entry2", label: "Room 104 – Door 2" },
    { value: "girltoilet", label: "Ladies Toilet" },
    { value: "boystoilet ", label: "Gents Toilet" },
];

const selectClass =
    "border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

export function RouteControls({ from, to, noRouteFound, setFrom, setTo, onFindPath }: RouteControlsProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-3">
                <label className="w-9 text-sm sm:w-auto text-[#E8E2DB] font-semibold">From</label>
                <select value={from} onChange={(e) => setFrom(e.target.value)} className={selectClass}>
                    {POI_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            <span className="hidden sm:block text-gray-400">→</span>

            <div className="flex items-center gap-3">
                <label className="w-9 text-sm sm:w-auto text-[#E8E2DB] font-semibold">To</label>
                <select value={to} onChange={(e) => setTo(e.target.value)} className={selectClass}>
                    {POI_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            <button
                onClick={onFindPath}
                className="border border-[#E8E2DB] text-[#E8E2DB] hover:bg-[#E8E2DB] hover:text-[#1A3263] font-semibold text-sm px-4 py-1.5 rounded-md transition-colors duration-200"
            >
                Find Path
            </button>

            {noRouteFound && (
                <span className="text-sm text-red-400">No route found</span>
            )}
        </div>
    );
}

export default RouteControls;