// src/components/IndoorFloorPlan.tsx
import { MapContainer, GeoJSON, useMap, TileLayer } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { GeoJsonObject, Feature } from "geojson";

// Component to set max bounds and fit to data
function SetMapBounds({ geojsonData }: { geojsonData: GeoJsonObject[] }) {
    const map = useMap();

    useEffect(() => {
        if (geojsonData.length > 0) {
            const validData = geojsonData.filter(Boolean);
            if (validData.length > 0) {
                const group = L.featureGroup(
                    validData.map(data => L.geoJSON(data))
                );
                const bounds = group.getBounds();

                // Pad the bounds slightly for better viewing
                const paddedBounds = bounds.pad(0.2); // 20% padding

                // Set max bounds to prevent panning outside
                map.setMaxBounds(paddedBounds);

                // Fit to bounds initially
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 21 });
            }
        }
    }, [geojsonData, map]);

    return null;
}

// Component to add room labels
function RoomLabels({ units }: { units: GeoJsonObject | null }) {
    const map = useMap();

    useEffect(() => {
        if (!units) return;

        const labels: L.Marker[] = [];

        // Calculate center of each polygon and add label
        (units as any).features.forEach((feature: any) => {
            const props = feature.properties;
            const geometry = feature.geometry;

            if (!geometry || geometry.type !== 'MultiPolygon') return;

            // Calculate centroid of the polygon
            const coords = geometry.coordinates[0][0]; // Get outer ring of first polygon
            let latSum = 0;
            let lngSum = 0;
            const pointCount = coords.length - 1; // Exclude last point (same as first)

            for (let i = 0; i < pointCount; i++) {
                lngSum += coords[i][0];
                latSum += coords[i][1];
            }

            const centerLng = lngSum / pointCount;
            const centerLat = latSum / pointCount;

            // Create label text
            let labelText = '';
            let textColor = '#1f2937';
            let fontSize = '14px';
            let fontWeight = 'bold';

            if (props.category === 'toilet') {
                labelText = props.name || 'Toilet';
                textColor = '#dc2626';
                fontSize = '12px';
            } else if (props.room_no) {
                labelText = `Room ${props.room_no}`;
                textColor = '#1f2937';
                fontSize = '14px';
            } else if (props.name) {
                labelText = props.name;
            }

            if (!labelText) return;

            const labelIcon = L.divIcon({
                html: `
          <div style="
            color: ${textColor};
            font-weight: ${fontWeight};
            font-size: ${fontSize};
            white-space: nowrap;
            text-shadow: 
              -1px -1px 0 #fff,  
               1px -1px 0 #fff,
              -1px  1px 0 #fff,
               1px  1px 0 #fff,
              -1px  0   0 #fff,
               1px  0   0 #fff,
               0   -1px 0 #fff,
               0    1px 0 #fff;
            pointer-events: none;
          ">${labelText}</div>
        `,
                className: 'room-label',
                iconSize: [0, 0],
                iconAnchor: [0, 0]
            });

            const marker = L.marker([centerLat, centerLng], {
                icon: labelIcon,
                interactive: false,
                zIndexOffset: 1000
            });

            marker.addTo(map);
            labels.push(marker);
        });

        // Cleanup function
        return () => {
            labels.forEach(label => map.removeLayer(label));
        };
    }, [map, units]);

    return null;
}


