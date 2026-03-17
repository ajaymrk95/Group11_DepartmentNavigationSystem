// NIT Calicut Campus Data

export const buildingData = {
  id: 'elhc',
  name: 'ELHC',
  fullName: 'Electronics and Hardware Lab Complex',
  institution: 'National Institute of Technology Calicut',
  location: { lat: 11.322568, lng: 75.933530 },
  totalFloors: 2,
  yearBuilt: 2005,
  area: '2400 sqm',
  description: 'Electronics & Hardware Lab Complex houses undergraduate and postgraduate labs for ECE and EEE departments.',
  status: 'active',
  outline: {
    "type": "FeatureCollection",
    "name": "building_elhc",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": [
      { "type": "Feature", "properties": { "id": 1, "name": "ELHC" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 75.93353059422526, 11.322568336195328 ], [ 75.93356947649869, 11.322534446839239 ], [ 75.933597977036712, 11.322509606085463 ], [ 75.933577819785427, 11.322487582291158 ], [ 75.933583003078596, 11.322449181825242 ], [ 75.933679469924058, 11.322364474896901 ], [ 75.933758619684482, 11.322450960382797 ], [ 75.933777664533949, 11.322471770335225 ], [ 75.93376671406152, 11.322481568901631 ], [ 75.93372496771984, 11.322518923844081 ], [ 75.93378046507857, 11.322578632641815 ], [ 75.933834536778662, 11.32263680758223 ], [ 75.933876289880232, 11.322599508716866 ], [ 75.93388795349459, 11.322589089380301 ], [ 75.933907267667195, 11.322609899360417 ], [ 75.933974269724189, 11.322682090454347 ], [ 75.933969374391765, 11.32272783214799 ], [ 75.933889753249133, 11.322798562345062 ], [ 75.93384713506066, 11.322792350512087 ], [ 75.933824962084259, 11.322769197315262 ], [ 75.93380027490177, 11.322790311394915 ], [ 75.933762978536521, 11.322822209662538 ], [ 75.933730110327488, 11.322786302062037 ], [ 75.933701370665162, 11.322754904779835 ], [ 75.933649030785006, 11.322697724906824 ], [ 75.933593465715504, 11.322637021591081 ], [ 75.933566167605704, 11.322607199149445 ], [ 75.93353059422526, 11.322568336195328 ] ] ] ] } }
    ]
  }
}

export const otherBuildings = [
  { id: 'lhc', name: 'LHC', fullName: 'Lecture Hall Complex', totalFloors: 4, status: 'active', area: '8200 sqm' },
  { id: 'mb', name: 'MB', fullName: 'Main Block', totalFloors: 3, status: 'active', area: '5600 sqm' },
  { id: 'cse', name: 'CSE Block', fullName: 'Computer Science & Engineering Block', totalFloors: 3, status: 'active', area: '3400 sqm' },
  { id: 'library', name: 'Library', fullName: 'Central Library', totalFloors: 3, status: 'active', area: '4100 sqm' },
]

