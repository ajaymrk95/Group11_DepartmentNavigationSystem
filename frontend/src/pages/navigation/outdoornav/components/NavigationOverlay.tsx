import type { TurnInfo } from "../types/navigationTypes"
import type { Location } from "../../../../types/types"

type Props = {
  turnInfo: TurnInfo
  distance: number | null
  totalDistanceText: string
  end: Location | null
  onEnd: () => void
}

export default function NavigationOverlay({
  turnInfo,
  distance,
  totalDistanceText,
  end,
  onEnd
}: Props) {

  const distLabel = distance !== null
    ? (distance < 1000
        ? Math.round(distance) + " m"
        : (distance / 1000).toFixed(1) + " km")
    : "…"

  const turnIcon = {
    left: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A3263" strokeWidth="2.5">
        <path d="M9 15l-6-6 6-6" />
        <path d="M20 21v-7a4 4 0 00-4-4H3" />
      </svg>
    ),
    right: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A3263" strokeWidth="2.5">
        <path d="M15 15l6-6-6-6" />
        <path d="M4 21v-7a4 4 0 014-4h13" />
      </svg>
    ),
    arrive: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A3263" strokeWidth="2.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    straight: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A3263" strokeWidth="2.5">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    ),
  }[turnInfo.direction]

  const turnLabel = {
    left: "Turn left",
    right: "Turn right",
    arrive: "Arriving",
    straight: "Go straight"
  }[turnInfo.direction]

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden absolute bottom-20 left-3 right-3 z-[2000]">
        <div className="bg-[#0B2D72]/95 backdrop-blur-sm border border-[rgba(255,255,255,0.12)] rounded-2xl shadow-2xl flex items-center gap-3 px-3 py-2.5">
          
          <div className="w-9 h-9 rounded-xl bg-[#FAB95B] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(250,185,91,0.35)]">
            {turnIcon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[#F6E7BC] text-[13px] font-semibold">
                {turnLabel} in
              </span>

              <span className="text-[#FAB95B] text-base font-black leading-none">
                {distLabel}
              </span>

              <span className="text-[rgba(246,231,188,0.5)] text-[11px]">
                {totalDistanceText} total
              </span>
            </div>

            <div className="text-[rgba(246,231,188,0.45)] text-[11px] truncate mt-0.5">
              {end?.name}
            </div>
          </div>

          <button
            onClick={onEnd}
            className="shrink-0 bg-[rgba(255,107,122,0.15)] border border-[rgba(255,107,122,0.35)] text-[#ff6b7a] text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[rgba(255,107,122,0.28)] transition-colors"
          >
            End
          </button>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex absolute top-5 left-1/2 -translate-x-1/2 z-[2000] items-center gap-2.5 bg-[#0B2D72]/95 backdrop-blur-sm border border-[rgba(255,255,255,0.12)] rounded-full shadow-2xl px-4 py-2">
        
        <div className="w-7 h-7 rounded-full bg-[#FAB95B] flex items-center justify-center shrink-0">
          {turnIcon}
        </div>

        <span className="text-[#FAB95B] font-black text-sm whitespace-nowrap">
          {distLabel}
        </span>

        <span className="text-[#F6E7BC] text-sm font-semibold whitespace-nowrap">
          · {turnLabel} ·
        </span>

        <span className="text-[rgba(246,231,188,0.55)] text-sm truncate max-w-[150px]">
          {end?.name}
        </span>

        <button
          onClick={onEnd}
          className="shrink-0 bg-[rgba(255,107,122,0.15)] border border-[rgba(255,107,122,0.35)] text-[#ff6b7a] text-xs font-bold px-3 py-1 rounded-full hover:bg-[rgba(255,107,122,0.28)] transition-colors"
        >
          End
        </button>
      </div>
    </>
  )
}