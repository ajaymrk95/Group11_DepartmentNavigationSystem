// mapData.ts
// Hardcoded building/floor map data (replaces public file fetching)
// Shape mirrors the backend API response format for easy swap later.

export type GeoFeature = {
  type: string;
  properties: Record<string, any>;
  geometry: {
    type: string;
    coordinates: any;
  };
};

export type GeoJSON = {
  type: string;
  name: string;
  crs?: { type: string; properties: { name: string } };
  features: GeoFeature[];
};

export type FloorData = {
  paths: GeoJSON;
  poi: GeoJSON;
  units: GeoJSON;
};

export type BuildingData = {
  id: string;
  name: string;
  label: string;
  outline: GeoJSON;
  floors: {
    id: string;
    level: number;
    name: string;
    data: FloorData;
  }[];
};

// ─── Building Outline ────────────────────────────────────────────────────────

const elhcOutline: GeoJSON = {
  type: "FeatureCollection",
  name: "building_elhc",
  crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  features: [
    {
      type: "Feature",
      properties: { id: 1, name: "ELHC" },
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [75.93353059422526, 11.322568336195328],
              [75.93356947649869, 11.322534446839239],
              [75.933597977036712, 11.322509606085463],
              [75.933577819785427, 11.322487582291158],
              [75.933583003078596, 11.322449181825242],
              [75.933679469924058, 11.322364474896901],
              [75.933758619684482, 11.322450960382797],
              [75.933777664533949, 11.322471770335225],
              [75.93376671406152, 11.322481568901631],
              [75.93372496771984, 11.322518923844081],
              [75.93378046507857, 11.322578632641815],
              [75.933834536778662, 11.32263680758223],
              [75.933876289880232, 11.322599508716866],
              [75.93388795349459, 11.322589089380301],
              [75.933907267667195, 11.322609899360417],
              [75.933974269724189, 11.322682090454347],
              [75.933969374391765, 11.32272783214799],
              [75.933889753249133, 11.322798562345062],
              [75.93384713506066, 11.322792350512087],
              [75.933824962084259, 11.322769197315262],
              [75.93380027490177, 11.322790311394915],
              [75.933762978536521, 11.322822209662538],
              [75.933730110327488, 11.322786302062037],
              [75.933701370665162, 11.322754904779835],
              [75.933649030785006, 11.322697724906824],
              [75.933593465715504, 11.322637021591081],
              [75.933566167605704, 11.322607199149445],
              [75.93353059422526, 11.322568336195328],
            ],
          ],
        ],
      },
    },
  ],
};

// ─── Shared path network (all floors reuse the same geometry) ─────────────────

