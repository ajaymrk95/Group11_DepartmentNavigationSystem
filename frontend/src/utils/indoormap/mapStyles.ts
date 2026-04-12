import type { Feature } from "geojson";
import type { PathOptions } from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { RouteLatLngs } from "../../types/types";

export const buildingOutlineStyle: PathOptions = {
    fillColor: "#E8E2DB",
    fillOpacity: 0.4,
    color: "#1f2937",
    weight: 4,
    opacity: 1,
};

export const routeStyle: PathOptions = {
    color: "#3b82f6",
    weight: 5,
    opacity: 0.85,
    lineCap: "round" as const,
    lineJoin: "round" as const,
};

export function getUnitStyle(feature: Feature | undefined): PathOptions {
    const category = feature?.properties?.category;

    switch (category) {
        case "toilet":
            return {
                fillColor: "#fee2e2",
                fillOpacity: 0.7,
                color: "#000000",
                weight: 2,
                opacity: 1,
            };
        case "classroom":
            return {
                fillColor: "#dbeafe",
                fillOpacity: 0.6,
                color: "#000000",
                weight: 2,
                opacity: 1,
            };
        default:
            return {
                fillColor: "#f3f4f6",
                fillOpacity: 0.6,
                color: "#000000",
                weight: 2,
                opacity: 1,
            };
    }
}

export function getPathStyle(feature: Feature | undefined): PathOptions {
    const type = feature?.properties?.type;

    switch (type) {
        case "entry":
            return {
                color: "#616569",
                weight: 5,
                opacity: 0.9,
                lineCap: "round",
                lineJoin: "round",
            };
        case "stairs":
            return {
                color: "#000000",
                weight: 5,
                opacity: 0.9,
                lineCap: "round",
                lineJoin: "round",
                dashArray: "8, 8",
            };
        case "rentry":
            return {
                color: "#616569",
                weight: 3,
                opacity: 0.7,
                lineCap: "round",
                lineJoin: "round",
                dashArray: "4, 4",
            };
        case "c":
        default:
            return {
                color: "#616569",
                weight: 4,
                opacity: 0.8,
                lineCap: "round",
                lineJoin: "round",
            };
    }
}

interface AnimatedPolylineProps {
    positions: RouteLatLngs;
}

// ── Path geometry helpers ──────────────────────────────────────────────────

type PathPoint = { lat: number; lng: number; bearing: number; cumDist: number };

function buildPath(pts: L.LatLng[]): { path: PathPoint[]; totalDist: number } {
    let totalDist = 0;
    const path: PathPoint[] = [];

    for (let i = 0; i < pts.length; i++) {
        if (i === 0) {
            path.push({ lat: pts[0].lat, lng: pts[0].lng, bearing: 0, cumDist: 0 });
        } else {
            const a = pts[i - 1];
            const b = pts[i];
            const dx = b.lng - a.lng;
            const dy = b.lat - a.lat;
            const d = Math.sqrt(dx * dx + dy * dy);
            // bearing: 0° = north (up), 90° = east, matches CSS rotate()
            const bearing = Math.atan2(dx, dy) * (180 / Math.PI);
            totalDist += d;
            path.push({ lat: b.lat, lng: b.lng, bearing, cumDist: totalDist });
        }
    }
    // First point gets same bearing as first segment
    if (path.length > 1) path[0].bearing = path[1].bearing;

    return { path, totalDist };
}

function getAtDist(path: PathPoint[], totalDist: number, d: number): { lat: number; lng: number; bearing: number } {
    d = ((d % totalDist) + totalDist) % totalDist; // wrap

    for (let i = 1; i < path.length; i++) {
        if (path[i].cumDist >= d) {
            const prev = path[i - 1];
            const curr = path[i];
            const segLen = curr.cumDist - prev.cumDist;
            const t = segLen === 0 ? 0 : (d - prev.cumDist) / segLen;
            return {
                lat: prev.lat + (curr.lat - prev.lat) * t,
                lng: prev.lng + (curr.lng - prev.lng) * t,
                bearing: curr.bearing,
            };
        }
    }
    return path[path.length - 1];
}

function makeArrowheadIcon(): L.DivIcon {
    return L.divIcon({
        className: "",
        html: `<div class="arrow-rotator" style="width:18px;height:18px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.45));">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="12,2 21,20 12,15 3,20"
                    fill="#FAB95B" stroke="#1A3263" stroke-width="2" stroke-linejoin="round"/>
            </svg>
        </div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });
}



export function AnimatedPolyline({ positions }: AnimatedPolylineProps) {
    const map = useMap();
    const markersRef = useRef<L.Marker[]>([]);
    const animRef = useRef<number | null>(null);

    useEffect(() => {
        if (!positions || positions.length < 2) return;

        const pts = positions.map(p => L.latLng(p[0], p[1]));
        const { path, totalDist } = buildPath(pts);
        if (totalDist === 0) return;

        // Highlighted path line
        const routeLine = L.polyline(positions, {
            color: "#3b82f6",
            weight: 5,
            opacity: 0.55,
            lineCap: "round",
            lineJoin: "round",
        }).addTo(map);

        // Single arrow marker
        const N = 1;
        const dists: number[] = [0];
        const markers: L.Marker[] = [];

        for (let i = 0; i < N; i++) {
            const p = getAtDist(path, totalDist, dists[i]);
            const m = L.marker([p.lat, p.lng], {
                icon: makeArrowheadIcon(),
                interactive: false,
                zIndexOffset: 1000,
            }).addTo(map);
            markers.push(m);

            const el = (m as any)._icon as HTMLElement | null;
            const rotator = el?.querySelector(".arrow-rotator") as HTMLElement | null;
            if (rotator) rotator.style.transform = `rotate(${p.bearing}deg)`;
        }
        markersRef.current = markers;

        const SPEED = totalDist / 130;

        function animate() {
            for (let i = 0; i < N; i++) {
                dists[i] = (dists[i] + SPEED) % totalDist;
                const p = getAtDist(path, totalDist, dists[i]);

                markers[i].setLatLng([p.lat, p.lng]);

                const el = (markers[i] as any)._icon as HTMLElement | null;
                const rotator = el?.querySelector(".arrow-rotator") as HTMLElement | null;
                if (rotator) rotator.style.transform = `rotate(${p.bearing}deg)`;
            }
            animRef.current = requestAnimationFrame(animate);
        }

        animRef.current = requestAnimationFrame(animate);

        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            markers.forEach(m => map.removeLayer(m));
            map.removeLayer(routeLine);
            markersRef.current = [];
        };
    }, [map, positions]);

    return null;
}

