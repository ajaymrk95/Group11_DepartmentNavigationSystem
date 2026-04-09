import type { TurnInfo } from "../types/navigationTypes"
import type { Location } from "../../../../types/types"
import { useNavigate } from "react-router-dom"

type Props = {
  turnInfo: TurnInfo
  distance: number | null
  totalDistanceText: string
  start?: Location | null
  end: Location | null
  onEnd: () => void
}

export default function NavigationOverlay({
  turnInfo,
  distance,
  totalDistanceText,
  start: _start,
  end,
  onEnd
}: Props) {
  const navigate = useNavigate()

  const distLabel = distance !== null
    ? (distance < 1000
        ? Math.round(distance) + " m"
        : (distance / 1000).toFixed(1) + " km")
    : "…"

  const turnIcon = {
    left: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A3263" strokeWidth="2.5">
        <path d="M9 15l-6-6 6-6" />
        <path d="M20 21v-7a4 4 0 00-4-4H3" />
      </svg>
    ),
    right: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A3263" strokeWidth="2.5">
        <path d="M15 15l6-6-6-6" />
        <path d="M4 21v-7a4 4 0 014-4h13" />
      </svg>
    ),
    arrive: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A3263" strokeWidth="2.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    straight: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A3263" strokeWidth="2.5">
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
      <div className="md:hidden absolute bottom-8 left-4 right-4 z-[2000]">
        <div className="bg-[#0B2D72]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FAB95B] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(250,185,91,0.3)]">
              {turnIcon}
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[#FAB95B] text-2xl font-black leading-none">
                  {distLabel}
                </span>
                <span className="text-[#F6E7BC] text-sm font-bold">
                  {turnLabel}
                </span>
              </div>
              <div className="text-[#F6E7BC]/60 text-xs truncate mt-1">
                {totalDistanceText} total • {end?.name}
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full pt-1">
            {end?.buildingName && (
              <button
                onClick={() => {
                  const buildingSlug = end.buildingName!.toLowerCase();
                  const params = new URLSearchParams();
                  if (end.buildingEntranceLat != null && end.buildingEntranceLng != null) {
                    params.set('startLng', String(end.buildingEntranceLng));
                    params.set('startLat', String(end.buildingEntranceLat));
                    params.set('startFloor', '1');
                  }
                  if (end.latitude != null && end.longitude != null) {
                    params.set('endLng', String(end.longitude));
                    params.set('endLat', String(end.latitude));
                    params.set('endFloor', String(end.floor || 1));
                  }
                  navigate(`/indoor-navigation/${buildingSlug}?${params.toString()}`);
                }}
                className="flex-1 bg-[#FAB95B] text-[#1A3263] text-sm font-bold py-2.5 rounded-xl hover:bg-[#f9aa3d] transition-colors"
              >
                Go inside
              </button>
            )}

            <button
              onClick={onEnd}
              className="flex-1 bg-red-500/15 border border-red-500/30 text-[#ff6b7a] text-sm font-bold py-2.5 rounded-xl hover:bg-red-500/25 transition-colors"
            >
              End Navigation
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:block absolute top-6 left-1/2 -translate-x-1/2 z-[2000] w-[450px]">
        <div className="bg-[#0B2D72]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FAB95B] flex items-center justify-center shrink-0">
              {turnIcon}
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[#FAB95B] text-xl font-black leading-none">
                  {distLabel}
                </span>
                <span className="text-[#F6E7BC] text-sm font-bold">
                  {turnLabel}
                </span>
              </div>
              <div className="text-[#F6E7BC]/60 text-xs truncate mt-1">
                {totalDistanceText} total • {end?.name}
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              {end?.buildingName && (
                <button
                  onClick={() => {
                    const buildingSlug = end.buildingName!.toLowerCase();
                    const params = new URLSearchParams();
                    if (end.buildingEntranceLat != null && end.buildingEntranceLng != null) {
                      params.set('startLng', String(end.buildingEntranceLng));
                      params.set('startLat', String(end.buildingEntranceLat));
                      params.set('startFloor', '1');
                    }
                    if (end.latitude != null && end.longitude != null) {
                      params.set('endLng', String(end.longitude));
                      params.set('endLat', String(end.latitude));
                      params.set('endFloor', String(end.floor || 1));
                    }
                    navigate(`/indoor-navigation/${buildingSlug}?${params.toString()}`);
                  }}
                  className="bg-[#FAB95B] text-[#1A3263] text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#f9aa3d] transition-colors"
                >
                  Go Inside
                </button>
              )}

              <button
                onClick={onEnd}
                className="bg-red-500/15 border border-red-500/30 text-[#ff6b7a] text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-red-500/25 transition-colors"
              >
                End
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}