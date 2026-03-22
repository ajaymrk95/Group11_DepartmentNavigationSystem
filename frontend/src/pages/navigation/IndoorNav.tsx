import IndoorMap from "../../components/indoornavigation/IndoorMap";
import { useNavigation } from "../../hooks/useNavigate";
import { useParams, useSearchParams } from "react-router-dom";

// All POI names from elhc_poi_1.geojson
const POI_OPTIONS = [
    { value: "entry1", label: "Entry 1" },
    { value: "entry2", label: "Entry 2" },
    { value: "entry3", label: "Entry 3" },
    { value: "101entry1", label: "Room 101 – Door 1" },
    { value: "101entry2", label: "Room 101 – Door 2" },
    { value: "102entry1", label: "Room 102 – Door 1" },
    { value: "102entry2", label: "Room 102 – Door 2" },
    { value: "103entry1", label: "Room 103 – Door 1" },
    { value: "103entry2", label: "Room 103 – Door 2" },
    { value: "104entry1", label: "Room 104 – Door 1" },
    { value: "104entry2", label: "Room 104 – Door 2" },
    { value: "girltoilet", label: "Ladies Toilet" },
    { value: "boystoilet ", label: "Gents Toilet" },  // note: trailing space in source data
];

const selectClass =
    "border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

/**
 * Route-finding page.
 * All pathfinding logic lives in useNavigation — this component is pure UI.
 */
export function NavigationPage() {
    const { building } = useParams<{ building: string }>();
    const [searchParams] = useSearchParams();
    const floor = Number(searchParams.get("floor")) || 1;

    const { from, to, route, noRouteFound, setFrom, setTo, onDataLoad } =
        useNavigation();

    const routeControls = (
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-3">
                <label className="w-9 text-sm sm:w-auto text-[#E8E2DB] font-semibold">From</label>
                <select
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className={selectClass}
                >
                    {POI_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>

                <span className="px-4 text-gray-400">→</span>
            </div>

            <div className="flex items-center gap-3">
                <label className="w-9 text-sm sm:w-auto text-[#E8E2DB] font-semibold">To</label>
                <select
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className={selectClass}
                >
                    {POI_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            {noRouteFound && (
                <span className="text-sm text-red-500 text-center">No route found</span>
            )}
        </div>
    );

    return (
        <IndoorMap
            building = {building}
            floorNo = {floor}
            route={route}
            onDataLoad={onDataLoad}
            headerSlot={routeControls}
        />
    );
}

export default NavigationPage;