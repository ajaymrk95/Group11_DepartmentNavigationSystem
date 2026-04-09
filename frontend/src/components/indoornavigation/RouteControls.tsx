import { useState } from "react";
import type { RouteControlsProps } from "../../types/types";
import { SearchablePointInput } from "./SearchablePointInput";

export function RouteControls({ from, to, noRouteFound, setFrom, setTo, onFindPath, buildingId, buildingEntries }: RouteControlsProps) {
    const [fromCoords, setFromCoords] = useState<[number, number] | null>(null);
    const [toCoords, setToCoords] = useState<[number, number] | null>(null);
    const [fromFloor, setFromFloor] = useState<number>(1);
    const [toFloor, setToFloor] = useState<number>(1);

    const canFind = !!fromCoords && !!toCoords;

    return (
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-3 items-stretch lg:items-center w-full lg:w-auto lg:max-w-max">
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

            {/* Arrow separator */}
            <div className="hidden lg:flex items-center shrink-0">
                <svg className="text-[rgba(250,185,91,0.4)] w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </div>

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

            <div className="flex items-center gap-2 mt-1 lg:mt-0">
                <button
                    onClick={() => fromCoords && toCoords && onFindPath(fromCoords, toCoords, fromFloor, toFloor)}
                    disabled={!canFind}
                    className={`
                        flex items-center gap-2 px-5 py-2.5 rounded-full text-[13.5px] font-bold tracking-wide
                        transition-all duration-200 shrink-0 w-full sm:w-auto justify-center
                        ${canFind
                            ? "bg-[#FAB95B] text-[#1A3263] hover:bg-[#f9aa3d] shadow-[0_0_20px_rgba(250,185,91,0.3)] hover:shadow-[0_0_28px_rgba(250,185,91,0.45)]"
                            : "bg-white/10 text-[rgba(246,231,188,0.35)] cursor-not-allowed"
                        }
                    `}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" /></svg>
                    Find Path
                </button>

                {noRouteFound && (
                    <span className="text-[12px] font-semibold text-[#ff6b7a] bg-[rgba(220,53,69,0.12)] px-3 py-1.5 rounded-full border border-[rgba(220,53,69,0.3)] whitespace-nowrap shrink-0">
                        No route found
                    </span>
                )}
            </div>
        </div>
    );
}