const sharedPaths: GeoJSON = {
  type: "FeatureCollection",
  name: "elhc_path_shared",
  crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  features: [
    { type: "Feature", properties: { id: 2,  name: "p2",   type: "c",      navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.93376664823694, 11.322591367171102], [75.933753005015816, 11.322603980419029]]] } },
    { type: "Feature", properties: { id: 3,  name: null,   type: "rentry", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933753005015816, 11.322603980419029], [75.933752414035396, 11.322614082761781]]] } },
    { type: "Feature", properties: { id: 4,  name: null,   type: "rentry", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933753005015816, 11.322603980419029], [75.933742992462726, 11.322603489219018]]] } },
    { type: "Feature", properties: { id: 5,  name: null,   type: "c",      navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.93376664823694, 11.322591367171102], [75.933720845994642, 11.322543016382243]]] } },
    { type: "Feature", properties: { id: 6,  name: null,   type: "c",      navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933720845994642, 11.322543016382243], [75.933700186259827, 11.322520847638378]]] } },
    { type: "Feature", properties: { id: 7,  name: null,   type: "c",      navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933700186259827, 11.322520847638378], [75.933660231112242, 11.322555056302749]]] } },
    { type: "Feature", properties: { id: 8,  name: null,   type: "c",      navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933700186259827, 11.322520847638378], [75.933757097982095, 11.322471350178194]]] } },
    { type: "Feature", properties: { id: 9,  name: null,   type: "c",      navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.93376664823694, 11.322591367171102], [75.933811670866476, 11.322637711298974]]] } },
    { type: "Feature", properties: { id: 10, name: null,   type: "c",      navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933811670866476, 11.322637711298974], [75.933832720407594, 11.322659306704454]]] } },
    { type: "Feature", properties: { id: 11, name: null,   type: "c",      navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.93383272040758, 11.322659306704452], [75.933886903485714, 11.32261114703689]]] } },
    { type: "Feature", properties: { id: 12, name: null,   type: "c",      navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.93383272040758, 11.322659306704452], [75.933788282487427, 11.322699057535067]]] } },
    { type: "Feature", properties: { id: 13, name: null,   type: "c",      navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933660231112242, 11.322555056302745], [75.933628266994177, 11.322581907234769]]] } },
    { type: "Feature", properties: { id: 14, name: null,   type: "c",      navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933628266994177, 11.322581907234769], [75.933586752621395, 11.322538716410486]]] } },
    { type: "Feature", properties: { id: 14, name: null,   type: "c",      navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933628266994177, 11.322581907234769], [75.933623004608904, 11.322586493870594]]] } },
    { type: "Feature", properties: { id: 15, name: null,   type: "c",      navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933788282487427, 11.322699057535067], [75.9337535897252, 11.322730781751694]]] } },
    { type: "Feature", properties: { id: 16, name: null,   type: "c",      navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.9337535897252, 11.322730781751694], [75.933798904709619, 11.322778368070033]]] } },
    { type: "Feature", properties: { id: 17, name: null,   type: "c",      navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.9337535897252, 11.322730781751694], [75.933748327339984, 11.322735559494857]]] } },
    { type: "Feature", properties: { id: 18, name: null,   type: "c",      navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933748327339984, 11.322735559494857], [75.933757390336865, 11.322745306090663]]] } },
    { type: "Feature", properties: { id: 19, name: null,   type: "c",      navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933623004608904, 11.322586493870594], [75.933612382386826, 11.322575600610397]]] } },
    { type: "Feature", properties: { id: 20, name: null,   type: "rentry", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933720845994642, 11.322543016382243], [75.933711195805998, 11.322551795107497]]] } },
    { type: "Feature", properties: { id: 21, name: null,   type: "rentry", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933811670866476, 11.322637711298974], [75.933800837180939, 11.322647614531974]]] } },
    { type: "Feature", properties: { id: 21, name: null,   type: "rentry", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933886903485714, 11.32261114703689], [75.933895910867193, 11.322620136144565]]] } },
    { type: "Feature", properties: { id: 22, name: null,   type: "rentry", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933757097982095, 11.322471350178194], [75.933747241910197, 11.322460503083013]]] } },
    { type: "Feature", properties: { id: 24, name: "",     type: "rentry", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933586752621395, 11.322538716410486], [75.933579737545784, 11.322545040214768]]] } },
    { type: "Feature", properties: { id: 25, name: null,   type: "rentry", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933798904709619, 11.322778368070033], [75.933793660350318, 11.322783460254193]]] } },
    { type: "Feature", properties: { id: 26, name: null,   type: "rentry", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933660231112242, 11.322555056302745], [75.933648872129098, 11.322543007196384]]] } },
    { type: "Feature", properties: { id: 27, name: null,   type: "rentry", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933788282487427, 11.322699057535067], [75.933797655040351, 11.322708701895094]]] } },
    { type: "Feature", properties: { id: 28, name: null,   type: "stairs", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933612382386826, 11.322575600610397], [75.933577865681173, 11.322607612181441]]] } },
    { type: "Feature", properties: { id: 29, name: null,   type: "stairs", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933577865681173, 11.322607612181441], [75.93359294332511, 11.322623728281981], [75.933622962778429, 11.322596823716943]]] } },
    { type: "Feature", properties: { id: 30, name: null,   type: "stairs", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933757390336865, 11.322745306090663], [75.933729049624901, 11.322771103985721], [75.933715058657938, 11.322756053420271], [75.933736928033468, 11.322735408838058]]] } },
  ],
};

// ─── Floor 1 Units & POI ─────────────────────────────────────────────────────

