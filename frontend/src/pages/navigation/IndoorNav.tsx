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
        <div className="w-full h-screen flex flex-col bg-gray-100">
            <header className="bg-[#1A3263] shadow-md px-4 py-3 z-[2000] flex items-center justify-between gap-4 flex-wrap shrink-0">
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => navigate("/")}
                        className="text-[#9DBAD0] hover:text-[#E8E2DB] transition-colors duration-200"
                        aria-label="Go to home"
                    >
                        <HomeIcon className="w-10 h-10" />
                    </button>
                    <h1 className="text-3xl font-bold text-[#E8E2DB]">
                        {building}
                    </h1>
                </div>
                <div className="flex-1">
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
                    className="shrink-0 border border-[#E8E2DB] text-[#E8E2DB] hover:bg-[#E8E2DB] hover:text-[#1A3263] font-semibold text-sm px-3 py-1.5 rounded-md transition-colors duration-200"
                >
                    Outdoor View
                </button>
            </header>
            <div className="flex-1 min-h-0 min-w-0">
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