type TileType = "light" | "standard" | "satelite"

type Props = {
  tileType: TileType
  setTileType: (t: TileType) => void
}

export default function TileSwitcher({ tileType, setTileType }: Props) {
  return (
    <button
      onClick={() => {
        const next: TileType =
          tileType === "light" ? "standard" :
          tileType === "standard" ? "satelite" :
          "light"
        setTileType(next)
      }}
      className="
        h-10 w-24
        flex items-center justify-center
        rounded-full
        bg-[#0B2D72] text-[#F6E7BC]
        text-xs font-bold tracking-[0.04em]
        shadow-lg transition-all duration-[220ms] ease-in-out
        hover:bg-[#FAB95B] hover:text-[#1A3263] active:scale-95
      "
      >
      {tileType === "light" && "Light"}
      {tileType === "standard" && "Standard"}
      {tileType === "satelite" && "Satellite"}
    </button>
  )
}