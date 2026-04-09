import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import IndoorMap from "../../components/indoornavigation/IndoorMap";
import { RouteControls } from "../../components/indoornavigation/RouteControls";
import { useNavigation } from "../../hooks/useNavigate";
import { useBuildingData } from "../../hooks/useBuildingData";
import { FloorProvider } from "../../context/FloorContext";
import { useEffect, useState, useRef } from "react";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

type BuildingOption = { id: number; name: string; slug: string };

// ── Building Switcher Dropdown ──
function BuildingSwitcher({ current, buildings }: { current: string; buildings: BuildingOption[] }) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const currentBuilding = buildings.find(b => b.slug === current);

    return (
        <div className="relative" ref={ref}>
            <div className="flex items-center gap-2.5">
                {/* Home button replaces the icon */}
                <button
                    onClick={() => navigate("/")}
                    title="Home"
                    className="w-9 h-9 rounded-xl bg-[rgba(255,255,255,0.06)] flex items-center justify-center shrink-0 text-[rgba(246,231,188,0.5)] transition-colors hover:bg-[rgba(250,185,91,0.2)] hover:text-[#FAB95B]"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>
                </button>

                {/* Building name + dropdown trigger */}
                <button
                    onClick={() => setOpen(prev => !prev)}
                    className="flex items-center gap-1.5 group text-left"
                    aria-haspopup="listbox"
                    aria-expanded={open}
                >
                    <div>
                        <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[rgba(246,231,188,0.45)] leading-none mb-0.5">Building</div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[18px] font-extrabold text-[#FAB95B] tracking-tight leading-none">
                                {currentBuilding?.name ?? current.toUpperCase()}
                            </span>
                            <svg
                                className={`w-4 h-4 text-[rgba(246,231,188,0.5)] transition-transform duration-200 mt-0.5 ${open ? "rotate-180" : ""}`}
                                fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                            >
                                <path d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </button>
            </div>

            {open && buildings.length > 0 && (
                <div className="absolute top-full left-0 mt-2 z-[9999] min-w-[200px] bg-[#0B2D72] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="px-3 py-2 border-b border-white/[0.07]">
                        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[rgba(246,231,188,0.35)]">Switch Building</p>
                    </div>
                    <div className="max-h-56 overflow-y-auto py-1">
                        {buildings.map(b => (
                            <button
                                key={b.id}
                                onClick={() => { navigate(`/indoor-navigation/${b.slug}`); setOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${b.slug === current
                                    ? "bg-[rgba(250,185,91,0.15)] text-[#FAB95B]"
                                    : "text-[#F6E7BC] hover:bg-white/5"
                                    }`}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M3 9h18M3 15h18" /></svg>
                                <span className="text-[13px] font-semibold">{b.name}</span>
                                {b.slug === current && (
                                    <svg className="ml-auto w-3.5 h-3.5 text-[#FAB95B]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Inner component — lives inside FloorProvider so useFloor() works ──
function NavigationContent({
    building,
    urlFromCoords, urlToCoords, urlFromFloor, urlToFloor
}: any) {
    const navigate = useNavigate();
    const { data: buildingData } = useBuildingData(building);
    const [buildings, setBuildings] = useState<BuildingOption[]>([]);

    const buildingEntries: [number, number][] = buildingData?.entries
        ? (buildingData.entries as any).coordinates ?? []
        : [];

    const { from, to, route, routeSegments,
        noRouteFound, fromCoords, toCoords, fromFloor, toFloor,
        setFrom, setTo, onDataLoad, findPath
    } = useNavigation();

    // Fetch all buildings for the switcher
    useEffect(() => {
        fetch(`${API_BASE}/buildings`)
            .then(res => res.json())
            .then(data => {
                const options: BuildingOption[] = data.map((b: any) => ({
                    id: b.id,
                    name: b.name,
                    slug: b.name.toLowerCase().replace(/\s+/g, "-"),
                }));
                setBuildings(options);
            })
            .catch(err => console.error("Failed to fetch buildings", err));
    }, []);

    useEffect(() => {
        if (buildingData?.id && urlFromCoords && urlToCoords && urlFromFloor !== null && urlToFloor !== null) {
            findPath(urlFromCoords, urlToCoords, urlFromFloor, urlToFloor, buildingData.id);
        }
    }, [buildingData, urlFromCoords, urlToCoords]);

    return (
        <div className="w-full h-screen flex flex-col font-[Outfit] bg-[#0B2D72] overflow-hidden">

            {/* ── Header ── */}
            <header className="bg-[#0B2D72] border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.3)] px-4 sm:px-6 py-4 z-[2000] shrink-0">

                {/* ── Desktop: single row ── */}
                <div className="hidden lg:flex items-center gap-6 w-full">
                    {/* Left */}
                    <div className="shrink-0">
                        <BuildingSwitcher current={building} buildings={buildings} />
                    </div>
                    {/* Center */}
                    <div className="flex-1 min-w-0 flex justify-center">
                        <RouteControls
                            from={from} to={to}
                            noRouteFound={noRouteFound}
                            setFrom={setFrom} setTo={setTo}
                            onFindPath={findPath}
                            buildingId={buildingData?.id ?? 0}
                            buildingEntries={buildingEntries}
                        />
                    </div>
                    {/* Right */}
                    <div className="shrink-0">
                        <button
                            onClick={() => navigate("/outdoor-navigation")}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAB95B] text-[#1A3263] text-[13px] font-bold tracking-wide transition-all hover:bg-[#f9aa3d] shadow-md"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
                            Outdoor View
                        </button>
                    </div>
                </div>

                {/* ── Mobile: two rows ── */}
                <div className="flex flex-col gap-3 lg:hidden">
                    {/* Row 1 */}
                    <div className="flex items-center justify-between w-full gap-3">
                        <BuildingSwitcher current={building} buildings={buildings} />
                        <button
                            onClick={() => navigate("/outdoor-navigation")}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAB95B] text-[#1A3263] text-[13px] font-bold tracking-wide transition-all hover:bg-[#f9aa3d] shadow-md shrink-0"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
                            Outdoor View
                        </button>
                    </div>
                    {/* Row 2: route controls */}
                    <RouteControls
                        from={from} to={to}
                        noRouteFound={noRouteFound}
                        setFrom={setFrom} setTo={setTo}
                        onFindPath={findPath}
                        buildingId={buildingData?.id ?? 0}
                        buildingEntries={buildingEntries}
                    />
                </div>
            </header>

            {/* ── Map area ── */}
            <div className="flex-1 min-h-0 min-w-0 bg-[#f0f2f5]">
                <IndoorMap
                    building={building}
                    route={route}
                    routeSegments={routeSegments}
                    fromCoords={fromCoords}
                    toCoords={toCoords}
                    fromFloor={fromFloor}
                    toFloor={toFloor}
                    onDataLoad={onDataLoad}
                />
            </div>
        </div>
    );
}

// ── Outer component — owns the provider ──
export function NavigationPage() {
    const { building } = useParams<{ building: string }>();
    const [searchParams] = useSearchParams();
    const initialFloor = Number(searchParams.get("floor")) || 1;

    const startLng = searchParams.get("startLng");
    const startLat = searchParams.get("startLat");
    const endLng = searchParams.get("endLng");
    const endLat = searchParams.get("endLat");
    const startFloor = searchParams.get("startFloor");
    const endFloor = searchParams.get("endFloor");

    const urlFromCoords: [number, number] | null = (startLng && startLat) ? [Number(startLng), Number(startLat)] : null;
    const urlToCoords: [number, number] | null = (endLng && endLat) ? [Number(endLng), Number(endLat)] : null;
    const urlFromFloor = startFloor ? Number(startFloor) : null;
    const urlToFloor = endFloor ? Number(endFloor) : null;

    if (!building) return null;

    return (
        <FloorProvider initialFloor={initialFloor}>
            <NavigationContent
                building={building}
                urlFromCoords={urlFromCoords}
                urlToCoords={urlToCoords}
                urlFromFloor={urlFromFloor}
                urlToFloor={urlToFloor}
            />
        </FloorProvider>
    );
}

export default NavigationPage;