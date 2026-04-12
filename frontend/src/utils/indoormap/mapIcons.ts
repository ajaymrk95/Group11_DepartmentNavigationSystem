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
    const isUp = direction === "up";
    const bounceAnim = isUp ? "-5px" : "5px";
    const chevron = isUp
        ? `<path d="M5 15l7-7 7 7" stroke="#FAB95B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<path d="M5 9l7 7 7-7" stroke="#FAB95B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;

    return L.divIcon({
        className: "",
        html: `
            <style>
                @keyframes stair-arrow-${direction} {
                    0%, 100% { transform: translateY(0); opacity: 1; }
                    50%       { transform: translateY(${bounceAnim}); opacity: 0.5; }
                }
                @keyframes stair-ring-${direction} {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(250,185,91,0.5), 0 3px 12px rgba(0,0,0,0.5); }
                    60%      { box-shadow: 0 0 0 6px rgba(250,185,91,0), 0 3px 12px rgba(0,0,0,0.5); }
                }
            </style>
            <div style="
                width: 42px; height: 42px;
                background: rgba(10,22,60,0.92);
                border: 2px solid #FAB95B;
                border-radius: 50%;
                display: flex;
                align-items: center; justify-content: center;
                cursor: pointer;
                animation: stair-ring-${direction} 1.8s ease-out infinite;
            ">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                    style="animation: stair-arrow-${direction} 1s ease-in-out infinite;">
                    ${chevron}
                </svg>
            </div>
        `,
        iconAnchor: [21, 21],
        iconSize: [42, 42],
    });
}


export function startIcon() {
    return L.divIcon({
        className: "",
        html: `
            <style>
                @keyframes start-pulse {
                    0%   { box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.35); }
                    50%  { box-shadow: 0 0 0 10px rgba(22, 163, 74, 0.08); }
                    100% { box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.35); }
                }
            </style>
            <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                <div style="
                    width: 18px;
                    height: 18px;
                    background: #16a34a;
                    border: 3px solid rgba(0, 20, 5, 0.9);
                    border-radius: 50%;
                    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.35);
                    animation: start-pulse 2s infinite;
                "></div>
                <div style="
                    background: rgba(10,30,10,0.82);
                    color: #4ade80;
                    font-size: 9px;
                    font-weight: 700;
                    font-family: Outfit, sans-serif;
                    padding: 2px 6px;
                    border-radius: 6px;
                    white-space: nowrap;
                    letter-spacing: 0.04em;
                    border: 1px solid rgba(22,163,74,0.35);
                ">You are here</div>
            </div>
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