import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import IndoorMap from "../../components/indoornavigation/IndoorMap";
import { RouteControls } from "../../components/indoornavigation/RouteControls";
import { useNavigation } from "../../hooks/useNavigate";
import { HomeIcon } from "../../components/icons/HomeIcon";

export function NavigationPage() {
    const { building } = useParams<{ building: string }>();
    const [searchParams] = useSearchParams();
    const floor = Number(searchParams.get("floor")) || 1;
    const navigate = useNavigate();

    const { from, to, route, noRouteFound, setFrom, setTo, onDataLoad } = useNavigation();

    return (
        <div className="w-full h-screen flex flex-col bg-gray-100">
            <header className="bg-[#1A3263] shadow-md px-4 py-3 z-10 flex items-center justify-between gap-4 flex-wrap shrink-0">

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
                    floorNo={floor}
                    route={route}
                    onDataLoad={onDataLoad}
                />
            </div>
        </div>
    );
}

export default NavigationPage;