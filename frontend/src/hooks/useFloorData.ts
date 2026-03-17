import { useEffect, useState } from "react";
import type { FloorData } from "../types/types";


export function useFloorData(floor: number, building: string) {
    const [data, setData] = useState<FloorData>({
        buildingOutline: null,
        units: null,
        paths: null,
        pois: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const BASE_PATH = `/${building}/floor${floor}`;

    useEffect(() => {
        setLoading(true);
        setError(null);

        const urls = {
            outline: `${BASE_PATH}/outline.geojson`,
            units: `${BASE_PATH}/units.geojson`,
            paths: `${BASE_PATH}/paths.geojson`,
            pois: `${BASE_PATH}/poi.geojson`,
        };

        Promise.all([
            fetch(urls.outline).then((res) => res.json()),
            fetch(urls.units).then((res) => res.json()),
            fetch(urls.paths).then((res) => res.json()),
            fetch(urls.pois).then((res) => res.json()),
        ])
            .then(([buildingOutline, units, paths, pois]) => {
                setData({ buildingOutline, units, paths, pois });
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error loading GeoJSON:", err);
                setError("Failed to load floor data.");
                setLoading(false);
            });
    }, [floor]);

    return { ...data, loading, error };
}