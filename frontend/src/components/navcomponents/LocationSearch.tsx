import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import type { Location } from "../../data/locations"
import { useCurrentLocation } from "../../hooks/useCurrentLocation"

type Props = {
  label: string
  onSelect: (loc: Location | null) => void
  iconType?: "start" | "end"
  selectedLoc: Location | null
  showQr?: boolean
  useQrResult?: boolean
}

export default function LocationSearch({ label, onSelect, iconType = "start", selectedLoc, showQr = false, useQrResult = false }: Props) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<Location[]>([]);

  const navigate = useNavigate()
  const location = useLocation()   // added

  const { location: currentCoords } = useCurrentLocation();
  const myLocation: Location | null = currentCoords
  ? {
      id: -1,
      name: "My Location",
      room: "",
      type: "custom",   // ⚠️ must exist in your enum
      category: "outdoor",
      description: "Your current position",
      coords: currentCoords,
      tag: [],
      floor: 0,
    }
  : null;

  useEffect(() => {
    if (selectedLoc) {
      setQuery(selectedLoc.name)
    } else {
      setQuery("")
    }
  }, [selectedLoc])

  // added: handle QR scan result
  useEffect(() => {
    if (!useQrResult) return
  
    const qrValue = location.state?.qrData
    if (!qrValue) return
  
    async function handleQr() {
      try {
        const res = await fetch(`http://localhost:8080/locations/search?q=${encodeURIComponent(qrValue)}`)
        const data = await res.json();
        
        if (!data.length) {
          console.error("QR location not found:", qrValue)
          return
        }

        const loc = data[0];

        const mapped: Location = {
          id: loc.id,
          name: loc.name,
          room: loc.room,
          type: loc.type,
          category: loc.category,
          description: loc.description,
          coords: [loc.latitude, loc.longitude] as [number, number],
          tag: loc.tag || [],
          floor: loc.floor,
        };

        onSelect(mapped);
        setQuery(mapped.name);
        setOpen(false);

        navigate(location.pathname, { replace: true });

      } catch (err) {
        console.error("QR scanning failed: ", err)
      }

    }

    handleQr();
  
  }, [location.state, useQrResult])


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
          onChange={async (e) => {
            const value = e.target.value;
            setQuery(value);
            setOpen(true);
            
            if(value.trim() === ""){
              setResults([]);
              onSelect(null);
              return;
            }
            
            try {
              const res = await fetch(`http://localhost:8080/locations/search?q=${encodeURIComponent(value)}`)
              const data = await res.json();

              const mapped: Location[] = data.map((loc: any) => ({
                id: loc.id,
                name: loc.name,
                room: loc.room,
                type: loc.type,
                category: loc.category,
                description: loc.description,
                coords: [loc.latitude, loc.longitude],
                tag: loc.tag || [],
                floor: loc.floor,
              }));
          
              setResults(mapped);

            } catch (err) {
              console.error("Search failed:", err);
            }
          }}
          className="
            w-full py-1.5 bg-transparent text-[#1a305b] text-base font-medium
            placeholder:text-[#547792]/60 placeholder:font-normal
            focus:outline-none
          "
        />

        {showQr && (
          <button
            type="button"
            className="ml-2 flex-shrink-0 text-[#1a305b] hover:text-[#547792]"
            onClick={() => navigate("/qr-scanner")}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h6v2H5v4H3V3zm16 0h-6v2h4v4h2V3zM3 21h6v-2H5v-4H3v6zm18-6h-2v4h-4v2h6v-6zM7 7h4v4H7V7zm6 0h4v4h-4V7zm-6 6h4v4H7v-4zm6 0h4v4h-4v-4z"/>
            </svg>
          </button>
        )}
      </div>

      {open && query && (
        <div className="
          absolute mt-2 w-full
          bg-white border border-[#547792]/20
          rounded-xl shadow-2xl
          max-h-60 overflow-y-auto z-[9999]
        ">
          {[...(myLocation ? [myLocation] : []), ...results].map(loc => (
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

          {results.length === 0 && !myLocation && (
            <div className="px-5 py-3 text-base text-[#547792]/70 italic">
              No locations found
            </div>
          )}
        </div>
      )}
    </div>
  )
}