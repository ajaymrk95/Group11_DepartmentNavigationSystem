import L from "leaflet";
import { getUnitStyle, getPathStyle } from "./mapStyles";

// ─── Popup Builders ────────────────────────────────────────────────────────────

function wrap(content: string): string {
    return `<div class="min-w-[210px] sm:min-w-[230px] font-[Outfit] text-[#1A3263] flex flex-col">${content}</div>`;
}

function row(label: string, value: string): string {
    return `<div class="flex justify-between items-center py-[10px] border-b border-gray-100 last:border-0"><span class="font-bold text-gray-400 text-[11px] sm:text-[12px] uppercase tracking-widest">${label}</span> <span class="font-semibold text-[#1A3263] text-[14px] text-right ml-4">${value}</span></div>`;
}

export function buildUnitPopup(props: Record<string, unknown>): string {
    const categoryIcons: Record<string, string> = {
        classroom: "🏫",
        toilet: "🚻",
        office: "🏢",
        lab: "🔬",
    };

    let body = "";
    if (props.name) body += `<div class="font-extrabold text-[16px] sm:text-[18px] text-[#FAB95B] bg-[#1A3263] py-4 px-5 text-center mb-2 shadow-sm tracking-wide leading-tight">${props.name}</div>`;
    
    body += `<div class="px-4 pb-3">`;
    if (props.room_no) body += row("Room Number", String(props.room_no));
    if (props.category) {
        const icon = categoryIcons[String(props.category)] ?? "📍";
        body += row("Category", `<span class="mr-1">${icon}</span> ${props.category}`);
    }
    if (props.level) body += row("Floor Level", String(props.level));
    body += `</div>`;
    
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
    let body = `<div class="font-extrabold text-[16px] sm:text-[18px] text-[#FAB95B] bg-[#1A3263] py-4 px-5 text-center mb-2 shadow-sm tracking-wide leading-tight">${typeLabel}</div>`;
    
    body += `<div class="px-4 pb-3">`;
    if (props.name) body += row("Path Name", String(props.name));
    const isNav = props.navigable === "y";
    body += row("Navigable", isNav ? '<span class="text-[#28a745] font-bold">Yes</span>' : '<span class="text-[#dc3545] font-bold">No</span>');
    body += `</div>`;
    
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
    if (props.name) {
        body += `<div class="font-extrabold text-[16px] sm:text-[18px] text-[#FAB95B] bg-[#1A3263] py-4 px-5 text-center mb-2 shadow-sm tracking-wide leading-tight">${props.name}</div>`;
    } else {
        body += `<div class="font-extrabold text-[16px] sm:text-[18px] text-[#FAB95B] bg-[#1A3263] py-4 px-5 text-center mb-2 shadow-sm tracking-wide leading-tight">${typeLabel}</div>`;
    }
    
    body += `<div class="px-4 pb-3">`;
    if (props.name) body += row("Type Category", typeLabel);
    const isAcc = props.access === "y";
    body += row("Accessible Area", isAcc ? '<span class="text-[#28a745] font-bold">Yes</span>' : '<span class="text-[#dc3545] font-bold">No</span>');
    body += `</div>`;
    
    return wrap(body);
}

// ─── onEachFeature Factories ───────────────────────────────────────────────────

export function onEachUnit(feature: any, layer: L.Layer) {
    layer.bindPopup(buildUnitPopup(feature.properties ?? {}), { className: "premium-popup" });

    layer.on({
        mouseover: (e) => e.target.setStyle({ fillOpacity: 0.9, weight: 3 }),
        mouseout: (e) => e.target.setStyle(getUnitStyle(feature)),
    });
}

export function onEachPath(feature: any, layer: L.Layer) {
    layer.bindPopup(buildPathPopup(feature.properties ?? {}), { className: "premium-popup" });

    layer.on({
        mouseover: (e) => {
            const base = getPathStyle(feature);
            e.target.setStyle({ weight: (base.weight ?? 3) + 2, opacity: 1 });
        },
        mouseout: (e) => e.target.setStyle(getPathStyle(feature)),
    });
}