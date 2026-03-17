-- ============================================================
-- V3: Full ELHC floor data — all 3 floors, all rooms,
--     complete path/poi/units GeoJSON
-- Run this only if you need more complete test data beyond V2
-- ============================================================

-- ── ELHC Floor 2 ─────────────────────────────────────────────
INSERT INTO floors (id, building_id, level, name, description, path_geojson, poi_geojson, units_geojson, path_toggles)
VALUES (
  'elhc-f2', 'elhc', 2, 'First Floor', 'Labs and advanced classrooms on first floor',
  '{
    "type": "FeatureCollection",
    "name": "elhc_path_2",
    "features": [
      {"type":"Feature","properties":{"id":1,"name":"main-corridor","type":"c","navigable":"y"},
       "geometry":{"type":"MultiLineString","coordinates":[[[75.93378,11.32258],[75.93370,11.32265]]]}},
      {"type":"Feature","properties":{"id":2,"name":"lab-entry","type":"rentry","navigable":"y"},
       "geometry":{"type":"MultiLineString","coordinates":[[[75.93370,11.32265],[75.93365,11.32270]]]}}
    ]
  }'::jsonb,
  '{
    "type": "FeatureCollection",
    "name": "elhc_poi_2",
    "features": [
      {"type":"Feature","properties":{"id":null,"type":"rentry","access":"y","name":"201entry"},
       "geometry":{"type":"Point","coordinates":[75.93370,11.32265]}},
      {"type":"Feature","properties":{"id":null,"type":"rentry","access":"y","name":"202entry"},
       "geometry":{"type":"Point","coordinates":[75.93365,11.32270]}}
    ]
  }'::jsonb,
  '{
    "type": "FeatureCollection",
    "name": "elhc_units_2",
    "features": [
      {"type":"Feature","properties":{"id":1,"room_no":"201","level":2,"category":"lab","name":"EC Lab"},
       "geometry":{"type":"MultiPolygon","coordinates":[[[[75.93353,11.32268],[75.93368,11.32255],[75.93375,11.32262],[75.93360,11.32275],[75.93353,11.32268]]]]}},
      {"type":"Feature","properties":{"id":2,"room_no":"202","level":2,"category":"lab","name":"DSP Lab"},
       "geometry":{"type":"MultiPolygon","coordinates":[[[[75.93375,11.32262],[75.93390,11.32250],[75.93397,11.32257],[75.93382,11.32270],[75.93375,11.32262]]]]}}
    ]
  }'::jsonb,
  '{"1":true,"2":true}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ── ELHC Floor 3 ─────────────────────────────────────────────
INSERT INTO floors (id, building_id, level, name, description, path_geojson, poi_geojson, units_geojson, path_toggles)
VALUES (
  'elhc-f3', 'elhc', 3, 'Second Floor', 'Faculty offices and seminar rooms',
  NULL, NULL, NULL,
  '{}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ── Rooms for Floor 2 ─────────────────────────────────────────
INSERT INTO rooms (id, building_id, floor_id, room_no, name, category, level, capacity, description, accessible, feature_id)
VALUES
  ('elhc-201', 'elhc', 'elhc-f2', '201', 'EC Lab',  'lab', 2, 30, 'Electronics & Circuits Laboratory', false, 1),
  ('elhc-202', 'elhc', 'elhc-f2', '202', 'DSP Lab', 'lab', 2, 30, 'Digital Signal Processing Lab',     false, 2),
  ('elhc-203', 'elhc', 'elhc-f2', '203', 'ELHC 203', 'classroom', 2, 60, 'Standard lecture room', true, NULL)
ON CONFLICT (id) DO NOTHING;

-- ── Rooms for Floor 3 ─────────────────────────────────────────
INSERT INTO rooms (id, building_id, floor_id, room_no, name, category, level, capacity, description, accessible, feature_id)
VALUES
  ('elhc-301', 'elhc', 'elhc-f3', '301', 'HOD Office',     'office', 3, 5,  'Head of Department office',   true,  NULL),
  ('elhc-302', 'elhc', 'elhc-f3', '302', 'Seminar Hall',   'hall',   3, 80, 'Departmental seminar hall',   true,  NULL),
  ('elhc-303', 'elhc', 'elhc-f3', '303', 'Faculty Room',   'office', 3, 20, 'Faculty common room',         true,  NULL),
  ('elhc-304', 'elhc', 'elhc-f3', '304', 'Research Lab',   'lab',    3, 15, 'Advanced research laboratory', false, NULL)
ON CONFLICT (id) DO NOTHING;

-- ── More outdoor locations ────────────────────────────────────
INSERT INTO outdoor_locations (name, short_code, loc_type, description, navigable, latitude, longitude)
VALUES
  ('Lecture Theatre Complex', 'LTC',    'building',  'Main lecture theatre complex with large auditorium', true,  11.32180, 75.93450),
  ('Library',                 'LIB',    'building',  'Central library, open 8 AM – 10 PM',                 true,  11.32320, 75.93510),
  ('Sports Ground',           'SPORT',  'landmark',  'Main sports ground and athletics track',             true,  11.32100, 75.93300),
  ('Hostel Block A',          'HST-A',  'building',  'Boys hostel block A, 200 rooms',                    true,  11.32050, 75.93600),
  ('Guest House',             'GH',     'building',  'Institute guest house for visitors',                 true,  11.32400, 75.93200),
  ('Staff Parking B',         'PKG-B',  'parking',   'Open parking near main block. 80 slots.',           false, 11.32250, 75.93550),
  ('Main Gate 2',             'GATE-2', 'entrance',  'Secondary campus entrance, exit only after 8 PM',   true,  11.32350, 75.93150),
  ('Fire Station Point',      'FIRE',   'emergency', 'Fire assembly point and extinguisher station',       true,  11.32290, 75.93480)
ON CONFLICT DO NOTHING;

-- ── Seed logs for the new data ────────────────────────────────
INSERT INTO activity_logs (admin_email, action, entity, entity_id, entity_name, details)
VALUES
  ('admin@nitc.ac.in', 'CREATE', 'Floor', 'elhc-f2', 'ELHC First Floor',  'Seed: ELHC First Floor with EC Lab and DSP Lab'),
  ('admin@nitc.ac.in', 'CREATE', 'Floor', 'elhc-f3', 'ELHC Second Floor', 'Seed: ELHC Second Floor faculty offices'),
  ('admin@nitc.ac.in', 'CREATE', 'Room',  'elhc-201', 'EC Lab',           'Seed: EC Lab room assigned'),
  ('admin@nitc.ac.in', 'CREATE', 'Room',  'elhc-301', 'HOD Office',       'Seed: HOD Office assigned');
