import { useEffect, useState } from "react";
import type { GeoJsonObject } from "geojson";
import type { BuildingData } from "../types/types";

const BASE_URL = "http://localhost:8080/api";

export function useBuildingData(building: string) {
    const [data, setData] = useState<BuildingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!building) return;
        setLoading(true);
        setError(null);

        fetch(`${BASE_URL}/buildings/search?q=${encodeURIComponent(building)}`)
            .then((res) => res.json())
            .then((results) => {
                const found = results[0];
                if (!found) throw new Error(`Building "${building}" not found`);

                const outline = {
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

                setData({
                    id: found.id,
                    name: found.name,
                    floors: found.floors,
                    isAccessible: found.isAccessible,
                    tags: found.tags,
                    outline,
                });
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error loading building:", err);
                setError("Failed to load building data.");
                setLoading(false);
            });
    }, [building]); // only re-fetches if building name changes

    return { data, loading, error };
}