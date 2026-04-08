import { useEffect, useState } from "react";
import type { FloorLayerData } from "../types/types";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;



export function useFloorData(buildingId: number | null, floor: number, building: string) {
    const [data, setData] = useState<FloorLayerData>({
        units: null,
        paths: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!buildingId) return;

        setData((prev) => ({ ...prev, loading: true, error: null }));

        Promise.all([
            fetch(`${BASE_URL}/rooms?buildingId=${buildingId}&floor=${floor}`).then((res) => res.json()),
            fetch(`${BASE_URL}/paths/floor?buildingId=${buildingId}&floor=${floor}`).then((res) => res.json()),
        ])
            .then(([units, paths]) => {
                setData({ units, paths, loading: false, error: null });
            })
            .catch((err) => {
                console.error("Error loading floor data:", err);
                setData((prev) => ({ ...prev, loading: false, error: "Failed to load floor data." }));
            });
    }, [buildingId, floor]); // only re-fetches when floor or buildingId changes

    return data;
}