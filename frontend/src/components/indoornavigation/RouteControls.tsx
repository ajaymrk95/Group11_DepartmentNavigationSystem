import { useState } from "react";
import type { RouteControlsProps } from "../../types/types";
import { SearchablePointInput } from "./SearchablePointInput";

export function RouteControls({ from, to, noRouteFound, setFrom, setTo, onFindPath, buildingId, buildingEntries }: RouteControlsProps) {
    const [fromCoords, setFromCoords] = useState<[number, number] | null>(null);
    const [toCoords, setToCoords] = useState<[number, number] | null>(null);

    return (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <SearchablePointInput
                label="From"
                value={from}
                buildingId={buildingId}
                buildingEntries={buildingEntries}
                onChange={(value, coords) => {
                    setFrom(value);
                    setFromCoords(coords);
                }}
            />
            <span className="hidden sm:block text-gray-400">→</span>
            <SearchablePointInput
                label="To"
                value={to}
                buildingId={buildingId}
                buildingEntries={buildingEntries}
                onChange={(value, coords) => {
                    setTo(value);
                    setToCoords(coords);
                }}
            />
            <button
                onClick={() => fromCoords && toCoords && onFindPath(fromCoords, toCoords)}
                disabled={!fromCoords || !toCoords}
                className="border border-[#E8E2DB] text-[#E8E2DB] hover:bg-[#E8E2DB] hover:text-[#1A3263] font-semibold text-sm px-4 py-1.5 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Find Path
            </button>
            {noRouteFound && (
                <span className="text-sm text-red-400">No route found</span>
            )}
        </div>
    );
}