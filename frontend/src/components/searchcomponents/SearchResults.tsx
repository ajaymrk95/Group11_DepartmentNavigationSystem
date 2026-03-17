import type { Location } from "../../data/locations"

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


  {results.map((loc) => (

    <li
      key={loc.id}
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

      <div className="font-medium text-[#1a305b]">
        {loc.name}
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
