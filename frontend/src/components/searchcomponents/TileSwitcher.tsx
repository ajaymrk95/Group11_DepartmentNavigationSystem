type TileType = "light" | "standard" | "satelite"

type Props = {
  tileType: TileType
  setTileType: React.Dispatch<React.SetStateAction<TileType>>
}

export default function TileSwitcher({ tileType, setTileType }: Props) {
  return (
    <button
      onClick={() => {
        setTileType(prev =>
          prev === "light" ? "standard" :
          prev === "standard" ? "satelite" :
          "light"
        )
      }}
      className="
        px-4 py-2 rounded-full
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