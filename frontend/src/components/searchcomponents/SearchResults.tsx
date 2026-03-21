import type { Location } from "../../types/types"

type Props = {
results: Location[]
onSelect: (location: Location) => void
}

export default function SearchResults({ results, onSelect }: Props) {

if (results.length === 0) return null

return ( <ul className="
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


  {results.map((loc, index) => (

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

      {/* Top row */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-[#1a305b] text-md">
        {loc.name.toUpperCase()}
        </h3>

        <span className={`
          text-xs px-2 py-1 rounded-full
          ${loc.category === "INDOOR"
            ? "bg-blue-100 text-blue-700"
            : "bg-green-100 text-blue-700"}
        `}>
          {loc.category != null && loc.category.toUpperCase()}
        </span>
      </div>

      {loc.tag && (
        <div className="text-xs text-gray-500 mt-0.5">
          {loc.tag.join(", ")}
        </div>
      )}

    </li>

  ))}

</ul>


)
}
