import { useParams, useSearchParams } from "react-router-dom";
import IndoorMap from "../../components/indoornavigation/IndoorMap";
import { RouteControls } from "../../components/indoornavigation/RouteControls";
import { useNavigation } from "../../hooks/useNavigate";

export function NavigationPage() {
    const { building } = useParams<{ building: string }>();
    const [searchParams] = useSearchParams();
    const floor = Number(searchParams.get("floor")) || 1;

    const { from, to, route, noRouteFound, setFrom, setTo, onDataLoad } = useNavigation();

    return (
        <div className="w-full h-screen flex flex-col bg-gray-100">
            <header className="bg-[#1A3263] shadow-md px-4 py-3 z-10 flex items-center justify-between gap-4 flex-wrap shrink-0">
                <h1 className="text-3xl font-bold text-[#FAB95B] shrink-0 pr-10">
                    {building} — Floor {floor}
                </h1>
                <div className="flex-1">
                    <RouteControls
                        from={from}
                        to={to}
                        noRouteFound={noRouteFound}
                        setFrom={setFrom}
                        setTo={setTo}
                    />
                </div>
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