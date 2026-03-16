import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

const FLOORS: number[] = [2, 1];

interface FloorToggleProps {
    currentFloor: number;
    onChange: (floor: number) => void;
}

/**
 * Renders the floor toggle as a Leaflet topright control so it sits
 * physically inside the map canvas rather than in the header.
 */
export function FloorToggle({ currentFloor, onChange }: FloorToggleProps) {
    const map = useMap();
    // Track the DOM node Leaflet gives us so React can portal into it
    const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const Control = L.Control.extend({
            onAdd() {
                const div = L.DomUtil.create("div", "leaflet-floor-toggle");
                L.DomEvent.disableClickPropagation(div);
                L.DomEvent.disableScrollPropagation(div);
                setMountNode(div);
                return div;
            },
            onRemove() {
                setMountNode(null);
            },
        });

        const control = new Control({ position: "topright" });
        control.addTo(map);
        return () => { control.remove(); };
    }, [map]);

    if (!mountNode) return null;

    return createPortal(
        <div className="flex flex-col items-center border-2 border-[#1A3263] rounded overflow-hidden shadow-md bg-white">
            {FLOORS.map((floor) => (
                <button
                    key={floor}
                    onClick={() => onChange(floor)}
                    aria-pressed={currentFloor === floor}
                    className={`w-8 h-8 text-sm text-[#1A3263] font-bold transition-colors duration-200 ${currentFloor === floor
                        ? "bg-[#1A3263] text-white"
                        : "bg-white text-gray-800 hover:bg-gray-100"
                        }`}
                >
                    {floor}
                </button>
            ))}
        </div>,
        mountNode
    );
}

export default FloorToggle;