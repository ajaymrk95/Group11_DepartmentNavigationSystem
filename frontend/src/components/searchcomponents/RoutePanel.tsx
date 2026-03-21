import { useNavigate } from "react-router-dom"
import type { Location } from "../../data/locations"
import SearchBar from "./SearchBar"
import locationImage from "../../assets/image.png"

type Props = {
  locations: Location[]
  selectedLocation: Location | null
  onSelectLocation: (location: Location | null) => void
}

const SUGGESTED_IDS = [2, 5, 6, 4] // CSED, Main Building, CCC, NLHC

export default function RoutePanel({ locations, selectedLocation, onSelectLocation }: Props) {

  const navigate = useNavigate()
  const suggested = locations.filter(l => SUGGESTED_IDS.includes(l.id))

  function clearSelectedLocation() {
    onSelectLocation(null)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .rp-root {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          background: #0B2D72;
          border-right: 1px solid rgba(45, 74, 122, 0.6);
          box-shadow: 10px 0 35px rgba(0, 0, 0, 0.35);
          font-family: 'Outfit', sans-serif;
          overflow-y: auto;
        }

        .rp-root::-webkit-scrollbar { width: 4px; }
        .rp-root::-webkit-scrollbar-track { background: transparent; }
        .rp-root::-webkit-scrollbar-thumb {
          background: rgba(246, 231, 188, 0.15);
          border-radius: 4px;
        }

        /* ── HEADER ── */
        .rp-header {
          padding: 28px 24px 20px;
          flex-shrink: 0;
          border-bottom: 1px solid rgba(246, 231, 188, 0.08);
        }

        .rp-header-title {
          font-size: 26px;
          font-weight: 800;
          color: #F6E7BC;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .rp-header-sub {
          font-size: 15px;
          font-weight: 400;
          color: rgba(246, 231, 188, 0.45);
          margin-top: 5px;
          letter-spacing: 0.01em;
        }

        /* ── BODY ── */
        .rp-body {
          padding: 20px 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ── SUGGESTIONS ── */
        .rp-section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #0AC4E0;
          margin-bottom: 10px;
        }

        .rp-suggestions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rp-suggestion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 12px;
          background: rgba(246, 231, 188, 0.05);
          border: 1px solid rgba(246, 231, 188, 0.08);
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .rp-suggestion-item:hover {
          background: rgba(246, 231, 188, 0.1);
          border-color: rgba(246, 231, 188, 0.15);
          transform: translateX(3px);
        }

        .rp-suggestion-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(10, 196, 224, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #0AC4E0;
        }

        .rp-suggestion-info { flex: 1; min-width: 0; }

        .rp-suggestion-name {
          font-size: 13px;
          font-weight: 600;
          color: #F6E7BC;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .rp-suggestion-meta {
          font-size: 11px;
          color: rgba(246, 231, 188, 0.4);
          margin-top: 1px;
        }

        .rp-suggestion-arrow {
          color: rgba(246, 231, 188, 0.25);
          flex-shrink: 0;
        }

        /* ── LOCATION CARD ── */
        .rp-card {
          background: #EDE8DC;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(200, 192, 176, 0.5);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .rp-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
        }

        .rp-card-img {
          height: 160px;
          overflow: hidden;
        }

        .rp-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .rp-card:hover .rp-card-img img { transform: scale(1.04); }

        .rp-card-body {
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rp-card-name {
          font-size: 16px;
          font-weight: 700;
          color: #1A3263;
          letter-spacing: -0.01em;
        }

        .rp-card-meta {
          display: flex;
          gap: 14px;
        }

        .rp-card-meta span {
          font-size: 11px;
          font-weight: 600;
          color: rgba(26, 50, 99, 0.5);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .rp-card-desc {
          font-size: 13px;
          color: rgba(26, 50, 99, 0.65);
          line-height: 1.6;
        }

        .rp-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding-top: 2px;
        }

        .rp-tag {
          font-size: 11px;
          font-weight: 500;
          background: rgba(26, 50, 99, 0.08);
          color: #1A3263;
          border: 1px solid rgba(26, 50, 99, 0.12);
          padding: 3px 10px;
          border-radius: 100px;
          transition: background 0.18s ease;
        }

        .rp-tag:hover { background: rgba(26, 50, 99, 0.16); }

        /* ── FOOTER ── */
        .rp-footer {
          padding: 20px 24px 28px;
          flex-shrink: 0;
          position: sticky;
          bottom: 0;
          background: transparent;
          border-top: none;
          z-index: 10;
          pointer-events: none;
        }

        .rp-footer button {
          pointer-events: all;
        }

        .rp-nav-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-radius: 100px;
          border: none;
          background: #E8E2DB;
          color: #1A3263;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          transition: all 0.22s ease;
        }

        .rp-nav-btn:hover {
          background: #FAB95B;
          box-shadow: 0 8px 24px rgba(250, 185, 91, 0.35);
        }

        .rp-nav-btn:active { transform: scale(0.97); }

        .rp-nav-btn:hover svg {
          transform: translateX(3px);
        }

        .rp-nav-btn svg {
          transition: transform 0.2s ease;
        }
      `}</style>

      <div className="rp-root">

        {/* Header */}
        <div className="rp-header">
          <div className="rp-header-title">View Map</div>
          <div className="rp-header-sub">Search a location to explore</div>
        </div>

        {/* Body */}
        <div className="rp-body">

          {/* Search bar */}
          <div>
            <SearchBar
              locations={locations}
              onSelect={onSelectLocation}
              onFocusSearch={clearSelectedLocation}
            />
          </div>

          {/* Suggestions — only show when nothing selected */}
          {!selectedLocation && (
            <div>
              <div className="rp-section-label">Frequently Visited</div>
              <div className="rp-suggestions">
                {suggested.map(loc => (
                  <div
                    key={loc.id}
                    className="rp-suggestion-item"
                    onClick={() => onSelectLocation(loc)}
                  >
                    <div className="rp-suggestion-icon">
                      {loc.type === "building" ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h6"/>
                        </svg>
                      ) : loc.type === "lab" ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 3v11l-3 3h12l-3-3V3"/><path d="M6 3h12"/>
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        </svg>
                      )}
                    </div>
                    <div className="rp-suggestion-info">
                      <div className="rp-suggestion-name">{loc.name}</div>
                      <div className="rp-suggestion-meta">{loc.tag?.[0]} · {loc.category}</div>
                    </div>
                    <svg className="rp-suggestion-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected location card */}
          {selectedLocation && (
            <div className="rp-card">
              <div className="rp-card-img">
                <img src={locationImage} alt="Location" />
              </div>
              <div className="rp-card-body">
                <div className="rp-card-name">{selectedLocation.name}</div>
                <div className="rp-card-meta">
                  <span>Room {selectedLocation.room}</span>
                  {selectedLocation.floor !== undefined && (
                    <span>Floor {selectedLocation.floor}</span>
                  )}
                </div>
                {selectedLocation.description && (
                  <p className="rp-card-desc">{selectedLocation.description}</p>
                )}
                {selectedLocation.tag && (
                  <div className="rp-card-tags">
                    {selectedLocation.tag.map(tag => (
                      <span key={tag} className="rp-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="rp-footer">
          <button className="rp-nav-btn" onClick={() => navigate("/outdoor-navigation")}>
            Start Navigating
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </button>
        </div>

      </div>
    </>
  )
}
