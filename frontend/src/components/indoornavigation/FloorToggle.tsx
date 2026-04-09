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
        <div className="flex flex-col items-center border border-white/20 rounded-2xl overflow-hidden shadow-2xl bg-[#1A3263]/90 backdrop-blur-md m-4">
            {FLOORS.map((floor) => (
                <button
                    key={floor}
                    onClick={() => onChange(floor)}
                    aria-pressed={currentFloor === floor}
                    className={`w-11 h-11 text-[16px] font-[Outfit] font-extrabold transition-all duration-[180ms] border-b border-white/10 last:border-b-0 ${
                        currentFloor === floor
                            ? "bg-[#FAB95B] text-[#1A3263]"
                            : "bg-transparent text-[#E8E2DB] hover:bg-white/10 hover:text-[#FAB95B]"
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