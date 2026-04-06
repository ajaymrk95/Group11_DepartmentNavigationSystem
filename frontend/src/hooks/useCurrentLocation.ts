import { useEffect, useState } from "react"

export function useCurrentLocation() {
  const [location, setLocation] = useState<[number, number] | null>(null)
  const [heading, setHeading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported")
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation([pos.coords.latitude, pos.coords.longitude])
        if (pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
          setHeading(pos.coords.heading)
        }
      },
      (err) => {
        setError(err.message)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return { location, heading, error }
}
