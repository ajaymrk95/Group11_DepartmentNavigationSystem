import type { Dispatch, SetStateAction } from "react"
import TileSwitcher from "../../../../components/searchcomponents/TileSwitcher"

type TileType = "light" | "standard" | "satelite"

type Props = {
  tileType: TileType
  setTileType: Dispatch<SetStateAction<TileType>>
  isPanelOpen: boolean
  setIsPanelOpen: Dispatch<SetStateAction<boolean>>
}

export default function TopControls({
  tileType,
  setTileType,
  isPanelOpen,
  setIsPanelOpen
}: Props) {
  return (
    <div className="absolute top-4 right-4 z-[3000] flex items-center gap-2">

      {/* Tile switcher */}
      <TileSwitcher tileType={tileType} setTileType={setTileType} />

      {/* Back button */}
      {!isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="md:hidden bg-[#0B2D72] text-[#F6E7BC] px-4 py-2.5 rounded-full shadow-xl font-semibold border border-[rgba(255,255,255,0.1)] flex items-center gap-2 hover:bg-[#FAB95B] hover:text-[#1A3263] transition-colors text-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}
    </div>
  )
}