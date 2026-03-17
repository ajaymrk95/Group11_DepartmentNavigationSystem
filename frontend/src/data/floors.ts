import { Floor } from '../types';

const ELHC_PATH_1 = {
  type: "FeatureCollection",
  name: "elhc_path_1",
  features: [
    { type: "Feature", properties: { id: 1, name: "p1", type: "entry", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.93378046507857,11.322578632641815],[75.93376664823694,11.322591367171102]]] } },
    { type: "Feature", properties: { id: 2, name: "p2", type: "c", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.93376664823694,11.322591367171102],[75.933753005015816,11.322603980419029]]] } },
    { type: "Feature", properties: { id: 3, name: null, type: "rentry", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933753005015816,11.322603980419029],[75.933752414035396,11.322614082761781]]] } },
    { type: "Feature", properties: { id: 4, name: null, type: "rentry", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933753005015816,11.322603980419029],[75.933742992462726,11.322603489219018]]] } },
    { type: "Feature", properties: { id: 5, name: null, type: "c", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.93376664823694,11.322591367171102],[75.933720845994642,11.322543016382243]]] } },
    { type: "Feature", properties: { id: 6, name: null, type: "c", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933720845994642,11.322543016382243],[75.933700186259827,11.322520847638378]]] } },
    { type: "Feature", properties: { id: 28, name: null, type: "stairs", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933612382386826,11.322575600610397],[75.933577865681173,11.322607612181441]]] } },
    { type: "Feature", properties: { id: 29, name: null, type: "stairs", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933577865681173,11.322607612181441],[75.93359294332511,11.322623728281981],[75.933622962778429,11.322596823716943]]] } },
    { type: "Feature", properties: { id: 30, name: null, type: "stairs", navigable: "y" }, geometry: { type: "MultiLineString", coordinates: [[[75.933757390336865,11.322745306090663],[75.933729049624901,11.322771103985721],[75.933715058657938,11.322756053420271],[75.933736928033468,11.322735408838058]]] } }
  ]
};

const ELHC_POI_1 = {
  type: "FeatureCollection",
  name: "elhc_poi_1",
  features: [
    { type: "Feature", properties: { id: null, type: "entry", access: "y", name: "entry1" }, geometry: { type: "Point", coordinates: [75.93378046507857,11.322578632641815] } },
    { type: "Feature", properties: { id: null, type: "entry", access: "y", name: "entry2" }, geometry: { type: "Point", coordinates: [75.93376671406152,11.322481568901631] } },
    { type: "Feature", properties: { id: null, type: "entry", access: "y", name: "entry3" }, geometry: { type: "Point", coordinates: [75.933876289880232,11.322599508716866] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "102entry1" }, geometry: { type: "Point", coordinates: [75.933742992462726,11.322603489219018] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "103entry1" }, geometry: { type: "Point", coordinates: [75.933752414035396,11.322614082761781] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "girltoilet" }, geometry: { type: "Point", coordinates: [75.933579737545784,11.322545040214768] } },
    { type: "Feature", properties: { id: null, type: "rentry", access: "y", name: "boystoilet" }, geometry: { type: "Point", coordinates: [75.933793660350318,11.322783460254193] } }
  ]
};

