-- ============================================================
-- V2: Seed admin user + ELHC building data
-- ============================================================

-- Default admin (password = "admin123" BCrypt-hashed)
INSERT INTO admin_users (email, password, full_name, role) VALUES
  ('admin@nitc.ac.in',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK9HLV2qK',
   'NIT Calicut Admin', 'ADMIN');

-- ELHC Building
INSERT INTO buildings (id, code, name, full_name, institute, location, year_built, total_floors,
                       longitude, latitude, description, outline_geojson)
VALUES (
  'elhc', 'ELHC', 'ELHC', 'Electronics & Hardware Complex',
  'National Institute of Technology Calicut',
  'NIT Campus, Calicut, Kerala - 673601',
  2005, 3,
  75.93370, 11.32258,
  'Houses the departments of Electronics & Communication Engineering and related labs.',
  '{
    "type": "FeatureCollection",
    "name": "building_elhc",
    "features": [{
      "type": "Feature",
      "properties": {"id": 1, "name": "ELHC"},
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[[75.93353059422526,11.322568336195328],[75.93356947649869,11.322534446839239],[75.933597977036712,11.322509606085463],[75.933577819785427,11.322487582291158],[75.933583003078596,11.322449181825242],[75.933679469924058,11.322364474896901],[75.933758619684482,11.322450960382797],[75.933777664533949,11.322471770335225],[75.93376671406152,11.322481568901631],[75.93372496771984,11.322518923844081],[75.93378046507857,11.322578632641815],[75.933834536778662,11.32263680758223],[75.933876289880232,11.322599508716866],[75.93388795349459,11.322589089380301],[75.933907267667195,11.322609899360417],[75.933974269724189,11.322682090454347],[75.933969374391765,11.32272783214799],[75.933889753249133,11.322798562345062],[75.93384713506066,11.322792350512087],[75.933824962084259,11.322769197315262],[75.93380027490177,11.322790311394915],[75.933762978536521,11.322822209662538],[75.933730110327488,11.322786302062037],[75.933701370665162,11.322754904779835],[75.933649030785006,11.322697724906824],[75.933593465715504,11.322637021591081],[75.933566167605704,11.322607199149445],[75.93353059422526,11.322568336195328]]]]
      }
    }]
  }'::jsonb
);

-- ELHC Ground Floor
INSERT INTO floors (id, building_id, level, name, description, path_geojson, poi_geojson, units_geojson, path_toggles)
VALUES (
  'elhc-f1', 'elhc', 1, 'Ground Floor', 'Main entry level with classrooms 101-104',
  '{"type":"FeatureCollection","name":"elhc_path_1","features":[{"type":"Feature","properties":{"id":1,"name":"p1","type":"entry","navigable":"y"},"geometry":{"type":"MultiLineString","coordinates":[[[75.93378046507857,11.322578632641815],[75.93376664823694,11.322591367171102]]]}},{"type":"Feature","properties":{"id":2,"name":"p2","type":"c","navigable":"y"},"geometry":{"type":"MultiLineString","coordinates":[[[75.93376664823694,11.322591367171102],[75.933753005015816,11.322603980419029]]]}},{"type":"Feature","properties":{"id":28,"name":null,"type":"stairs","navigable":"y"},"geometry":{"type":"MultiLineString","coordinates":[[[75.933612382386826,11.322575600610397],[75.933577865681173,11.322607612181441]]]}}]}'::jsonb,
  '{"type":"FeatureCollection","name":"elhc_poi_1","features":[{"type":"Feature","properties":{"id":null,"type":"entry","access":"y","name":"entry1"},"geometry":{"type":"Point","coordinates":[75.93378046507857,11.322578632641815]}},{"type":"Feature","properties":{"id":null,"type":"entry","access":"y","name":"entry2"},"geometry":{"type":"Point","coordinates":[75.93376671406152,11.322481568901631]}}]}'::jsonb,
  '{"type":"FeatureCollection","name":"elhc_units_1","features":[{"type":"Feature","properties":{"id":1,"room_no":"101","level":1,"category":"classroom","name":"elhc 101"},"geometry":{"type":"MultiPolygon","coordinates":[[[[75.933577819785427,11.322487582291158],[75.933583003078596,11.322449181825242],[75.933679469924058,11.322364474896901],[75.933758619684482,11.322450960382797],[75.933747241910197,11.322460503083013],[75.933648872129098,11.322543007196384],[75.933637936765507,11.322552178837554],[75.933577819785427,11.322487582291158]]]]}}]}'::jsonb,
  '{"1":true,"2":true,"28":true}'::jsonb
);

-- Rooms
INSERT INTO rooms (id, building_id, floor_id, room_no, name, category, level, capacity, accessible, feature_id) VALUES
  ('elhc-101', 'elhc', 'elhc-f1', '101', 'ELHC 101', 'classroom', 1, 60, true, 1),
  ('elhc-102', 'elhc', 'elhc-f1', '102', 'ELHC 102', 'classroom', 1, 60, true, 5),
  ('elhc-103', 'elhc', 'elhc-f1', '103', 'ELHC 103', 'classroom', 1, 60, true, 6),
  ('elhc-104', 'elhc', 'elhc-f1', '104', 'ELHC 104', 'classroom', 1, 60, true, 2),
  ('elhc-ladies', 'elhc', 'elhc-f1', 'T-L', 'Ladies Toilet', 'toilet', 1, NULL, true, 3),
  ('elhc-gents',  'elhc', 'elhc-f1', 'T-G', 'Gents Toilet',  'toilet', 1, NULL, true, 4);

-- Outdoor seed locations
INSERT INTO outdoor_locations (name, short_code, loc_type, description, navigable, latitude, longitude) VALUES
  ('ELHC Block',       'ELHC',   'building',  'Electronics & Hardware Lab Complex, main entrance on west side.', true,  11.32258, 75.93370),
  ('Main Gate',        'GATE-1', 'entrance',  'Primary campus entrance, open 6 AM – 10 PM.',                  true,  11.32310, 75.93290),
  ('Staff Parking A',  'PKG-A',  'parking',   'Reserved for faculty. 40 slots.',                               false, 11.32195, 75.93420),
  ('Central Fountain', '',       'landmark',  'Iconic campus landmark near the admin block.',                  true,  11.32270, 75.93350),
  ('Medical Centre',   'MED',    'emergency', 'First aid and health services. Open 24 hours.',                 true,  11.32240, 75.93400);

-- Seed log entry
INSERT INTO activity_logs (admin_email, action, entity, entity_id, entity_name, details)
VALUES ('admin@nitc.ac.in', 'CREATE', 'Building', 'elhc', 'ELHC',
        'Initial seed: Created building Electronics & Hardware Complex');
