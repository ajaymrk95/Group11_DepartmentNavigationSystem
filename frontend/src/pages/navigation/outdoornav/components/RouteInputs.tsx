import type { Dispatch, SetStateAction } from "react"
import type { Location } from "../../../../types/types"
import SearchBar from "../../../../components/searchcomponents/SearchBar"

type Props = {
  start: Location | null
  end: Location | null
  setStart: Dispatch<SetStateAction<Location | null>>
  setEnd: Dispatch<SetStateAction<Location | null>>
  handleSwap: () => void
}

export default function RouteInputs({
  start,
  end,
  setStart,
  setEnd,
  handleSwap
}: Props) {
  return (
    <div className="relative">

      {/* Start */}
      <div className="relative z-20">
        <SearchBar
          label="Starting point…"
          onSelect={setStart}
          iconType="start"
          selectedLoc={start}
          showQr
          useQrResult
          showFilters={false}
          showMyLocation
        />
      </div>

      {/* Connector */}
      <div className="absolute left-[18px] top-[52px] bottom-[52px] w-px bg-[rgba(246,231,188,0.15)] z-10" />

      {/* Swap */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30">
        <button
          onClick={handleSwap}
          className="w-9 h-9 rounded-full bg-[#FAB95B] text-[#1A3263] flex items-center justify-center shadow-[0_4px_12px_rgba(250,185,91,0.4)] hover:scale-110 transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {/* End */}
      <div className="relative z-10 pt-2">
        <SearchBar
          label="Destination…"
          onSelect={setEnd}
          iconType="end"
          selectedLoc={end}
          showQr={false}
          useQrResult={false}
          showFilters={false}
          showMyLocation={false}
        />
      </div>

    </div>
  )
}