export const floorData = [
  {
    id: 'elhc_f1',
    buildingId: 'elhc',
    level: 1,
    name: 'Ground Floor',
    path: {
      "type": "FeatureCollection",
      "name": "elhc_path_1",
      "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
      "features": [
        { "type": "Feature", "properties": { "id": 1, "name": "p1", "type": "entry", "navigable": "y" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 75.93378046507857, 11.322578632641815 ], [ 75.93376664823694, 11.322591367171102 ] ] ] } },
        { "type": "Feature", "properties": { "id": 2, "name": "p2", "type": "c", "navigable": "y" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 75.93376664823694, 11.322591367171102 ], [ 75.933753005015816, 11.322603980419029 ] ] ] } },
        { "type": "Feature", "properties": { "id": 3, "name": null, "type": "rentry", "navigable": "y" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 75.933753005015816, 11.322603980419029 ], [ 75.933752414035396, 11.322614082761781 ] ] ] } },
        { "type": "Feature", "properties": { "id": 4, "name": null, "type": "rentry", "navigable": "y" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 75.933753005015816, 11.322603980419029 ], [ 75.933742992462726, 11.322603489219018 ] ] ] } },
        { "type": "Feature", "properties": { "id": 5, "name": null, "type": "c", "navigable": "y" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 75.93376664823694, 11.322591367171102 ], [ 75.933720845994642, 11.322543016382243 ] ] ] } },
        { "type": "Feature", "properties": { "id": 6, "name": null, "type": "c", "navigable": "y" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 75.933720845994642, 11.322543016382243 ], [ 75.933700186259827, 11.322520847638378 ] ] ] } },
        { "type": "Feature", "properties": { "id": 7, "name": null, "type": "c", "navigable": "y" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 75.933700186259827, 11.322520847638378 ], [ 75.933660231112242, 11.322555056302749 ] ] ] } },
        { "type": "Feature", "properties": { "id": 8, "name": null, "type": "c", "navigable": "y" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 75.933700186259827, 11.322520847638378 ], [ 75.933757097982095, 11.322471350178194 ] ] ] } },
        { "type": "Feature", "properties": { "id": 9, "name": null, "type": "c", "navigable": "y" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 75.93376664823694, 11.322591367171102 ], [ 75.933811670866476, 11.322637711298974 ] ] ] } },
        { "type": "Feature", "properties": { "id": 10, "name": null, "type": "c", "navigable": "y" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 75.933811670866476, 11.322637711298974 ], [ 75.933832720407594, 11.322659306704454 ] ] ] } },
        { "type": "Feature", "properties": { "id": 11, "name": null, "type": "c", "navigable": "y" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 75.93383272040758, 11.322659306704452 ], [ 75.933886903485714, 11.32261114703689 ] ] ] } },
        { "type": "Feature", "properties": { "id": 12, "name": null, "type": "c", "navigable": "y" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 75.93383272040758, 11.322659306704452 ], [ 75.933788282487427, 11.322699057535067 ] ] ] } },
        { "type": "Feature", "properties": { "id": 28, "name": null, "type": "stairs", "navigable": "y" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 75.933612382386826, 11.322575600610397 ], [ 75.933577865681173, 11.322607612181441 ] ] ] } },
        { "type": "Feature", "properties": { "id": 29, "name": null, "type": "stairs", "navigable": "y" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 75.933577865681173, 11.322607612181441 ], [ 75.93359294332511, 11.322623728281981 ], [ 75.933622962778429, 11.322596823716943 ] ] ] } },
        { "type": "Feature", "properties": { "id": 30, "name": null, "type": "stairs", "navigable": "y" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ 75.933757390336865, 11.322745306090663 ], [ 75.933729049624901, 11.322771103985721 ], [ 75.933715058657938, 11.322756053420271 ], [ 75.933736928033468, 11.322735408838058 ] ] ] } }
      ]
    },
    poi: {
      "type": "FeatureCollection",
      "name": "elhc_poi_1",
      "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
      "features": [
        { "type": "Feature", "properties": { "id": null, "type": "entry", "access": "y", "name": "entry1" }, "geometry": { "type": "Point", "coordinates": [ 75.93378046507857, 11.322578632641815 ] } },
        { "type": "Feature", "properties": { "id": null, "type": "entry", "access": "y", "name": "entry2" }, "geometry": { "type": "Point", "coordinates": [ 75.93376671406152, 11.322481568901631 ] } },
        { "type": "Feature", "properties": { "id": null, "type": "entry", "access": "y", "name": "entry3" }, "geometry": { "type": "Point", "coordinates": [ 75.933876289880232, 11.322599508716866 ] } },
        { "type": "Feature", "properties": { "id": null, "type": "rentry", "access": "y", "name": "102entry1" }, "geometry": { "type": "Point", "coordinates": [ 75.933742992462726, 11.322603489219018 ] } },
        { "type": "Feature", "properties": { "id": null, "type": "rentry", "access": "y", "name": "103entry1" }, "geometry": { "type": "Point", "coordinates": [ 75.933752414035396, 11.322614082761781 ] } },
        { "type": "Feature", "properties": { "id": null, "type": "rentry", "access": "y", "name": "girltoilet" }, "geometry": { "type": "Point", "coordinates": [ 75.933579737545784, 11.322545040214768 ] } },
        { "type": "Feature", "properties": { "id": null, "type": "rentry", "access": "y", "name": "boystoilet" }, "geometry": { "type": "Point", "coordinates": [ 75.933793660350318, 11.322783460254193 ] } }
      ]
    },
    units: {
      "type": "FeatureCollection",
      "name": "elhc_units_1",
      "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
      "features": [
        { "type": "Feature", "properties": { "id": 1, "room_no": "101", "level": 1, "category": "classroom", "name": "elhc 101", "navigable": null }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 75.933577819785427, 11.322487582291158 ], [ 75.933583003078596, 11.322449181825242 ], [ 75.933679469924058, 11.322364474896901 ], [ 75.933758619684482, 11.322450960382797 ], [ 75.933747241910197, 11.322460503083013 ], [ 75.933648872129098, 11.322543007196384 ], [ 75.933637936765507, 11.322552178837554 ], [ 75.933577819785427, 11.322487582291158 ] ] ] ] } },
        { "type": "Feature", "properties": { "id": 2, "room_no": "104", "level": 1, "category": "classroom", "name": "elhc 104", "navigable": null }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 75.933847135060645, 11.322792350512087 ], [ 75.933889753249133, 11.322798562345062 ], [ 75.933969374391765, 11.32272783214799 ], [ 75.933974269724189, 11.322682090454347 ], [ 75.933907267667195, 11.322609899360417 ], [ 75.933895910867193, 11.322620136144565 ], [ 75.933797655040351, 11.322708701895094 ], [ 75.93378197019976, 11.322722839880358 ], [ 75.933847135060645, 11.322792350512087 ] ] ] ] } },
        { "type": "Feature", "properties": { "id": 3, "room_no": null, "level": 1, "category": "toilet", "name": "ladies toilet", "navigable": null }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 75.93353059422526, 11.322568336195328 ], [ 75.93356947649869, 11.322534446839239 ], [ 75.933579737545784, 11.322545040214768 ], [ 75.933604608325382, 11.322570716492139 ], [ 75.933566167605704, 11.322607199149445 ], [ 75.93353059422526, 11.322568336195328 ] ] ] ] } },
        { "type": "Feature", "properties": { "id": 4, "room_no": null, "level": 1, "category": "toilet", "name": "gents toilet", "navigable": null }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 75.933762978536521, 11.322822209662538 ], [ 75.93380027490177, 11.322790311394915 ], [ 75.933793660350318, 11.322783460254193 ], [ 75.933765208528001, 11.3227539907652 ], [ 75.933730110327488, 11.322786302062037 ], [ 75.933762978536521, 11.322822209662538 ] ] ] ] } },
        { "type": "Feature", "properties": { "id": 5, "room_no": "102", "level": 1, "category": "classroom", "name": "elhc 102", "navigable": null }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 75.933593465715504, 11.322637021591081 ], [ 75.933701475195008, 11.322541476685879 ], [ 75.933711195805998, 11.322551795107497 ], [ 75.933743964083561, 11.322586578607991 ], [ 75.933742992462726, 11.322603489219018 ], [ 75.933742404858322, 11.322613716201769 ], [ 75.933649030785006, 11.322697724906824 ], [ 75.933593465715504, 11.322637021591081 ] ] ] ] } },
        { "type": "Feature", "properties": { "id": 6, "room_no": "103", "level": 1, "category": "classroom", "name": "elhc 103", "navigable": null }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 75.933742404858322, 11.322613716201769 ], [ 75.933752414035396, 11.322614082761781 ], [ 75.933768792171776, 11.32261468256833 ], [ 75.933800837180939, 11.322647614531974 ], [ 75.933809332028773, 11.322656344502928 ], [ 75.933701370665162, 11.322754904779835 ], [ 75.933649030785006, 11.322697724906824 ], [ 75.933742404858322, 11.322613716201769 ] ] ] ] } }
      ]
    }
  },
  {
    id: 'elhc_f2',
    buildingId: 'elhc',
    level: 2,
    name: 'First Floor',
    path: { "type": "FeatureCollection", "name": "elhc_path_2", "features": [] },
    poi: { "type": "FeatureCollection", "name": "elhc_poi_2", "features": [] },
    units: { "type": "FeatureCollection", "name": "elhc_units_2", "features": [] }
  }
]

