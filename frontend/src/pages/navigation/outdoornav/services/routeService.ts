export async function fetchRoute(start: any, end: any) {
  const res = await fetch(
    `http://localhost:8080/api/routes/navigate?startLat=${start.latitude}&startLng=${start.longitude}&endLat=${end.latitude}&endLng=${end.longitude}`
  )

  if (!res.ok) throw new Error("Route not found.")

  return res.json()
}