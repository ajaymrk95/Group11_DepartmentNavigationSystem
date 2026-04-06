import L from "leaflet";

const POI_ICON_CONFIG: Record<string, { emoji: string; bgColor: string }> = {
    entry: { emoji: "🚪", bgColor: "#10b981" },
    stairs: { emoji: "🪜", bgColor: "#f59e0b" },
    rentry: { emoji: "🚪", bgColor: "#8b5cf6" },
};

const TOILET_ICON = { emoji: "🚻", bgColor: "#ef4444" };
const DEFAULT_ICON = { emoji: "📍", bgColor: "#3b82f6" };

export function createPOIIcon(type: string, name: string): L.DivIcon {
    const isToilet = name?.toLowerCase().includes("toilet");
    const { emoji, bgColor } = isToilet
        ? TOILET_ICON
        : (POI_ICON_CONFIG[type] ?? DEFAULT_ICON);

    return L.divIcon({
        html: `
      <div style="
        background-color: ${bgColor};
        border: 2px solid white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      ">${emoji}</div>
    `,
        className: "poi-marker",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
    });
}

export function createRoomLabelIcon(
    text: string,
    color: string,
    fontSize: string
): L.DivIcon {
    return L.divIcon({
        html: `
      <div style="
        color: ${color};
        font-weight: bold;
        font-size: ${fontSize};
        white-space: nowrap;
        text-shadow:
          -1px -1px 0 #fff, 1px -1px 0 #fff,
          -1px  1px 0 #fff, 1px  1px 0 #fff,
          -1px  0   0 #fff, 1px  0   0 #fff,
           0   -1px 0 #fff, 0    1px 0 #fff;
        pointer-events: none;
      ">${text}</div>
    `,
        className: "room-label",
        iconSize: [0, 0],
        iconAnchor: [0, 0],
    });
}

export function stairIcon(direction: "up" | "down") {
    const arrow = direction === "up" ? "▲" : "▼";
    const animDir = direction === "up" ? "-4px" : "4px";

    return L.divIcon({
        className: "",
        html: `
            <style>
                @keyframes stair-pulse-${direction} {
                    0%   { transform: translateY(0);           opacity: 1; }
                    50%  { transform: translateY(${animDir});  opacity: 0.6; }
                    100% { transform: translateY(0);           opacity: 1; }
                }
            </style>
            <div style="
                background: rgba(41, 26, 0, 0.85);
                border: 2px solid #f59e0b;
                border-radius: 10px;
                padding: 8px 10px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
            ">
                <span style="
                    font-size: 22px;
                    color: #f59e0b;
                    display: inline-block;
                    animation: stair-pulse-${direction} 1s ease-in-out infinite;
                    line-height: 1;
                ">${arrow}</span>
            </div>
        `,
        iconAnchor: [20, 20],
        iconSize: [36, 36],
    });
}


export function startIcon() {
    return L.divIcon({
        className: "",
        html: `
            <div style="
                width: 18px;
                height: 18px;
                background: #16a34a;
                border: 3px solid rgba(0, 20, 5, 0.85);
                border-radius: 50%;
                box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.3);
                animation: start-pulse 2s infinite;
            "></div>
            <style>
                @keyframes start-pulse {
                    0%   { box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.3); }
                    50%  { box-shadow: 0 0 0 8px rgba(22, 163, 74, 0.1); }
                    100% { box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.3); }
                }
            </style>
        `,
        iconAnchor: [9, 9],
        iconSize: [18, 18],
    });
}

export function endIcon() {
    return L.divIcon({
        className: "",
        html: `
            <style>
                @keyframes pin-drop {
                    0%   { transform: rotate(-45deg) translateY(-20px); opacity: 0; }
                    60%  { transform: rotate(-45deg) translateY(4px);   opacity: 1; }
                    80%  { transform: rotate(-45deg) translateY(-3px);  opacity: 1; }
                    100% { transform: rotate(-45deg) translateY(0);     opacity: 1; }
                }
                @keyframes pin-shadow {
                    0%   { transform: scale(0);   opacity: 0; }
                    60%  { transform: scale(1.2); opacity: 0.3; }
                    100% { transform: scale(1);   opacity: 0.2; }
                }
            </style>
            <div style="position: relative; width: 24px; height: 30px;">
                <div style="
                    width: 24px;
                    height: 24px;
                    background: #dc2626;
                    border: 2px solid rgba(40, 0, 0, 0.85);
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                    animation: pin-drop 0.5s ease-out forwards;
                    position: absolute;
                    top: 0;
                    left: 0;
                ">
                    <div style="
                        width: 8px;
                        height: 8px;
                        background: rgba(40, 0, 0, 0.85);
                        border-radius: 50%;
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                    "></div>
                </div>
                <div style="
                    width: 10px;
                    height: 4px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 50%;
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    animation: pin-shadow 0.5s ease-out forwards;
                "></div>
            </div>
        `,
        iconAnchor: [12, 28],
        iconSize: [24, 30],
    });
}