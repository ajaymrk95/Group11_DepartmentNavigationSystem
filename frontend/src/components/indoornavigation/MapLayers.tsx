import { GeoJSON } from "react-leaflet";
import L from "leaflet";
import type { Feature } from "geojson";
import type { MapLayersProps } from "../../types/types";
import { buildingOutlineStyle, getUnitStyle, getPathStyle } from "../../utils/indoormap/mapStyles.ts";
import { createPOIIcon } from "../../utils/indoormap/mapIcons.ts";
import { onEachUnit, onEachPath, onEachPOI } from "../../utils/indoormap/mapEventHandlers.ts";

function pointToLayer(feature: Feature, latlng: L.LatLng): L.Marker {
    const type = feature.properties?.type ?? "default";
    const name = feature.properties?.name ?? "Unknown";
    return L.marker(latlng, { icon: createPOIIcon(type, name) });
}

export function MapLayers({ buildingOutline, units, paths, pois, floor }: MapLayersProps) {
    return (
        <>
            {buildingOutline && (
                <GeoJSON
                    key={`outline-${floor}`}
                    data={buildingOutline}
                    style={buildingOutlineStyle}
                />
            )}

            {units && (
                <GeoJSON
                    key={`units-${floor}`}
                    data={units}
                    style={(f) => getUnitStyle(f as Feature)}
                    onEachFeature={onEachUnit}
                />
            )}

            {paths && (
                <GeoJSON
                    key={`paths-${floor}`}
                    data={paths}
                    style={(f) => getPathStyle(f as Feature)}
                    onEachFeature={onEachPath}
                />
            )}

            {pois && (
                <GeoJSON
                    key={`poi-${floor}`}
                    data={pois}
                    pointToLayer={pointToLayer}
                    onEachFeature={onEachPOI}
                />
            )}
        </>
    );
}