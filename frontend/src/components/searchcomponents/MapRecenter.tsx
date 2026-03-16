import { useEffect } from "react"
import { useMap } from "react-leaflet"
import type { Location } from "../../data/locations"

type Props = {
  location: Location | null
}

export default function MapRecenter({ location }: Props) {
  const map = useMap()

  useEffect(() => {
    if (!location) return

    map.flyTo(location.coords, 18, {
      duration: 1.5
    })

  }, [location, map])

  return null
}