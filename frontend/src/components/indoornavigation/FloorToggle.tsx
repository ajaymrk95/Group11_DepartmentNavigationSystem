import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import type { FloorToggleProps } from "../../types/types";

export function FloorToggle({ currentFloor, onChange, floors }: FloorToggleProps) {
    const map = useMap();
    const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

    // Generate floor array from total floors e.g. 3 → [3, 2, 1]
    const FLOORS = Array.from({ length: floors }, (_, i) => floors - i);

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
                    className={`w-8 h-8 text-sm font-bold transition-colors duration-200 border-b-2 border-[#1A3263] last:border-b-0 ${currentFloor === floor
                            ? "bg-[#1A3263] text-white"
                            : "bg-white text-[#1A3263] hover:bg-gray-100"
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