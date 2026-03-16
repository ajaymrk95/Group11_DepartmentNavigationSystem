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