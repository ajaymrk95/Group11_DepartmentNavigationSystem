import { useRef, useState } from "react"
import type { Location } from "../../data/locations"
import SearchBar from "./SearchBar"
import { useNavigate } from "react-router-dom"
import locationImage from "../../assets/image.png"

type Props = {
  locations: Location[]
  selectedLocation: Location | null
  onSelectLocation: (location: Location | null) => void
}

const SUGGESTED_IDS = [2, 5, 6, 4]

export default function MobileLocationSheet({
  locations,
  selectedLocation,
  onSelectLocation
}: Props) {

  const sheetRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const screenHeight = window.innerHeight
  const PEEK = 100
  const HALF = screenHeight * 0.55
  const FULL = screenHeight

  const [height, setHeight] = useState(PEEK)
  const startY = useRef(0)
  const startHeight = useRef(0)
  const isDragging = useRef(false)

  const suggested = locations.filter(l => SUGGESTED_IDS.includes(l.id))
  const isExpanded = height > PEEK + 10
  const showBottomBtn = height >= HALF - 20

  function setSheetHeight(h: number) {
    if (!sheetRef.current) return
    sheetRef.current.style.height = `${h}px`
  }

  function handleSearchFocus() {
    setHeight(FULL)
    setSheetHeight(FULL)
    onSelectLocation(null)
  }

  function handleSelect(location: Location) {
    onSelectLocation(location)
    setHeight(HALF)
    setSheetHeight(HALF)
  }

  function handlePeekClick() {
    if (!isDragging.current) {
      setHeight(FULL)
      setSheetHeight(FULL)
    }
  }

  function startDrag(clientY: number) {
    isDragging.current = false
    startY.current = clientY
    startHeight.current = sheetRef.current?.offsetHeight || PEEK
    window.addEventListener("touchmove", onTouchMove)
    window.addEventListener("touchend", stopDrag)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", stopDrag)
  }

  function onTouchStart(e: React.TouchEvent) { startDrag(e.touches[0].clientY) }
  function onMouseDown(e: React.MouseEvent) { startDrag(e.clientY) }

  function updateHeight(clientY: number) {
    const delta = startY.current - clientY
    if (Math.abs(delta) > 5) isDragging.current = true
    let newHeight = startHeight.current + delta
    if (newHeight < PEEK) newHeight = PEEK
    if (newHeight > FULL) newHeight = FULL
    setSheetHeight(newHeight)
  }

  function onTouchMove(e: TouchEvent) { updateHeight(e.touches[0].clientY) }
  function onMouseMove(e: MouseEvent) { updateHeight(e.clientY) }

  function stopDrag() {
    const currentHeight = sheetRef.current?.offsetHeight || PEEK
    const distPeek = Math.abs(currentHeight - PEEK)
    const distHalf = Math.abs(currentHeight - HALF)
    const distFull = Math.abs(currentHeight - FULL)
    const snapped = distPeek < distHalf && distPeek < distFull ? PEEK
      : distHalf < distFull ? HALF : FULL
    setHeight(snapped)
    setSheetHeight(snapped)

    window.removeEventListener("touchmove", onTouchMove)
    window.removeEventListener("touchend", stopDrag)
    window.removeEventListener("mousemove", onMouseMove)
    window.removeEventListener("mouseup", stopDrag)

    setTimeout(() => { isDragging.current = false }, 50)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .mls-top-fab {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 30;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: 100px;
          border: none;
          background: #0B2D72;
          color: #F6E7BC;
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(11, 45, 114, 0.35);
          transition: all 0.22s ease;
        }

        .mls-top-fab:hover { background: #FAB95B; color: #1A3263; }
        .mls-top-fab:active { transform: scale(0.95); }

        /* ── SHEET ── */
        .mls-sheet {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 50;
          border-radius: 24px 24px 0 0;
          background: #0B2D72;
          box-shadow: 0 -16px 48px rgba(0, 0, 0, 0.5);
          border-top: 1px solid rgba(255,255,255,0.08);
          font-family: 'Outfit', sans-serif;
          display: flex;
          flex-direction: column;
          transition: height 0.35s cubic-bezier(0.32, 0.72, 0, 1);
        }

        /* ── HANDLE ROW ── */
        .mls-handle-row {
          position: relative;
          display: flex;
          align-items: center;
          padding: 10px 24px 14px;
          touch-action: none;
          cursor: grab;
          flex-shrink: 0;
          user-select: none;
        }

        .mls-drag-pill {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 36px;
          height: 4px;
          border-radius: 100px;
          background: rgba(246, 231, 188, 0.2);
        }

        .mls-peek-title {
          font-size: 24px;
          font-weight: 900;
          color: #F6E7BC;
          letter-spacing: -0.03em;
          margin-top: 8px;
        }

        .mls-peek-sub {
          font-size: 15px;
          color: rgba(246, 231, 188, 0.55);
          font-weight: 400;
          margin-top: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 260px;
        }

        /* ── BODY ── */
        .mls-body {
          flex: 1;
          overflow-y: auto;
          padding: 4px 20px 8px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mls-body::-webkit-scrollbar { width: 3px; }
        .mls-body::-webkit-scrollbar-thumb {
          background: rgba(246, 231, 188, 0.15);
          border-radius: 4px;
        }

        .mls-section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #0AC4E0;
          margin-bottom: 8px;
        }

        .mls-suggestions { display: flex; flex-direction: column; gap: 7px; }

        .mls-suggestion-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 11px;
          background: rgba(246, 231, 188, 0.05);
          border: 1px solid rgba(246, 231, 188, 0.08);
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .mls-suggestion-item:hover {
          background: rgba(246, 231, 188, 0.1);
          border-color: rgba(246, 231, 188, 0.15);
        }

        .mls-suggestion-icon {
          width: 28px; height: 28px;
          border-radius: 7px;
          background: rgba(10, 196, 224, 0.12);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: #0AC4E0;
        }

        .mls-suggestion-info { flex: 1; min-width: 0; }

        .mls-suggestion-name {
          font-size: 12px; font-weight: 600; color: #F6E7BC;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .mls-suggestion-meta { font-size: 10px; color: rgba(246,231,188,0.4); margin-top: 1px; }

        /* ── CARD ── */
        .mls-card {
          background: #EDE8DC; border-radius: 14px; overflow: hidden;
          border: 1px solid rgba(200,192,176,0.5);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
          flex-shrink: 0; transition: transform 0.2s ease;
        }
        .mls-card:hover { transform: translateY(-2px); }
        .mls-card-img { height: 130px; overflow: hidden; }
        .mls-card-img img { width:100%; height:100%; object-fit:cover; transition: transform 0.3s ease; }
        .mls-card:hover .mls-card-img img { transform: scale(1.04); }
        .mls-card-body { padding: 14px 16px; display:flex; flex-direction:column; gap:7px; }
        .mls-card-name { font-size:15px; font-weight:700; color:#1A3263; letter-spacing:-0.01em; }
        .mls-card-meta { display:flex; gap:14px; }
        .mls-card-meta span { font-size:11px; font-weight:600; color:rgba(26,50,99,0.5); letter-spacing:0.04em; text-transform:uppercase; }
        .mls-card-desc { font-size:12px; color:rgba(26,50,99,0.65); line-height:1.55; }
        .mls-card-tags { display:flex; flex-wrap:wrap; gap:5px; padding-top:2px; }
        .mls-tag { font-size:10px; font-weight:500; background:rgba(26,50,99,0.08); color:#1A3263; border:1px solid rgba(26,50,99,0.12); padding:3px 9px; border-radius:100px; }

        /* ── STICKY BOTTOM BUTTON ── */
        .mls-footer {
          padding: 12px 20px 28px;
          flex-shrink: 0;
          position: sticky;
          bottom: 0;
          background: transparent;
          pointer-events: none;
        }

        .mls-nav-btn {
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
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          transition: all 0.22s ease;
          pointer-events: all;
        }

        .mls-nav-btn:hover { background: #FAB95B; box-shadow: 0 8px 24px rgba(250,185,91,0.35); }
        .mls-nav-btn:active { transform: scale(0.97); }
        .mls-nav-btn svg { transition: transform 0.2s ease; }
        .mls-nav-btn:hover svg { transform: translateX(3px); }
      `}</style>

      {/* Top FAB — hidden once panel reaches halfway */}
      {!showBottomBtn && (
        <button className="mls-top-fab" onClick={() => navigate("/outdoor-navigation")}>
          Start Navigating
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </button>
      )}

      {/* Bottom sheet */}
      <div ref={sheetRef} className="mls-sheet" style={{ height: PEEK }}>

        {/* Handle row — tap to expand, drag to resize */}
        <div
          className="mls-handle-row"
          onTouchStart={onTouchStart}
          onMouseDown={onMouseDown}
          onClick={handlePeekClick}
        >
          <div className="mls-drag-pill" />
          <div>
            <div className="mls-peek-title">View Map</div>
            {!isExpanded
              ? <div className="mls-peek-sub">Tap to expand!</div>
              : <div className="mls-peek-sub">Search or tap a location</div>
            }
          </div>
        </div>

        {/* Body */}
        {isExpanded && (
          <div className="mls-body">

            <SearchBar
              locations={locations}
              onSelect={handleSelect}
              onFocusSearch={handleSearchFocus}
            />

            {!selectedLocation && (
              <div>
                <div className="mls-section-label">Frequently Visited</div>
                <div className="mls-suggestions">
                  {suggested.map(loc => (
                    <div key={loc.id} className="mls-suggestion-item" onClick={() => handleSelect(loc)}>
                      <div className="mls-suggestion-icon">
                        {loc.type === "building" ? (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h6"/>
                          </svg>
                        ) : (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 3v11l-3 3h12l-3-3V3"/><path d="M6 3h12"/>
                          </svg>
                        )}
                      </div>
                      <div className="mls-suggestion-info">
                        <div className="mls-suggestion-name">{loc.name}</div>
                        <div className="mls-suggestion-meta">{loc.tag?.[0]} · {loc.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedLocation && (
              <div className="mls-card">
                <div className="mls-card-img">
                  <img src={locationImage} alt="Location" />
                </div>
                <div className="mls-card-body">
                  <div className="mls-card-name">{selectedLocation.name}</div>
                  <div className="mls-card-meta">
                    <span>Room {selectedLocation.room}</span>
                    {selectedLocation.floor !== undefined && (
                      <span>Floor {selectedLocation.floor}</span>
                    )}
                  </div>
                  {selectedLocation.description && (
                    <p className="mls-card-desc">{selectedLocation.description}</p>
                  )}
                  {selectedLocation.tag && (
                    <div className="mls-card-tags">
                      {selectedLocation.tag.map(tag => (
                        <span key={tag} className="mls-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Sticky bottom button — appears when panel reaches halfway */}
        {showBottomBtn && (
          <div className="mls-footer">
            <button className="mls-nav-btn" onClick={() => navigate("/outdoor-navigation")}>
              Start Navigating
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </button>
          </div>
        )}

      </div>
    </>
  )
}