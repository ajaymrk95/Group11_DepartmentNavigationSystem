import { useState } from "react";
import type { RouteControlsProps } from "../../types/types";
import { SearchablePointInput } from "./SearchablePointInput";

export function RouteControls({ from, to, noRouteFound, setFrom, setTo, onFindPath, buildingId, buildingEntries }: RouteControlsProps) {
    const [fromCoords, setFromCoords] = useState<[number, number] | null>(null);
    const [toCoords, setToCoords] = useState<[number, number] | null>(null);
    const [fromFloor, setFromFloor] = useState<number>(1);
    const [toFloor, setToFloor] = useState<number>(1);

    return (
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch lg:items-center w-full justify-center">
            <SearchablePointInput
                label="From"
                value={from}
                buildingId={buildingId}
                buildingEntries={buildingEntries}
                onChange={(value, coords, fromfloor) => {
                    setFrom(value);
                    setFromCoords(coords);
                    setFromFloor(fromfloor);
                }}
            />
            <svg className="hidden lg:block text-[#FAB95B] w-5 h-5 opacity-80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <SearchablePointInput
                label="To"
                value={to}
                buildingId={buildingId}
                buildingEntries={buildingEntries}
                onChange={(value, coords, tofloor) => {
                    setTo(value);
                    setToCoords(coords);
                    setToFloor(tofloor);
                }}
            />
            <div className="flex items-center justify-between lg:justify-start gap-3 mt-1 lg:mt-0 lg:ml-2">
                <button
                    onClick={() => fromCoords && toCoords && onFindPath(fromCoords, toCoords, fromFloor, toFloor)}
                    disabled={!fromCoords || !toCoords}
                    className="bg-[#FAB95B] text-[#1A3263] hover:bg-[#e6a850] font-bold text-[14px] px-6 py-[10px] rounded-full transition-all duration-[220ms] disabled:opacity-50 disabled:bg-[#ccc] disabled:text-gray-600 disabled:cursor-not-allowed shadow-sm hover:shadow-md shrink-0 w-full sm:w-auto"
                >
                    Find Path
                </button>
                {noRouteFound && (
                    <span className="text-[13px] font-semibold text-[#ff4d5e] bg-[rgba(220,53,69,0.1)] px-3 py-1.5 rounded-full border border-[rgba(220,53,69,0.35)] whitespace-nowrap shrink-0">
                        No route found
                    </span>
                )}
            </div>
        </div>
    );
}