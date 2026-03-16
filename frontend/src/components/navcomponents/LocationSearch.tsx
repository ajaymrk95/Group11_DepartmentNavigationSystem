import { useState, useEffect } from "react"
import type { Location } from "../../data/locations"

type Props = {
  label: string
  locations: Location[]
  onSelect: (loc: Location | null) => void
  iconType?: "start" | "end"
  selectedLoc: Location | null
}

export default function LocationSearch({ label, locations, onSelect, iconType = "start", selectedLoc }: Props) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (selectedLoc) {
      setQuery(selectedLoc.name)
    } else {
      setQuery("")
    }
  }, [selectedLoc])

  const filtered = locations.filter(loc =>
    loc.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="relative w-full">
      <div className="
        flex items-center bg-white 
        border border-[#547792]/30 rounded-xl shadow-sm
        px-4 py-2 focus-within:ring-2 focus-within:ring-[#547792] focus-within:border-transparent
        transition-all
      ">
        <div className="flex-shrink-0 w-6 flex justify-center mr-3">
          {iconType === "start" ? (
            <div className="w-4 h-4 rounded-full border-[4px] border-[#547792]"></div>
          ) : (
             <svg className="w-5 h-5 text-[#1a305b]" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
             </svg>
          )}
        </div>

        <input
          value={query}
          placeholder={label}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            if (e.target.value === "") {
              onSelect(null)
            }
          }}
          className="
            w-full py-1.5 bg-transparent text-[#1a305b] text-base font-medium
            placeholder:text-[#547792]/60 placeholder:font-normal
            focus:outline-none
          "
        />
      </div>

      {open && query && (
        <div className="
          absolute mt-2 w-full
          bg-white border border-[#547792]/20
          rounded-xl shadow-2xl
          max-h-60 overflow-y-auto z-[9999]
        ">
          {filtered.map(loc => (
            <div
              key={loc.id}
              className="px-5 py-3 text-base text-[#1a305b] cursor-pointer hover:bg-[#e9e4d9] transition-colors border-b border-gray-100 last:border-0"
              onClick={() => {
                onSelect(loc)
                setQuery(loc.name)
                setOpen(false)
              }}
            >
              {loc.name}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-5 py-3 text-base text-[#547792]/70 italic">
              No locations found
            </div>
          )}
        </div>
      )}
    </div>
  )
}