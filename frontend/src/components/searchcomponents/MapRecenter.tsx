import { useEffect } from "react"
import { useMap } from "react-leaflet"
import type { Location } from "../../types/types"

type Props = {
    location: Location | null
}

export default function MapRecenter({ location }: Props) {
    const map = useMap()
    useEffect(() => {
        if (!location || location.latitude == null || location.longitude == null) return
        map.flyTo([location.latitude, location.longitude], 18, {
            duration: 1.5
        })
    }, [location, map])
    return null
}