const floor1Units: GeoJSON = {
  type: "FeatureCollection",
  name: "elhc_units_1",
  crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  features: [
    { type: "Feature", properties: { id: 1, room_no: "101", level: 1, category: "classroom", name: "elhc 101", navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933577819785427, 11.322487582291158], [75.933583003078596, 11.322449181825242], [75.933679469924058, 11.322364474896901], [75.933758619684482, 11.322450960382797], [75.933747241910197, 11.322460503083013], [75.933648872129098, 11.322543007196384], [75.933637936765507, 11.322552178837554], [75.933577819785427, 11.322487582291158]]]] } },
    { type: "Feature", properties: { id: 2, room_no: "104", level: 1, category: "classroom", name: "elhc 104", navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933847135060645, 11.322792350512087], [75.933889753249133, 11.322798562345062], [75.933969374391765, 11.32272783214799], [75.933974269724189, 11.322682090454347], [75.933907267667195, 11.322609899360417], [75.933895910867193, 11.322620136144565], [75.933797655040351, 11.322708701895094], [75.93378197019976, 11.322722839880358], [75.933847135060645, 11.322792350512087]]]] } },
    { type: "Feature", properties: { id: 3, room_no: null,  level: 1, category: "toilet",    name: "ladies toilet", navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.93353059422526, 11.322568336195328], [75.93356947649869, 11.322534446839239], [75.933579737545784, 11.322545040214768], [75.933604608325382, 11.322570716492139], [75.933566167605704, 11.322607199149445], [75.93353059422526, 11.322568336195328]]]] } },
    { type: "Feature", properties: { id: 4, room_no: null,  level: 1, category: "toilet",    name: "gents toilet",  navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933762978536521, 11.322822209662538], [75.93380027490177, 11.322790311394915], [75.933793660350318, 11.322783460254193], [75.933765208528001, 11.3227539907652], [75.933730110327488, 11.322786302062037], [75.933762978536521, 11.322822209662538]]]] } },
    { type: "Feature", properties: { id: 5, room_no: "102", level: 1, category: "classroom", name: "elhc 102", navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933593465715504, 11.322637021591081], [75.933701475195008, 11.322541476685879], [75.933711195805998, 11.322551795107497], [75.933743964083561, 11.322586578607991], [75.933742992462726, 11.322603489219018], [75.933742404858322, 11.322613716201769], [75.933649030785006, 11.322697724906824], [75.933593465715504, 11.322637021591081]]]] } },
    { type: "Feature", properties: { id: 6, room_no: "103", level: 1, category: "classroom", name: "elhc 103", navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933742404858322, 11.322613716201769], [75.933752414035396, 11.322614082761781], [75.933768792171776, 11.32261468256833], [75.933800837180939, 11.322647614531974], [75.933809332028773, 11.322656344502928], [75.933701370665162, 11.322754904779835], [75.933649030785006, 11.322697724906824], [75.933742404858322, 11.322613716201769]]]] } },
  ],
};

const floor1Poi: GeoJSON = {
  type: "FeatureCollection",
  name: "elhc_poi_1",
  crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  features: [
    { type: "Feature", properties: { id: null, type: "entry",  access: "y", name: "entry1"    }, geometry: { type: "Point", coordinates: [75.93378046507857, 11.322578632641815] } },
    { type: "Feature", properties: { id: null, type: "entry",  access: "y", name: "entry2"    }, geometry: { type: "Point", coordinates: [75.93376671406152, 11.322481568901631] } },
    { type: "Feature", properties: { id: null, type: "entry",  access: "y", name: "entry3"    }, geometry: { type: "Point", coordinates: [75.933876289880232, 11.322599508716866] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "102entry1" }, geometry: { type: "Point", coordinates: [75.933742992462726, 11.322603489219018] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "103entry1" }, geometry: { type: "Point", coordinates: [75.933752414035396, 11.322614082761781] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "102entry2" }, geometry: { type: "Point", coordinates: [75.933711195805998, 11.322551795107497] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "103entry2" }, geometry: { type: "Point", coordinates: [75.933800837180939, 11.322647614531974] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "101entry1" }, geometry: { type: "Point", coordinates: [75.933648872129098, 11.322543007196384] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "101entry2" }, geometry: { type: "Point", coordinates: [75.933747241910197, 11.322460503083013] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "104entry2" }, geometry: { type: "Point", coordinates: [75.933797655040351, 11.322708701895094] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "104entry1" }, geometry: { type: "Point", coordinates: [75.933895910867193, 11.322620136144565] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "girltoilet"}, geometry: { type: "Point", coordinates: [75.933579737545784, 11.322545040214768] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "boystoilet"}, geometry: { type: "Point", coordinates: [75.933793660350318, 11.322783460254193] } },
  ],
};

// ─── Floor 2 Units & POI ─────────────────────────────────────────────────────

