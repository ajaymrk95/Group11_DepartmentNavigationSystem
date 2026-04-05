import L from "leaflet";
import { getUnitStyle, getPathStyle } from "./mapStyles";

// ─── Popup Builders ────────────────────────────────────────────────────────────

function wrap(content: string): string {
    return `<div class="p-3 min-w-[150px]">${content}</div>`;
}

function row(label: string, value: string): string {
    return `<div class="mb-1"><strong>${label}:</strong> ${value}</div>`;
}


export function buildUnitPopup(props: Record<string, unknown>): string {
    const categoryIcons: Record<string, string> = {
        classroom: "🏫",
        toilet: "🚻",
        office: "🏢",
        lab: "🔬",
    };

    let body = "";
    if (props.name) body += `<div class="font-bold text-lg mb-2">${props.name}</div>`;
    if (props.room_no) body += row("Room Number", String(props.room_no));
    if (props.category) {
        const icon = categoryIcons[String(props.category)] ?? "📦";
        body += row("Category", `${icon} ${props.category}`);
    }
    if (props.level) body += row("Level", String(props.level));
    return wrap(body);
}

export function buildPathPopup(props: Record<string, unknown>): string {
    const typeLabels: Record<string, string> = {
        entry: "🚪 Main Entry",
        c: "🚶 Corridor",
        rentry: "🔑 Room Entry",
        stairs: "🪜 Stairs",
    };

    const typeLabel = typeLabels[String(props.type)] ?? String(props.type ?? "");
    let body = `<div class="font-bold text-lg mb-2">${typeLabel}</div>`;
    if (props.name) body += row("Name", String(props.name));
    if (props.id) body += row("ID", String(props.id));
    body += `<div class="mt-2"><strong>Navigable:</strong> ${props.navigable === "y" ? "✅ Yes" : "❌ No"}</div>`;
    return wrap(body);
}

export function buildPOIPopup(props: Record<string, unknown>): string {
    const typeLabels: Record<string, string> = {
        entry: "🚪 Building Entry",
        rentry: "🚪 Room Entry",
        room: "🏠 Room",
        stairs: "🪜 Stairs",
    };

    const typeLabel = typeLabels[String(props.type)] ?? String(props.type ?? "");
    let body = "";
    if (props.name) body += `<div class="font-bold text-lg mb-2">${props.name}</div>`;
    body += row("Type", typeLabel);
    body += `<div class="mt-2"><strong>Accessible:</strong> ${props.access === "y" ? "✅ Yes" : "❌ No"}</div>`;
    return wrap(body);
}

// ─── onEachFeature Factories ───────────────────────────────────────────────────

export function onEachUnit(feature: any, layer: L.Layer) {
    layer.bindPopup(buildUnitPopup(feature.properties ?? {}));

    layer.on({
        mouseover: (e) => e.target.setStyle({ fillOpacity: 0.9, weight: 3 }),
        mouseout: (e) => e.target.setStyle(getUnitStyle(feature)),
    });
}

export function onEachPath(feature: any, layer: L.Layer) {
    layer.bindPopup(buildPathPopup(feature.properties ?? {}));

    layer.on({
        mouseover: (e) => {
            const base = getPathStyle(feature);
            e.target.setStyle({ weight: (base.weight ?? 3) + 2, opacity: 1 });
        },
        mouseout: (e) => e.target.setStyle(getPathStyle(feature)),
    });
}