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

        const urls = {
            outline: `${BASE_URL}/buildings/search?q=${building}`,
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
            .then(([buildingResults, units, paths, pois]) => {
                const found = buildingResults[0];

                if (!found) throw new Error(`Building "${building}" not found`);

                // sanitize: convert geom string → GeoJSON FeatureCollection
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