const IndoorNavigation = () => {
    const [buildingOutline, setBuildingOutline] = useState<GeoJsonObject | null>(null);
    const [units, setUnits] = useState<GeoJsonObject | null>(null);
    const [paths, setPaths] = useState<GeoJsonObject | null>(null);
    const [pois, setPois] = useState<GeoJsonObject | null>(null);
    const [floor, setFloor] = useState<number>(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Load all GeoJSON files
        Promise.all([
            fetch(`/elhc/floor${floor}/units.geojson`).then(res => res.json()),
            fetch(`/elhc/floor${floor}/paths.geojson`).then(res => res.json()),
            fetch(`/elhc/floor${floor}/outline.geojson`).then(res => res.json()),
            fetch(`/elhc/floor${floor}/poi.geojson`).then(res => res.json())
        ])
            .then(([outlineData, unitsData, pathsData, poisData]) => {
                setBuildingOutline(outlineData);
                setUnits(unitsData);
                setPaths(pathsData);
                setPois(poisData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading GeoJSON:', error);
                setLoading(false);
            });
    }, [floor]);

    // Style for building outline
    const buildingOutlineStyle = {
        fillColor: '#f9fafb',
        fillOpacity: 0.4,
        color: '#1f2937',
        weight: 3,
        opacity: 1
    };

    // Style for room units
    const unitStyle = (feature: Feature | undefined) => {
        const category = feature?.properties?.category;

        if (category === 'toilet') {
            return {
                fillColor: '#fee2e2',
                fillOpacity: 0.7,
                color: '#ef4444',
                weight: 2,
                opacity: 1
            };
        } else if (category === 'classroom') {
            return {
                fillColor: '#dbeafe',
                fillOpacity: 0.6,
                color: '#3b82f6',
                weight: 2,
                opacity: 1
            };
        } else {
            return {
                fillColor: '#f3f4f6',
                fillOpacity: 0.6,
                color: '#6b7280',
                weight: 2,
                opacity: 1
            };
        }
    };

    // Style for paths based on type
    const pathStyle = (feature: Feature | undefined) => {
        const type = feature?.properties?.type;

        switch (type) {
            case 'entry':
                return {
                    color: '#10b981',
                    weight: 5,
                    opacity: 0.9,
                    lineCap: 'round' as const,
                    lineJoin: 'round' as const
                };
            case 'stairs':
                return {
                    color: '#f59e0b',
                    weight: 5,
                    opacity: 0.9,
                    lineCap: 'round' as const,
                    lineJoin: 'round' as const,
                    dashArray: '8, 4'
                };
            case 'rentry':
                return {
                    color: '#8b5cf6',
                    weight: 3,
                    opacity: 0.7,
                    lineCap: 'round' as const,
                    lineJoin: 'round' as const,
                    dashArray: '4, 4'
                };
            case 'c':
            default:
                return {
                    color: '#3b82f6',
                    weight: 4,
                    opacity: 0.8,
                    lineCap: 'round' as const,
                    lineJoin: 'round' as const
                };
        }
    };

    // Custom icon for POIs
    const createPOIIcon = (type: string, name: string) => {
        let emoji = '';
        let bgColor = '#3b82f6';

        if (type === 'entry') {
            emoji = '🚪';
            bgColor = '#10b981';
        } else if (name?.toLowerCase().includes('toilet')) {
            emoji = '🚻';
            bgColor = '#ef4444';
        } else if (type === 'stairs') {
            emoji = '🪜';
            bgColor = '#f59e0b';
        } else if (type === 'rentry') {
            emoji = '🚪';
            bgColor = '#8b5cf6';
        }

        return L.divIcon({
            html: `
        <div style="
          background-color: ${bgColor};
          border: 2px solid white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        ">${emoji}</div>
      `,
            className: 'poi-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });
    };

    // Handle POI features
    const pointToLayer = (feature: Feature, latlng: L.LatLng) => {
        const type = feature.properties?.type || 'default';
        const name = feature.properties?.name || 'Unknown';
        return L.marker(latlng, { icon: createPOIIcon(type, name) });
    };

    // Interactivity for building outline
    const onEachOutline = (feature: any, layer: L.Layer) => {
        const props = feature.properties || {};

        let popupContent = '<div class="p-3 min-w-[150px]">';
        popupContent += `<div class="font-bold text-lg mb-2">🏢 Building</div>`;

        if (props.name) {
            popupContent += `<div><strong>Name:</strong> ${props.name}</div>`;
        }

        if (props.floor || props.level) {
            popupContent += `<div><strong>Floor:</strong> ${props.floor || props.level}</div>`;
        }

        popupContent += '</div>';

        layer.bindPopup(popupContent);
    };

    // Interactivity for units (rooms)
    const onEachUnit = (feature: any, layer: L.Layer) => {
        const props = feature.properties || {};

        let popupContent = '<div class="p-3 min-w-[180px]">';

        if (props.name) {
            popupContent += `<div class="font-bold text-lg mb-2">${props.name}</div>`;
        }

        if (props.room_no) {
            popupContent += `<div class="mb-1"><strong>Room Number:</strong> ${props.room_no}</div>`;
        }

        if (props.category) {
            const categoryIcons: Record<string, string> = {
                'classroom': '🏫',
                'toilet': '🚻',
                'office': '🏢',
                'lab': '🔬'
            };
            const icon = categoryIcons[props.category] || '📦';
            popupContent += `<div class="mb-1"><strong>Category:</strong> ${icon} ${props.category}</div>`;
        }

        if (props.level) {
            popupContent += `<div class="mb-1"><strong>Level:</strong> ${props.level}</div>`;
        }

        popupContent += '</div>';

        layer.bindPopup(popupContent);

        // Hover effect
        layer.on({
            mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                    fillOpacity: 0.9,
                    weight: 3
                });
            },
            mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(unitStyle(feature));
            }
        });
    };

    // Interactivity for paths
    const onEachPath = (feature: any, layer: L.Layer) => {
        const props = feature.properties || {};

        let popupContent = '<div class="p-3 min-w-[180px]">';

        const typeLabels: Record<string, string> = {
            'entry': '🚪 Main Entry',
            'c': '🚶 Corridor',
            'rentry': '🔑 Room Entry',
            'stairs': '🪜 Stairs'
        };

        const typeLabel = typeLabels[props.type] || props.type;
        popupContent += `<div class="font-bold text-lg mb-2">${typeLabel}</div>`;

        if (props.name) {
            popupContent += `<div class="mb-1"><strong>Name:</strong> ${props.name}</div>`;
        }

        if (props.id) {
            popupContent += `<div class="mb-1"><strong>ID:</strong> ${props.id}</div>`;
        }

        popupContent += `<div class="mt-2"><strong>Navigable:</strong> ${props.navigable === 'y' ? '✅ Yes' : '❌ No'}</div>`;

        popupContent += '</div>';

        layer.bindPopup(popupContent);

        layer.on({
            mouseover: (e) => {
                const layer = e.target;
                const currentStyle = pathStyle(feature);
                layer.setStyle({
                    weight: (currentStyle.weight || 3) + 2,
                    opacity: 1
                });
            },
            mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(pathStyle(feature));
            }
        });
    };

    // Interactivity for POIs
    const onEachPOI = (feature: any, layer: L.Layer) => {
        const props = feature.properties || {};

        let popupContent = '<div class="p-3 min-w-37.5">';

        if (props.name) {
            popupContent += `<div class="font-bold text-lg mb-2">${props.name}</div>`;
        }

        const typeLabels: Record<string, string> = {
            'entry': '🚪 Building Entry',
            'rentry': '🚪 Room Entry',
            'room': '🏠 Room',
            'stairs': '🪜 Stairs'
        };

        const typeLabel = typeLabels[props.type] || props.type;
        popupContent += `<div class="mb-1"><strong>Type:</strong> ${typeLabel}</div>`;

        popupContent += `<div class="mt-2"><strong>Accessible:</strong> ${props.access === 'y' ? '✅ Yes' : '❌ No'}</div>`;

        popupContent += '</div>';

        layer.bindPopup(popupContent);
    };

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-100">
                <div className="text-xl text-gray-600">Loading floor plan...</div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-md p-4 z-10 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                    ELHC - Floor {floor} Indoor Navigation
                </h1>

                {/* Floor Toggle */}
                <div className="flex flex-col items-center border-2 border-gray-800 rounded-full overflow-hidden">
                    {([2, 1] as number[]).map((f: number) => (
                        <button
                            key={f}
                            onClick={() => setFloor(f)}
                            className={`w-9 h-9 text-sm font-bold transition-colors duration-200 ${floor === f
                                ? "bg-gray-800 text-white"
                                : "bg-white text-gray-800 hover:bg-gray-100"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 p-4 min-h-0">
                <div className="h-full w-full rounded-lg shadow-lg overflow-hidden">
                    <MapContainer
                        center={[11.322591, 75.933720]}
                        zoom={20}
                        className="h-full w-full"
                        zoomControl={true}
                        attributionControl={false}
                        maxZoom={22}
                        minZoom={20}
                        zoomSnap={0.5}
                        wheelPxPerZoomLevel={120}
                    >
                        {/* OpenStreetMap Base Layer */}
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            opacity={0.3}
                        />

                        {/* Layer 1: Building Outline (bottom) */}
                        {buildingOutline && (
                            <GeoJSON
                                key={`outline-${floor}`}
                                data={buildingOutline}
                                style={buildingOutlineStyle}
                                onEachFeature={onEachOutline}
                            />
                        )}

                        {/* Layer 2: Room Units (polygons) */}
                        {units && (
                            <GeoJSON
                                key={`units-${floor}`}
                                data={units}
                                style={unitStyle}
                                onEachFeature={onEachUnit}
                            />
                        )}

                        {/* Layer 3: Navigation Paths */}
                        {paths && (
                            <GeoJSON
                                key={`paths-${floor}`}
                                data={paths}
                                style={pathStyle}
                                onEachFeature={onEachPath}
                            />
                        )}

                        {/* Layer 4: POIs */}
                        {pois && (
                            <GeoJSON
                                key={`poi-${floor}`}
                                data={pois}
                                pointToLayer={pointToLayer}
                                onEachFeature={onEachPOI}
                            />
                        )}

                        {/* Room Labels */}
                        <RoomLabels key={`labels-${floor}`} units={units} />

                        {/* Set bounds restrictions */}
                        <SetMapBounds
                            geojsonData={[buildingOutline, units, paths, pois].filter(Boolean) as GeoJsonObject[]}
                        />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default IndoorNavigation;