const floor2Units: GeoJSON = {
  type: "FeatureCollection",
  name: "elhc_units_2",
  crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  features: [
    { type: "Feature", properties: { id: 1, room_no: "201", level: 2, category: "classroom", name: "elhc 201", navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933577819785427, 11.322487582291158], [75.933583003078596, 11.322449181825242], [75.933679469924058, 11.322364474896901], [75.933758619684482, 11.322450960382797], [75.933747241910197, 11.322460503083013], [75.933648872129098, 11.322543007196384], [75.933637936765507, 11.322552178837554], [75.933577819785427, 11.322487582291158]]]] } },
    { type: "Feature", properties: { id: 2, room_no: "204", level: 2, category: "classroom", name: "elhc 204", navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933847135060645, 11.322792350512087], [75.933889753249133, 11.322798562345062], [75.933969374391765, 11.32272783214799], [75.933974269724189, 11.322682090454347], [75.933907267667195, 11.322609899360417], [75.933895910867193, 11.322620136144565], [75.933797655040351, 11.322708701895094], [75.93378197019976, 11.322722839880358], [75.933847135060645, 11.322792350512087]]]] } },
    { type: "Feature", properties: { id: 3, room_no: null,  level: 2, category: "toilet",    name: "gents toilet",  navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.93353059422526, 11.322568336195328], [75.93356947649869, 11.322534446839239], [75.933579737545784, 11.322545040214768], [75.933604608325382, 11.322570716492139], [75.933566167605704, 11.322607199149445], [75.93353059422526, 11.322568336195328]]]] } },
    { type: "Feature", properties: { id: 4, room_no: null,  level: 2, category: "toilet",    name: "ladies toilet", navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933762978536521, 11.322822209662538], [75.93380027490177, 11.322790311394915], [75.933793660350318, 11.322783460254193], [75.933765208528001, 11.3227539907652], [75.933730110327488, 11.322786302062037], [75.933762978536521, 11.322822209662538]]]] } },
    { type: "Feature", properties: { id: 5, room_no: "202", level: 2, category: "classroom", name: "elhc 202", navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933593465715504, 11.322637021591081], [75.933701475195008, 11.322541476685879], [75.933711195805998, 11.322551795107497], [75.933743964083561, 11.322586578607991], [75.933742992462726, 11.322603489219018], [75.933742404858322, 11.322613716201769], [75.933649030785006, 11.322697724906824], [75.933593465715504, 11.322637021591081]]]] } },
    { type: "Feature", properties: { id: 6, room_no: "203", level: 2, category: "classroom", name: "elhc 203", navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933742404858322, 11.322613716201769], [75.933752414035396, 11.322614082761781], [75.933768792171776, 11.32261468256833], [75.933800837180939, 11.322647614531974], [75.933809332028773, 11.322656344502928], [75.933701370665162, 11.322754904779835], [75.933649030785006, 11.322697724906824], [75.933742404858322, 11.322613716201769]]]] } },
  ],
};

const floor2Poi: GeoJSON = {
  type: "FeatureCollection",
  name: "elhc_poi_2",
  crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  features: [
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "102entry1" }, geometry: { type: "Point", coordinates: [75.933742992462726, 11.322603489219018] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "103entry1" }, geometry: { type: "Point", coordinates: [75.933752414035396, 11.322614082761781] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "102entry2" }, geometry: { type: "Point", coordinates: [75.933711195805998, 11.322551795107497] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "103entry2" }, geometry: { type: "Point", coordinates: [75.933800837180939, 11.322647614531974] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "101entry1" }, geometry: { type: "Point", coordinates: [75.933648872129098, 11.322543007196384] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "101entry2" }, geometry: { type: "Point", coordinates: [75.933747241910197, 11.322460503083013] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "104entry2" }, geometry: { type: "Point", coordinates: [75.933797655040351, 11.322708701895094] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "104entry1" }, geometry: { type: "Point", coordinates: [75.933895910867193, 11.322620136144565] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "girltoilet"}, geometry: { type: "Point", coordinates: [75.933579737545784, 11.322545040214768] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "boystoilet"}, geometry: { type: "Point", coordinates: [75.933793660350318, 11.322783460254193] } },
  ],
};

// ─── Floor 3 Units & POI ─────────────────────────────────────────────────────

