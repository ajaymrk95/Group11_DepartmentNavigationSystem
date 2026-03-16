  import { useEffect } from "react"
  import { useMap } from "react-leaflet"

  type Props = {
    center: [number, number]
  }

  export default function MapRecenter({ center }: Props) {
    const map = useMap()

    useEffect(() => {
      map.setView(center, map.getZoom(), {
        animate: true
      })
    }, [center, map])

    return null
  }
