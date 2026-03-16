import type { Location } from "../../data/locations"
import SearchBar from "./SearchBar"

type Props = {
locations: Location[]
selectedLocation: Location | null
onSelectLocation: (location: Location | null) => void
}

export default function RoutePanel({
locations,
selectedLocation,
onSelectLocation
}: Props) {

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

  </div>
</div>


)
}
