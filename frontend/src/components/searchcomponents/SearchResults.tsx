import type { Location } from "../../types/types"

type Props = {
  results: Location[]
  onSelect: (location: Location) => void
  searchQuery?: string
}

export default function SearchResults({ results, onSelect, searchQuery = "" }: Props) {

  if (results.length === 0) return null

  return (
    <ul className="
      mt-3
      bg-white
      border border-gray-200
      rounded-xl
      shadow-xl
      max-h-60
      overflow-y-auto
      divide-y divide-gray-100
      animate-[fadeIn_0.15s_ease-out]
    ">
      {results.map((loc, index) => {
        // Find matched tag
        const lowerQ = searchQuery.toLowerCase()
        const matchedTag = lowerQ
          ? loc.tag?.find(t => t.toLowerCase().includes(lowerQ))
          : null

        // Build subtitle: building name + room/floor
        const parts: string[] = []
        if (loc.buildingName) parts.push(loc.buildingName)
        if (loc.room) parts.push(`Room ${loc.room}`)
        if (loc.floor != null) parts.push(`Floor ${loc.floor}`)
        const subtitle = parts.join(" · ")

        return (
          <li
            key={index}
            onClick={() => onSelect(loc)}
            className="
              px-4 py-3
              cursor-pointer
              transition-all duration-150
              hover:bg-[#f0b35a]/20
              active:bg-[#f0b35a]/30
              hover:pl-5
            "
          >
            {/* Top row: name (left) | matched tag pill (right) */}
            <div className="flex justify-between items-center gap-2">
              <h3 className="font-semibold text-[#1a305b] text-md truncate">
                {loc.name.toUpperCase()}
              </h3>

              {matchedTag ? (
                <span className="shrink-0 inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FAB95B] text-[#1a305b] shadow-sm">
                  {matchedTag}
                </span>
              ) : loc.tag && loc.tag.length > 0 ? (
                <span className="shrink-0 inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#1A3263]/8 text-[#547792] border border-[#1A3263]/15">
                  {loc.tag[0]}
                </span>
              ) : null}
            </div>

            {/* Subtitle: building name · room · floor */}
            {subtitle && (
              <div className="text-xs text-gray-500 mt-0.5 truncate">
                {subtitle}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
