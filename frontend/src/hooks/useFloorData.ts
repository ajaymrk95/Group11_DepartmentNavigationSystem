import { useEffect, useState } from "react";
import type { FloorLayerData } from "../types/types";

const BASE_URL = "http://localhost:8080/api";



export function useFloorData(buildingId: number | null, floor: number, building: string) {
    const [data, setData] = useState<FloorLayerData>({
        units: null,
        paths: null,
        pois: null,
        loading: true,
        error: null,
    });

    const BASE_PATH = `/${building}/floor${floor}`;

    useEffect(() => {
        if (!buildingId) return;

        setData((prev) => ({ ...prev, loading: true, error: null }));

        Promise.all([
            fetch(`${BASE_URL}/rooms?buildingId=${buildingId}&floor=${floor}`).then((res) => res.json()),
            fetch(`${BASE_URL}/paths?buildingId=${buildingId}&floor=${floor}`).then((res) => res.json()),
            fetch(`${BASE_PATH}/poi.geojson`).then((res) => res.ok ? res.json() : null),
        ])
            .then(([units, paths, pois]) => {
                setData({ units, paths, pois, loading: false, error: null });
            })
            .catch((err) => {
                console.error("Error loading floor data:", err);
                setData((prev) => ({ ...prev, loading: false, error: "Failed to load floor data." }));
            });
    }, [buildingId, floor]); // only re-fetches when floor or buildingId changes

    return data;
}