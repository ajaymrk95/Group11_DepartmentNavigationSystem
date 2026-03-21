import { useState } from "react";
import { searchLocations } from "../../utils/searchLocation";
import type { Location } from "../../data/locations";
import SearchResults from "./SearchResults";

type Props = {
  locations: Location[];
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

export default function SearchBar({ locations, onSelect, onFocusSearch }: Props) {

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setResults([]);
      return;
    }

    const matches = searchLocations(value, locations);
    setResults(matches);
  }

  function handleFilter(filter: string) {
    onFocusSearch?.();
    setActiveFilter(filter);

    const matches = locations.filter(
      (loc) => loc.tag && loc.tag.includes(filter)
    );
    setResults(matches);
  }

  function handleSelect(loc: Location) {
    setQuery(loc.name);
    setResults([]);
    setActiveFilter(null);
    onSelect(loc);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .sb-root {
          background: #EDE8DC;
          border: 1px solid rgba(200, 192, 176, 0.4);
          padding: 14px;
          border-radius: 16px;
          position: relative;
          font-family: 'Outfit', sans-serif;
        }

        /* ── INPUT ── */
        .sb-input-wrap {
          position: relative;
        }

        .sb-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(26, 50, 99, 0.4);
          width: 16px;
          height: 16px;
          pointer-events: none;
        }

        .sb-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          border-radius: 100px;
          border: 1px solid rgba(26, 50, 99, 0.15);
          background: #fff;
          color: #1A3263;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 400;
          outline: none;
          transition: all 0.18s ease;
        }

        .sb-input::placeholder {
          color: rgba(26, 50, 99, 0.35);
        }

        .sb-input:focus {
          background: rgba(255, 255, 255, 0.1);
          border-color: #0AC4E0;
          box-shadow: 0 0 0 3px rgba(10, 196, 224, 0.12);
        }

        /* ── FILTERS ── */
        .sb-filter-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #547792;
          margin: 14px 0 8px;
        }

        .sb-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .sb-filter-btn {
          padding: 5px 14px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'Outfit', sans-serif;
          border-radius: 100px;
          border: 1px solid rgba(26, 50, 99, 0.15);
          background: rgba(26, 50, 99, 0.06);
          color: #547792;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .sb-filter-btn:hover {
          background: #FAB95B;
          color: #1A3263;
          border-color: #FAB95B;
          font-weight: 600;
        }

        .sb-filter-btn:active { transform: scale(0.96); }

        .sb-filter-btn.active {
          background: #FAB95B;
          border-color: #FAB95B;
          color: #1A3263;
          font-weight: 700;
        }

        /* ── RESULTS ── */
        .sb-results {
          position: relative;
          z-index: 10;
          margin-top: 8px;
        }
      `}</style>

      <div className="sb-root">

        {/* Search input */}
        <div className="sb-input-wrap">
          <svg className="sb-input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3"/>
          </svg>
          <input
            className="sb-input"
            type="text"
            placeholder="Search location..."
            value={query}
            onChange={handleSearch}
            onFocus={onFocusSearch}
          />
        </div>

        {/* Filters */}
        <div className="sb-filter-label">Filters</div>
        <div className="sb-filters">
          {filters.map(filter => (
            <button
              key={filter}
              className={`sb-filter-btn${activeFilter === filter ? " active" : ""}`}
              onClick={() => handleFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="sb-results">
          <SearchResults results={results} onSelect={handleSelect} />
        </div>

      </div>
    </>
  );
}