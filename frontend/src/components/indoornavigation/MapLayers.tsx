import { GeoJSON } from "react-leaflet";
import type { Feature } from "geojson";
import type { MapLayersProps } from "../../types/types";
import { buildingOutlineStyle, getUnitStyle, getPathStyle } from "../../utils/indoormap/mapStyles.ts";
import { onEachUnit, onEachPath } from "../../utils/indoormap/mapEventHandlers.ts";


export function MapLayers({ buildingOutline, units, paths, floor }: MapLayersProps) {
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
{/* 
            {pois && (
                <GeoJSON
                    key={`poi-${floor}`}
                    data={pois}
                    pointToLayer={pointToLayer}
                    onEachFeature={onEachPOI}
                />
            )} */}
        </>
    );
}