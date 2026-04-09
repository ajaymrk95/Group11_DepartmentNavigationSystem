import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import IndoorMap from "../../components/indoornavigation/IndoorMap";
import { RouteControls } from "../../components/indoornavigation/RouteControls";
import { useNavigation } from "../../hooks/useNavigate";
import { useBuildingData } from "../../hooks/useBuildingData";
import { HomeIcon } from "../../components/icons/HomeIcon";
import { FloorProvider } from "../../context/FloorContext";
import { useEffect } from "react";

// ── Inner component — lives inside FloorProvider so useFloor() works ──
function NavigationContent({ 
    building,
    urlFromCoords, urlToCoords, urlFromFloor, urlToFloor
 }: any) {
    const navigate = useNavigate();
    const { data: buildingData } = useBuildingData(building);

    const buildingEntries: [number, number][] = buildingData?.entries
        ? (buildingData.entries as any).coordinates ?? []
        : [];

    const { from, to, route, routeSegments,
        noRouteFound, fromCoords, toCoords, fromFloor, toFloor,
        setFrom, setTo, onDataLoad, findPath
    } = useNavigation();

    useEffect(() => {
        // Only trigger if we have building data AND all necessary URL coordinates
        if (buildingData?.id && urlFromCoords && urlToCoords && urlFromFloor !== null && urlToFloor !== null) {
            findPath(
                urlFromCoords,
                urlToCoords,
                urlFromFloor,
                urlToFloor,
                buildingData.id
            );

        }
    }, [buildingData, urlFromCoords, urlToCoords]);

    return (
        <div className="w-full h-screen flex flex-col font-[Outfit] bg-[#1A3263] overflow-hidden">
            <header className="bg-[#1A3263] border-b border-white/10 shadow-lg px-4 sm:px-6 py-4 z-[2000] flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 shrink-0 w-full overflow-y-auto max-h-[50vh] lg:max-h-none lg:overflow-visible custom-scrollbar">
                <div className="flex items-center justify-between w-full lg:w-auto gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/")}
                            className="text-[#9DBAD0] hover:text-white transition-colors duration-[180ms]"
                            aria-label="Go to home"
                        >
                            <HomeIcon className="w-8 h-8 sm:w-9 sm:h-9" />
                        </button>
                        <h1 className="text-[clamp(20px,2vw,30px)] font-bold text-[#FAB95B] tracking-tight truncate">
                            {buildingData?.name ?? building}
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate("/outdoor-navigation")}
                        className="lg:hidden shrink-0 bg-[#FAB95B] text-[#1A3263] hover:bg-[#e6a850] font-bold text-[13px] px-4 py-2 rounded-full shadow-md transition-all duration-[220ms]"
                    >
                        Outdoor View
                    </button>
                </div>
                <div className="w-full lg:flex-1 flex justify-center max-w-max lg:max-w-4xl mx-auto">
                    <RouteControls
                        from={from}
                        to={to}
                        noRouteFound={noRouteFound}
                        setFrom={setFrom}
                        setTo={setTo}
                        onFindPath={findPath}
                        buildingId={buildingData?.id ?? 0}
                        buildingEntries={buildingEntries}
                    />
                </div>
                <button
                    onClick={() => navigate("/outdoor-navigation")}
                    className="hidden lg:block shrink-0 bg-[#FAB95B] text-[#1A3263] hover:bg-[#e6a850] font-bold text-[14px] px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-[220ms] tracking-wide"
                >
                    Outdoor View
                </button>
            </header>
            <div className="flex-1 min-h-0 min-w-0 bg-[#f4f7f6]">
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