const floor3Units: GeoJSON = {
  type: "FeatureCollection",
  name: "elhc_units_3",
  crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  features: [
    { type: "Feature", properties: { id: 1, room_no: "301", level: 3, category: "lab",       name: "VLSI Lab",            navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933577819785427, 11.322487582291158], [75.933583003078596, 11.322449181825242], [75.933679469924058, 11.322364474896901], [75.933758619684482, 11.322450960382797], [75.933747241910197, 11.322460503083013], [75.933648872129098, 11.322543007196384], [75.933637936765507, 11.322552178837554], [75.933577819785427, 11.322487582291158]]]] } },
    { type: "Feature", properties: { id: 2, room_no: "302", level: 3, category: "lab",       name: "Embedded Systems Lab",navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933593465715504, 11.322637021591081], [75.933701475195008, 11.322541476685879], [75.933711195805998, 11.322551795107497], [75.933743964083561, 11.322586578607991], [75.933742992462726, 11.322603489219018], [75.933742404858322, 11.322613716201769], [75.933649030785006, 11.322697724906824], [75.933593465715504, 11.322637021591081]]]] } },
    { type: "Feature", properties: { id: 3, room_no: "303", level: 3, category: "lab",       name: "Signal Processing Lab",navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933742404858322, 11.322613716201769], [75.933752414035396, 11.322614082761781], [75.933768792171776, 11.32261468256833], [75.933800837180939, 11.322647614531974], [75.933809332028773, 11.322656344502928], [75.933701370665162, 11.322754904779835], [75.933649030785006, 11.322697724906824], [75.933742404858322, 11.322613716201769]]]] } },
    { type: "Feature", properties: { id: 4, room_no: "304", level: 3, category: "lab",       name: "IoT Lab",             navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933847135060645, 11.322792350512087], [75.933889753249133, 11.322798562345062], [75.933969374391765, 11.32272783214799], [75.933974269724189, 11.322682090454347], [75.933907267667195, 11.322609899360417], [75.933895910867193, 11.322620136144565], [75.933797655040351, 11.322708701895094], [75.93378197019976, 11.322722839880358], [75.933847135060645, 11.322792350512087]]]] } },
    { type: "Feature", properties: { id: 5, room_no: null,  level: 3, category: "toilet",    name: "ladies toilet",       navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.93353059422526, 11.322568336195328], [75.93356947649869, 11.322534446839239], [75.933579737545784, 11.322545040214768], [75.933604608325382, 11.322570716492139], [75.933566167605704, 11.322607199149445], [75.93353059422526, 11.322568336195328]]]] } },
    { type: "Feature", properties: { id: 6, room_no: null,  level: 3, category: "toilet",    name: "gents toilet",        navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933762978536521, 11.322822209662538], [75.93380027490177, 11.322790311394915], [75.933793660350318, 11.322783460254193], [75.933765208528001, 11.3227539907652], [75.933730110327488, 11.322786302062037], [75.933762978536521, 11.322822209662538]]]] } },
  ],
};

const floor3Poi: GeoJSON = {
  type: "FeatureCollection",
  name: "elhc_poi_3",
  crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  features: [
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "301entry1"   }, geometry: { type: "Point", coordinates: [75.933648872129098, 11.322543007196384] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "301entry2"   }, geometry: { type: "Point", coordinates: [75.933747241910197, 11.322460503083013] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "302entry1"   }, geometry: { type: "Point", coordinates: [75.933742992462726, 11.322603489219018] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "302entry2"   }, geometry: { type: "Point", coordinates: [75.933711195805998, 11.322551795107497] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "303entry1"   }, geometry: { type: "Point", coordinates: [75.933752414035396, 11.322614082761781] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "303entry2"   }, geometry: { type: "Point", coordinates: [75.933800837180939, 11.322647614531974] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "304entry1"   }, geometry: { type: "Point", coordinates: [75.933895910867193, 11.322620136144565] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "304entry2"   }, geometry: { type: "Point", coordinates: [75.933797655040351, 11.322708701895094] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "ladiestoilet"}, geometry: { type: "Point", coordinates: [75.933579737545784, 11.322545040214768] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "gentstoilet" }, geometry: { type: "Point", coordinates: [75.933793660350318, 11.322783460254193] } },
  ],
};

// ─── Main export ─────────────────────────────────────────────────────────────

export const BUILDINGS_DATA: BuildingData[] = [
  {
    id: "elhc",
    name: "ELHC",
    label: "Electronics & Hardware Lab Complex",
    outline: elhcOutline,
    floors: [
      {
        id: "floor1",
        level: 1,
        name: "Ground Floor",
        data: { paths: sharedPaths, poi: floor1Poi, units: floor1Units },
      },
      {
        id: "floor2",
        level: 2,
        name: "First Floor",
        data: { paths: sharedPaths, poi: floor2Poi, units: floor2Units },
      },
      {
        id: "floor3",
        level: 3,
        name: "Second Floor",
        data: { paths: sharedPaths, poi: floor3Poi, units: floor3Units },
      },
    ],
  },
];

// ─── Convenience lookup ───────────────────────────────────────────────────────

export function getBuilding(buildingId: string): BuildingData | undefined {
  return BUILDINGS_DATA.find((b) => b.id === buildingId);
}

export function getFloor(
  buildingId: string,
  floorId: string
): { id: string; level: number; name: string; data: FloorData } | undefined {
  return getBuilding(buildingId)?.floors.find((f) => f.id === floorId);
}

export function getFloorData(
  buildingId: string,
  floorId: string
): FloorData | undefined {
  return getFloor(buildingId, floorId)?.data;
}

export function getBuildingOutline(buildingId: string): GeoJSON | undefined {
  return getBuilding(buildingId)?.outline;
} 