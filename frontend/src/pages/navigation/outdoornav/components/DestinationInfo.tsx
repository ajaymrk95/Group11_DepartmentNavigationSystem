import type { Location } from "../../../../types/types"
import locationImage from "../../../../assets/image.png"

type Props = {
  end: Location | null
  distanceText: string
  distanceMeters: number | null
  isLoadingRoute: boolean
}

// Walking speed ~5 km/h = 83.33 m/min
function formatWalkTime(meters: number): string {
  const minutes = Math.round(meters / 83.33)
  if (minutes < 1) return "< 1 min"
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export default function DestinationInfo({
  end,
  distanceText,
  distanceMeters,
  isLoadingRoute
}: Props) {
  const walkTime = distanceMeters != null ? formatWalkTime(distanceMeters) : null

  return (
    <>
      {/* Destination card */}
      {end && (
        <div className="mx-6 mt-5 rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] shrink-0">
          
          <div className="h-36 overflow-hidden relative">
            <img src={locationImage} alt="Location" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B2D72] to-transparent" />

            <div className="absolute bottom-3 left-4 right-4">
              <div className="flex items-end justify-between">
                
                <h3 className="text-[#F6E7BC] font-bold text-base leading-tight truncate">
                  {end.name}
                </h3>

                {end.category && (
                  <span className="shrink-0 ml-2 px-2.5 py-0.5 rounded-full bg-[#FAB95B] text-[#1A3263] text-[10px] font-bold uppercase tracking-wide">
                    {end.category}
                  </span>
                )}

              </div>
            </div>
          </div>

          <div className="px-4 py-3 flex flex-col gap-2">

            {end.category === "INDOOR" && (end.room || end.floor !== undefined) && (
              <div className="flex gap-3 text-[11px] text-[rgba(246,231,188,0.5)] font-mono">
                {end.room && <span>Room {end.room}</span>}
                {end.floor !== undefined && <span>Floor {end.floor}</span>}
              </div>
            )}

            {end.description && (
              <p className="text-[12px] text-[rgba(246,231,188,0.6)] leading-relaxed">
                {end.description}
              </p>
            )}

            {end.tag && end.tag.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {end.tag.map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[rgba(246,231,188,0.1)] text-[rgba(246,231,188,0.6)] border border-[rgba(246,231,188,0.12)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Distance + ETA badge */}
      {distanceText && !isLoadingRoute && (
        <div className="mx-6 mt-3 relative flex items-center justify-between p-5 bg-gradient-to-br from-[#27407a] to-[#1c2d5e] border border-white/10 rounded-2xl shadow-xl transition-transform duration-300 hover:scale-[1.02] group">

          {/* Left section */}
          <div className="flex items-center gap-5">

            {/* Walking icon */}
            <div className="flex items-center justify-center w-12 h-12 bg-[#FAB95B]/15 rounded-full">
              <div
                className="w-6 h-6 bg-[#FAB95B]"
                style={{
                  WebkitMask: "url('/walking-man.svg') no-repeat center",
                  mask: "url('/walking-man.svg') no-repeat center",
                  WebkitMaskSize: "contain",
                  maskSize: "contain"
                }}
              />
            </div>

            {/* Text */}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="text-blue-100/80 text-sm font-medium">
                  Arrives in
                </span>

                {walkTime && (
                  <span className="text-[#FAB95B] text-2xl font-bold tracking-tight">
                    {walkTime}
                  </span>
                )}
              </div>

              <span className="text-blue-200/60 text-sm font-medium mt-0.5 flex items-center gap-1.5">
                
                {/* Location dot icon */}
                <svg
                  className="w-3 h-3 text-blue-300/80"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"/>
                </svg>

                {distanceText} • Walking
              </span>
            </div>
          </div>

          {/* Right arrow */}
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/20 group-hover:bg-white/20 transition-all">
        <span className="text-white text-base font-bold leading-none">
          ➜
        </span>
      </div>

  </div>
  )}
    </>
  )
}