export const roomData = [
  { id: 'r1', roomNo: '101', buildingId: 'elhc', floorId: 'elhc_f1', floorLevel: 1, category: 'classroom', name: 'ELHC 101', capacity: 60, area: '75 sqm', description: 'Main undergraduate classroom for ECE', status: 'active' },
  { id: 'r2', roomNo: '102', buildingId: 'elhc', floorId: 'elhc_f1', floorLevel: 1, category: 'classroom', name: 'ELHC 102', capacity: 60, area: '75 sqm', description: 'Undergraduate classroom', status: 'active' },
  { id: 'r3', roomNo: '103', buildingId: 'elhc', floorId: 'elhc_f1', floorLevel: 1, category: 'classroom', name: 'ELHC 103', capacity: 60, area: '75 sqm', description: 'Undergraduate classroom', status: 'active' },
  { id: 'r4', roomNo: '104', buildingId: 'elhc', floorId: 'elhc_f1', floorLevel: 1, category: 'lab', name: 'ELHC 104', capacity: 30, area: '80 sqm', description: 'Electronics Hardware Lab', status: 'active' },
  { id: 'r5', roomNo: null, buildingId: 'elhc', floorId: 'elhc_f1', floorLevel: 1, category: 'toilet', name: 'Ladies Toilet', capacity: null, area: '15 sqm', description: "Women's restroom, ground floor", status: 'active' },
  { id: 'r6', roomNo: null, buildingId: 'elhc', floorId: 'elhc_f1', floorLevel: 1, category: 'toilet', name: 'Gents Toilet', capacity: null, area: '15 sqm', description: "Men's restroom, ground floor", status: 'active' },
]

export const categoryOptions = ['classroom', 'lab', 'hall', 'office', 'toilet', 'corridor', 'staircase', 'store', 'canteen', 'other']
export const pathTypeOptions = ['entry', 'rentry', 'c', 'stairs']
