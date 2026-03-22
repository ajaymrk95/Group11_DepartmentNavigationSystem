import { useEffect, useState } from "react";
import type { FloorData } from "../types/types";
import type { GeoJsonObject } from "geojson";

const BASE_URL = "http://localhost:8080/api";

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

        // First fetch building to get its id
        fetch(`${BASE_URL}/buildings/search?q=${encodeURIComponent(building)}`)
            .then((res) => res.json())
            .then((buildingResults) => {
                const found = buildingResults[0];
                if (!found) throw new Error(`Building "${building}" not found`);

                const buildingOutline = {
                    type: "FeatureCollection",
                    features: [
                        {
                            type: "Feature",
                            properties: {
                                id: found.id,
                                name: found.name,
                                floors: found.floors,
                                isAccessible: found.isAccessible,
                                tags: found.tags,
                            },
                            geometry: JSON.parse(found.geom),
                        },
                    ],
                } as GeoJsonObject;

                // Fetch units from API, paths and pois from local files
                return Promise.all([
                    fetch(`${BASE_URL}/rooms?buildingId=${found.id}&floor=${floor}`).then((res) => res.json()),
                    fetch(`${BASE_PATH}/paths.geojson`).then((res) => res.json()),
                    fetch(`${BASE_PATH}/poi.geojson`).then((res) => res.json()),
                ]).then(([units, paths, pois]) => {
                    setData({ buildingOutline, units, paths, pois });
                    setLoading(false);
                });
            })
            .catch((err) => {
                console.error("Error loading GeoJSON:", err);
                setError("Failed to load floor data.");
                setLoading(false);
            });
    }, [floor, building]);

    return { ...data, loading, error };
}