const ELHC_UNITS_1 = {
  type: "FeatureCollection",
  name: "elhc_units_1",
  features: [
    { type: "Feature", properties: { id: 1, room_no: "101", level: 1, category: "classroom", name: "elhc 101", navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933577819785427,11.322487582291158],[75.933583003078596,11.322449181825242],[75.933679469924058,11.322364474896901],[75.933758619684482,11.322450960382797],[75.933747241910197,11.322460503083013],[75.933648872129098,11.322543007196384],[75.933637936765507,11.322552178837554],[75.933577819785427,11.322487582291158]]]] } },
    { type: "Feature", properties: { id: 2, room_no: "104", level: 1, category: "classroom", name: "elhc 104", navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933847135060645,11.322792350512087],[75.933889753249133,11.322798562345062],[75.933969374391765,11.32272783214799],[75.933974269724189,11.322682090454347],[75.933907267667195,11.322609899360417],[75.933895910867193,11.322620136144565],[75.933797655040351,11.322708701895094],[75.93378197019976,11.322722839880358],[75.933847135060645,11.322792350512087]]]] } },
    { type: "Feature", properties: { id: 3, room_no: null, level: 1, category: "toilet", name: "ladies toilet", navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.93353059422526,11.322568336195328],[75.93356947649869,11.322534446839239],[75.933579737545784,11.322545040214768],[75.933604608325382,11.322570716492139],[75.933566167605704,11.322607199149445],[75.93353059422526,11.322568336195328]]]] } },
    { type: "Feature", properties: { id: 4, room_no: null, level: 1, category: "toilet", name: "gents toilet", navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933762978536521,11.322822209662538],[75.93380027490177,11.322790311394915],[75.933793660350318,11.322783460254193],[75.933765208528001,11.3227539907652],[75.933730110327488,11.322786302062037],[75.933762978536521,11.322822209662538]]]] } },
    { type: "Feature", properties: { id: 5, room_no: "102", level: 1, category: "classroom", name: "elhc 102", navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933593465715504,11.322637021591081],[75.933701475195008,11.322541476685879],[75.933711195805998,11.322551795107497],[75.933743964083561,11.322586578607991],[75.933742992462726,11.322603489219018],[75.933742404858322,11.322613716201769],[75.933649030785006,11.322697724906824],[75.933593465715504,11.322637021591081]]]] } },
    { type: "Feature", properties: { id: 6, room_no: "103", level: 1, category: "classroom", name: "elhc 103", navigable: null }, geometry: { type: "MultiPolygon", coordinates: [[[[75.933742404858322,11.322613716201769],[75.933752414035396,11.322614082761781],[75.933768792171776,11.32261468256833],[75.933800837180939,11.322647614531974],[75.933809332028773,11.322656344502928],[75.933701370665162,11.322754904779835],[75.933649030785006,11.322697724906824],[75.933742404858322,11.322613716201769]]]] } }
  ]
};

export const FLOORS: Floor[] = [
  {
    id: 'elhc-f1',
    buildingId: 'elhc',
    level: 1,
    name: 'Ground Floor',
    description: 'Main entry level with classrooms 101-104 and facilities',
    pathGeoJSON: ELHC_PATH_1 as object,
    poiGeoJSON: ELHC_POI_1 as object,
    unitsGeoJSON: ELHC_UNITS_1 as object,
    pathToggles: { '1': true, '2': true, '3': true, '4': true, '5': true, '6': true, '28': true, '29': true, '30': true }
  },
  {
    id: 'elhc-f2',
    buildingId: 'elhc',
    level: 2,
    name: 'First Floor',
    description: 'Labs and advanced classrooms',
    pathGeoJSON: null,
    poiGeoJSON: null,
    unitsGeoJSON: null,
    pathToggles: {}
  },
  {
    id: 'elhc-f3',
    buildingId: 'elhc',
    level: 3,
    name: 'Second Floor',
    description: 'Faculty offices and seminar rooms',
    pathGeoJSON: null,
    poiGeoJSON: null,
    unitsGeoJSON: null,
    pathToggles: {}
  },
  {
    id: 'ltc-f1',
    buildingId: 'ltc',
    level: 1,
    name: 'Ground Floor',
    description: 'Main auditorium and entrance lobby',
    pathGeoJSON: null,
    poiGeoJSON: null,
    unitsGeoJSON: null,
    pathToggles: {}
  },
  {
    id: 'ltc-f2',
    buildingId: 'ltc',
    level: 2,
    name: 'First Floor',
    description: 'Seminar halls and balcony seating',
    pathGeoJSON: null,
    poiGeoJSON: null,
    unitsGeoJSON: null,
    pathToggles: {}
  }
];
