import { useState } from "react";
import type { Location } from "../../data/locations";
import SearchResults from "./SearchResults";

type Props = {
  onSelect: (location: Location) => void;
  onFocusSearch?: () => void;
};

const filters = [
  "Faculty",
  "Labs",
  "Classrooms",
  "Toilets",
  "Offices",
  "Indoor",
  "Outdoor",
];

export default function SearchBar({
  onSelect,
  onFocusSearch,
}: Props) {

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  async function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);


    if (value.trim() === "") {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/locations/search?q=${value}`);
      const data = await res.json();

      const mapped = data.map((loc : any ) => ({
        id : loc.id,
        name : loc.name,
        room : loc.room,
        type : loc.type,
        category : loc.category,
        description : loc.description,
        coords: [loc.latitude, loc.longitude] as [number, number],
        tag: loc.tag || [],
        floor : loc.floor,
      }));

      setResults(mapped);
    } catch (err) {
        console.error("Search failed:", err);
    }
  }

  async function handleFilter(filter: string) {
    onFocusSearch?.();
    setActiveFilter(filter);

    try {
      const res = await fetch(`http://localhost:8080/locations/search?q=${filter}`);
      const data = await res.json();

      const mapped = data.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        room: loc.room,
        type: loc.type,
        category: loc.category,
        description: loc.description,
        coords: [loc.latitude, loc.longitude] as [number, number],
        tag: loc.tag || [],
        floor: loc.floor,
      }));

      setResults(mapped);
    } catch (err) {
      console.error("Filtering failed: ", err);
    }

  }

  function handleSelect(loc: Location) {
    setQuery(loc.name);
    setResults([]);
    setActiveFilter(null);
    onSelect(loc);
  }

return ( <div className="
   bg-[#E8E2DB]
   p-4
   rounded-xl
   shadow-md
   relative
   transition-all
   duration-200
 ">


  {/* Search Input */}
  <div className="relative">

    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3" />
    </svg>

    <input
      type="text"
      placeholder="Search location..."
      value={query}
      onChange={handleSearch}
      onFocus={onFocusSearch}
      className="
        w-full pl-10 pr-4 py-2.5
        rounded-lg
        border border-gray-200
        bg-white
        text-[#1a305b]
        placeholder-gray-500
        shadow-sm
        focus:outline-none
        focus:ring-2 focus:ring-[#f0b35a]
        focus:border-transparent
        transition-all duration-200
      "
    />

  </div>

  {/* Filters Label */}
  <div className="mt-5 mb-2 text-sm font-semibold text-[#1a305b]">
    Filters
  </div>

  {/* Filters */}
  <div className="flex flex-wrap gap-2">

    {filters.map((filter) => {
      const isActive = activeFilter === filter;

      return (
        <button
          key={filter}
          onClick={() => handleFilter(filter)}
          className={`
            px-4 py-1.5
            text-sm
            rounded-full
            border
            transition-all duration-150
            hover:scale-[1.03]
            active:scale-[0.96]
            ${
              isActive
                ? "bg-[#f0b35a] border-[#f0b35a] text-[#1a305b]"
                : "bg-[#e9e4d9] border-gray-200 text-[#1a305b] hover:bg-[#f0b35a]/40"
            }
          `}
        >
          {filter}
        </button>
      );
    })}

  </div>

  {/* Search Results */}
  <div className="relative z-10">
    <SearchResults
      results={results}
      onSelect={handleSelect}
    />
  </div>

</div>


);
}
