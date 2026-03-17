-- ============================================================
-- Atlas Admin — PostgreSQL Schema
-- V1: Initial schema
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Admin users ─────────────────────────────────────────────
CREATE TABLE admin_users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,  -- BCrypt hash
    full_name   VARCHAR(255),
    role        VARCHAR(50)  NOT NULL DEFAULT 'ADMIN',
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Buildings ────────────────────────────────────────────────
CREATE TABLE buildings (
    id             VARCHAR(100) PRIMARY KEY,         -- e.g. "elhc"
    code           VARCHAR(20)  NOT NULL UNIQUE,     -- e.g. "ELHC"
    name           VARCHAR(100) NOT NULL,
    full_name      VARCHAR(255) NOT NULL,
    institute      VARCHAR(255) NOT NULL DEFAULT 'National Institute of Technology Calicut',
    location       VARCHAR(500),
    year_built     INTEGER,
    total_floors   INTEGER      NOT NULL DEFAULT 1,
    longitude      DOUBLE PRECISION,                 -- [lng, lat] stored separately
    latitude       DOUBLE PRECISION,
    description    TEXT,
    outline_geojson JSONB,                           -- GeoJSON FeatureCollection
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Floors ───────────────────────────────────────────────────
CREATE TABLE floors (
    id              VARCHAR(150) PRIMARY KEY,        -- e.g. "elhc-f1"
    building_id     VARCHAR(100) NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    level           INTEGER      NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    path_geojson    JSONB,                           -- navigation paths FeatureCollection
    poi_geojson     JSONB,                           -- points of interest FeatureCollection
    units_geojson   JSONB,                           -- room polygons FeatureCollection
    path_toggles    JSONB        NOT NULL DEFAULT '{}',  -- { "pathId": true/false }
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (building_id, level)
);

-- ── Room categories ──────────────────────────────────────────
CREATE TYPE room_category AS ENUM (
    'classroom', 'lab', 'hall', 'office',
    'toilet', 'stairs', 'corridor', 'other'
);

-- ── Rooms ────────────────────────────────────────────────────
CREATE TABLE rooms (
    id           VARCHAR(150) PRIMARY KEY,
    building_id  VARCHAR(100) NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    floor_id     VARCHAR(150) NOT NULL REFERENCES floors(id)    ON DELETE CASCADE,
    room_no      VARCHAR(20)  NOT NULL,
    name         VARCHAR(255) NOT NULL,
    category     room_category NOT NULL DEFAULT 'classroom',
    level        INTEGER,
    capacity     INTEGER,
    description  TEXT,
    accessible   BOOLEAN NOT NULL DEFAULT TRUE,
    feature_id   INTEGER,                            -- links to GeoJSON feature id
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Outdoor locations ────────────────────────────────────────
CREATE TYPE location_type AS ENUM (
    'building', 'entrance', 'parking', 'landmark', 'emergency', 'other'
);

CREATE TABLE outdoor_locations (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    short_code   VARCHAR(20),
    loc_type     location_type NOT NULL DEFAULT 'other',
    description  TEXT,
    navigable    BOOLEAN NOT NULL DEFAULT TRUE,
    latitude     DOUBLE PRECISION NOT NULL,
    longitude    DOUBLE PRECISION NOT NULL,
    saved_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Audit / Admin logs ───────────────────────────────────────
CREATE TYPE log_action AS ENUM ('CREATE','UPDATE','DELETE','LOGIN','LOGOUT');
CREATE TYPE log_entity AS ENUM ('Building','Floor','Room','Path','POI','Auth','OutdoorLocation');

CREATE TABLE activity_logs (
    id           BIGSERIAL PRIMARY KEY,
    admin_email  VARCHAR(255) NOT NULL,
    action       log_action   NOT NULL,
    entity       log_entity   NOT NULL,
    entity_id    VARCHAR(255),
    entity_name  VARCHAR(255),
    details      TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_floors_building      ON floors(building_id);
CREATE INDEX idx_rooms_building       ON rooms(building_id);
CREATE INDEX idx_rooms_floor          ON rooms(floor_id);
CREATE INDEX idx_rooms_category       ON rooms(category);
CREATE INDEX idx_logs_admin           ON activity_logs(admin_email);
CREATE INDEX idx_logs_action          ON activity_logs(action);
CREATE INDEX idx_logs_entity          ON activity_logs(entity);
CREATE INDEX idx_logs_created         ON activity_logs(created_at DESC);
CREATE INDEX idx_outdoor_type         ON outdoor_locations(loc_type);

-- ── GIN indexes for JSONB queries ────────────────────────────
CREATE INDEX idx_buildings_outline_gin ON buildings USING GIN (outline_geojson);
CREATE INDEX idx_floors_paths_gin      ON floors    USING GIN (path_geojson);
CREATE INDEX idx_floors_units_gin      ON floors    USING GIN (units_geojson);

-- ── Updated_at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_buildings_updated BEFORE UPDATE ON buildings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_floors_updated BEFORE UPDATE ON floors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_rooms_updated BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_outdoor_updated BEFORE UPDATE ON outdoor_locations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
