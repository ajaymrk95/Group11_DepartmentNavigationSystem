import { useNavigate } from "react-router-dom"
import type { Location } from "../../data/locations"
import SearchBar from "./SearchBar"
import locationImage from "../../assets/image.png"

type Props = {
  locations: Location[]
  selectedLocation: Location | null
  onSelectLocation: (location: Location | null) => void
}

export default function RoutePanel({locations, selectedLocation, onSelectLocation }: Props) {

  const navigate = useNavigate()

  function clearSelectedLocation() {
    onSelectLocation(null)
  }

return ( <div className="
   h-full w-full flex flex-col
   bg-[#1A3263]
   border-r border-[#2d4a7a]
   p-6
   shadow-[10px_0_35px_rgba(0,0,0,0.45)]
   backdrop-blur-[2px]
 ">


  {/* Section Title */}
  <p className="text-xs font-semibold tracking-widest uppercase text-[#e9e4d9]/60 mb-5">
    Find a Location
  </p>

  <div className="flex flex-col gap-6">

    <SearchBar
      locations={locations}
      onSelect={onSelectLocation}
      onFocusSearch={clearSelectedLocation}
    />

    {selectedLocation && (

      <div className="
        bg-[#e9e4d9]
        rounded-xl
        overflow-hidden
        border border-[#c8c0b0]
        shadow-xl
        transition-all duration-200
        hover:-translate-y-[2px]
      ">

        <div className="h-48 overflow-hidden">
          <img
            src={locationImage}
            alt="Location"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.04]"
          />
        </div>

        <div className="p-5 space-y-3">

          <h3 className="text-lg font-semibold text-[#1A3263] leading-snug">
            {selectedLocation.name}
          </h3>

          <div className="flex gap-4 text-xs font-medium text-[#1A3263]/60">
            <p>Room {selectedLocation.room}</p>

            {selectedLocation.floor !== undefined && (
              <p>Floor {selectedLocation.floor}</p>
            )}
          </div>

          {selectedLocation.description && (
            <p className="text-sm text-[#1A3263]/70 leading-relaxed">
              {selectedLocation.description}
            </p>
          )}

          {selectedLocation.tag && (

            <div className="flex flex-wrap gap-2 pt-2">

              {selectedLocation.tag.map(tag => (

                <span
                  key={tag}
                  className="
                    text-xs
                    font-medium
                    bg-[#1A3263]/10
                    text-[#1A3263]
                    border border-[#1A3263]/10
                    px-3 py-1
                    rounded-full
                    transition-colors duration-200
                    hover:bg-[#1A3263]/20
                  "
                >
                  {tag}
                </span>

              ))}

            </div>

          )}

        </div>

      </div>

    )}

  </div>

  {/* Navigation Button */}
  <div className="mt-auto pt-10">

    <button
      onClick={() => navigate("/outdoor-navigation")}
      className="
        w-full flex items-center justify-between
        px-6 py-4
        rounded-full
        bg-[#e9e4d9]
        text-[#1A3263]
        text-sm font-bold tracking-wide
        shadow-md
        transition-all duration-200
        hover:bg-[#f0b35a]
        hover:shadow-2xl
        active:scale-[0.96]
      "
    >

      Start Navigating

      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
      </svg>

    </button>

  </div>

</div>


)
}
