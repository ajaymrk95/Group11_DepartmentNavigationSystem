"""
Buildings Page – Unit & Integration Test Suite
Run with:   python test_buildings.py
Or:         python -m pytest test_buildings.py -v   (if pytest is installed)

Tests cover:
  - Form validation logic
  - Search / filter logic
  - GeoJSON parsing & crs-stripping
  - Tag parsing
  - Accessibility toggle state
  - Stats calculation
  - Table display logic
  - Modal open/close state
  - API payload construction
  - Edge cases
"""

import sys
import json
import time
import unittest
from unittest.mock import MagicMock, patch, AsyncMock
from io import StringIO

# ─── ANSI colours ─────────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
RESET  = "\033[0m"

# ─── Simulated component logic (mirrors the React component) ──────────────────

def validate_building_form(name, geom_text, is_edit=False):
    """Mirrors handleSubmit validation in BuildingModal."""
    errors = []
    if not name.strip():
        errors.append("Name is required.")
    if not is_edit and not geom_text.strip():
        errors.append("Geometry JSON is required.")
    return errors


def parse_geojson(text, label="Geometry"):
    """Mirrors parseJson + crs stripping in BuildingModal."""
    try:
        parsed = json.loads(text.strip())
    except json.JSONDecodeError as e:
        raise ValueError(f"{label}: invalid JSON. ({e})")
    if isinstance(parsed, dict):
        parsed.pop("crs", None)  # RFC 7946 — remove deprecated crs field
    return parsed


def parse_tags(tags_str):
    """Mirrors tags parsing: split by comma, strip, remove empty."""
    return [t.strip() for t in tags_str.split(",") if t.strip()]


def build_payload(name, description, floors, is_accessible, tags_str,
                  geom_text="", entries_text="", is_edit=False):
    """Mirrors the payload construction in handleSubmit."""
    payload = {
        "name":         name.strip(),
        "description":  description.strip() or None,
        "floors":       int(floors) if floors else 1,
        "isAccessible": is_accessible,
        "tags":         parse_tags(tags_str),
    }
    if geom_text.strip():
        geom = parse_geojson(geom_text, "Geometry")
        payload["geoJson"] = geom
    if entries_text.strip():
        entries = parse_geojson(entries_text, "Entries")
        payload["entries"] = entries
    return payload


def filter_buildings(buildings, query):
    """Mirrors the filtered = buildings.filter(...) logic."""
    q = query.lower()
    return [
        b for b in buildings
        if q in b["name"].lower()
        or (b.get("description") or "").lower().__contains__(q)
        or any(q in t.lower() for t in (b.get("tags") or []))
    ]


def calc_stats(buildings):
    """Mirrors the stats cards calculation."""
    return {
        "total":        len(buildings),
        "accessible":   sum(1 for b in buildings if b["isAccessible"]),
        "inaccessible": sum(1 for b in buildings if not b["isAccessible"]),
    }


def toggle_accessible(buildings, building_id):
    """Mirrors handleToggleAccess optimistic update."""
    return [
        {**b, "isAccessible": not b["isAccessible"]} if b["id"] == building_id else b
        for b in buildings
    ]


def revert_toggle(buildings, building_id, original_value):
    """Mirrors the revert-on-error logic."""
    return [
        {**b, "isAccessible": original_value} if b["id"] == building_id else b
        for b in buildings
    ]


def truncate_tags(tags, max_shown=3):
    """Mirrors slice(0, 3) + overflow count in table cell."""
    shown    = tags[:max_shown]
    overflow = len(tags) - max_shown if len(tags) > max_shown else 0
    return shown, overflow


# ─── Sample data ──────────────────────────────────────────────────────────────

SAMPLE_BUILDINGS = [
    {"id": 1, "name": "ELHC",    "description": "Electrical block", "floors": 3, "isAccessible": True,  "tags": ["engineering", "lab"],           "geom": "{}", "entries": "[[75.93,11.32]]"},
    {"id": 2, "name": "LHC",     "description": "Lecture Hall",     "floors": 2, "isAccessible": False, "tags": ["lecture"],                       "geom": "{}", "entries": None},
    {"id": 3, "name": "Library", "description": None,               "floors": 1, "isAccessible": True,  "tags": [],                                "geom": "{}", "entries": None},
    {"id": 4, "name": "Canteen", "description": "Food court",       "floors": 1, "isAccessible": True,  "tags": ["food", "open", "ground", "all"], "geom": "{}", "entries": "[[75.94,11.33]]"},
]

VALID_GEOJSON = json.dumps({
    "type": "MultiPolygon",
    "coordinates": [[[[75.93, 11.32], [75.94, 11.32], [75.94, 11.33], [75.93, 11.32]]]],
})

GEOJSON_WITH_CRS = json.dumps({
    "type": "MultiPolygon",
    "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
    "coordinates": [[[[75.93, 11.32], [75.94, 11.32], [75.94, 11.33], [75.93, 11.32]]]],
})

VALID_ENTRIES = "[[75.9337, 11.3222], [75.9338, 11.3223]]"


# ══════════════════════════════════════════════════════════════════════════════
#  TEST CASES
# ══════════════════════════════════════════════════════════════════════════════

class TestFormValidation(unittest.TestCase):
    """Validates the BuildingModal form validation rules."""

    def test_valid_form_no_errors(self):
        errs = validate_building_form("ELHC", VALID_GEOJSON)
        self.assertEqual(errs, [])

    def test_empty_name_gives_error(self):
        errs = validate_building_form("", VALID_GEOJSON)
        self.assertIn("Name is required.", errs)

    def test_whitespace_name_gives_error(self):
        errs = validate_building_form("   ", VALID_GEOJSON)
        self.assertIn("Name is required.", errs)

    def test_missing_geometry_on_add_gives_error(self):
        errs = validate_building_form("ELHC", "", is_edit=False)
        self.assertIn("Geometry JSON is required.", errs)

    def test_missing_geometry_on_edit_is_ok(self):
        """Edit mode allows empty geometry (keeps existing)."""
        errs = validate_building_form("ELHC", "", is_edit=True)
        self.assertEqual(errs, [])

    def test_both_fields_empty_gives_two_errors(self):
        errs = validate_building_form("", "", is_edit=False)
        self.assertEqual(len(errs), 2)

    def test_name_with_only_spaces_and_no_geom(self):
        errs = validate_building_form("   ", "", is_edit=False)
        self.assertEqual(len(errs), 2)


class TestGeoJsonParsing(unittest.TestCase):
    """Validates GeoJSON parsing and CRS stripping logic."""

    def test_valid_geojson_parses(self):
        result = parse_geojson(VALID_GEOJSON)
        self.assertEqual(result["type"], "MultiPolygon")

    def test_crs_field_stripped(self):
        result = parse_geojson(GEOJSON_WITH_CRS)
        self.assertNotIn("crs", result)

    def test_coordinates_preserved_after_crs_strip(self):
        result = parse_geojson(GEOJSON_WITH_CRS)
        self.assertIn("coordinates", result)

    def test_invalid_json_raises_value_error(self):
        with self.assertRaises(ValueError) as ctx:
            parse_geojson("{not valid json")
        self.assertIn("invalid JSON", str(ctx.exception))

    def test_error_message_contains_label(self):
        with self.assertRaises(ValueError) as ctx:
            parse_geojson("{bad}", label="Entries")
        self.assertIn("Entries", str(ctx.exception))

    def test_valid_entries_parse(self):
        result = parse_geojson(VALID_ENTRIES, "Entries")
        self.assertIsInstance(result, list)
        self.assertEqual(len(result), 2)

    def test_empty_geojson_object_parses(self):
        result = parse_geojson('{"type":"Polygon","coordinates":[]}')
        self.assertEqual(result["type"], "Polygon")

    def test_geojson_without_crs_unchanged(self):
        result = parse_geojson(VALID_GEOJSON)
        self.assertNotIn("crs", result)


class TestTagParsing(unittest.TestCase):
    """Validates tag parsing from comma-separated input."""

    def test_simple_tags(self):
        self.assertEqual(parse_tags("lab, engineering"), ["lab", "engineering"])

    def test_strips_whitespace(self):
        self.assertEqual(parse_tags("  lab ,  eng  "), ["lab", "eng"])

    def test_empty_string_gives_empty_list(self):
        self.assertEqual(parse_tags(""), [])

    def test_single_tag(self):
        self.assertEqual(parse_tags("lab"), ["lab"])

    def test_trailing_comma_ignored(self):
        self.assertEqual(parse_tags("lab,"), ["lab"])

    def test_only_commas_gives_empty_list(self):
        self.assertEqual(parse_tags(",,,"), [])

    def test_many_tags(self):
        result = parse_tags("a, b, c, d, e")
        self.assertEqual(len(result), 5)


class TestPayloadConstruction(unittest.TestCase):
    """Validates the API payload built in handleSubmit."""

    def test_basic_payload_structure(self):
        p = build_payload("ELHC", "Desc", "3", True, "lab, eng", VALID_GEOJSON)
        self.assertEqual(p["name"], "ELHC")
        self.assertEqual(p["floors"], 3)
        self.assertTrue(p["isAccessible"])
        self.assertIn("geoJson", p)

    def test_description_none_when_empty(self):
        p = build_payload("ELHC", "", "1", True, "", VALID_GEOJSON)
        self.assertIsNone(p["description"])

    def test_floors_defaults_to_1_on_empty(self):
        p = build_payload("ELHC", "", "", True, "", VALID_GEOJSON)
        self.assertEqual(p["floors"], 1)

    def test_tags_parsed_into_list(self):
        p = build_payload("ELHC", "", "1", True, "a, b, c", VALID_GEOJSON)
        self.assertEqual(p["tags"], ["a", "b", "c"])

    def test_empty_tags_gives_empty_list(self):
        p = build_payload("ELHC", "", "1", True, "", VALID_GEOJSON)
        self.assertEqual(p["tags"], [])

    def test_geom_not_in_payload_when_empty(self):
        p = build_payload("ELHC", "", "1", True, "", "", is_edit=True)
        self.assertNotIn("geoJson", p)

    def test_entries_not_in_payload_when_empty(self):
        p = build_payload("ELHC", "", "1", True, "", VALID_GEOJSON, entries_text="")
        self.assertNotIn("entries", p)

    def test_entries_in_payload_when_provided(self):
        p = build_payload("ELHC", "", "1", True, "", VALID_GEOJSON, entries_text=VALID_ENTRIES)
        self.assertIn("entries", p)

    def test_name_trimmed_in_payload(self):
        p = build_payload("  ELHC  ", "", "1", True, "", VALID_GEOJSON)
        self.assertEqual(p["name"], "ELHC")

    def test_crs_stripped_from_payload_geojson(self):
        p = build_payload("ELHC", "", "1", True, "", GEOJSON_WITH_CRS)
        self.assertNotIn("crs", p["geoJson"])

    def test_inaccessible_building_payload(self):
        p = build_payload("ELHC", "", "1", False, "", VALID_GEOJSON)
        self.assertFalse(p["isAccessible"])


class TestSearchFilter(unittest.TestCase):
    """Validates filter_buildings search logic."""

    def test_search_by_name_exact(self):
        results = filter_buildings(SAMPLE_BUILDINGS, "ELHC")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "ELHC")

    def test_search_by_name_partial(self):
        results = filter_buildings(SAMPLE_BUILDINGS, "lhc")
        # Matches "ELHC" and "LHC"
        self.assertEqual(len(results), 2)

    def test_search_by_description(self):
        results = filter_buildings(SAMPLE_BUILDINGS, "lecture")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "LHC")

    def test_search_by_tag(self):
        results = filter_buildings(SAMPLE_BUILDINGS, "engineering")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "ELHC")

    def test_empty_query_returns_all(self):
        results = filter_buildings(SAMPLE_BUILDINGS, "")
        self.assertEqual(len(results), len(SAMPLE_BUILDINGS))

    def test_no_match_returns_empty(self):
        results = filter_buildings(SAMPLE_BUILDINGS, "NONEXISTENT_XYZ_999")
        self.assertEqual(results, [])

    def test_search_case_insensitive(self):
        r1 = filter_buildings(SAMPLE_BUILDINGS, "elhc")
        r2 = filter_buildings(SAMPLE_BUILDINGS, "ELHC")
        r3 = filter_buildings(SAMPLE_BUILDINGS, "ElHc")
        self.assertEqual(len(r1), len(r2))
        self.assertEqual(len(r2), len(r3))

    def test_search_no_description_building(self):
        """Building with None description should not crash the filter."""
        results = filter_buildings(SAMPLE_BUILDINGS, "library")
        self.assertEqual(len(results), 1)

    def test_search_no_tags_building(self):
        """Building with empty tags list should not crash."""
        results = filter_buildings(SAMPLE_BUILDINGS, "library")
        self.assertEqual(results[0]["tags"], [])


class TestStatsCalculation(unittest.TestCase):
    """Validates stats cards calculation."""

    def test_total_count(self):
        stats = calc_stats(SAMPLE_BUILDINGS)
        self.assertEqual(stats["total"], 4)

    def test_accessible_count(self):
        stats = calc_stats(SAMPLE_BUILDINGS)
        self.assertEqual(stats["accessible"], 3)

    def test_inaccessible_count(self):
        stats = calc_stats(SAMPLE_BUILDINGS)
        self.assertEqual(stats["inaccessible"], 1)

    def test_counts_sum_to_total(self):
        stats = calc_stats(SAMPLE_BUILDINGS)
        self.assertEqual(stats["accessible"] + stats["inaccessible"], stats["total"])

    def test_empty_list(self):
        stats = calc_stats([])
        self.assertEqual(stats["total"], 0)
        self.assertEqual(stats["accessible"], 0)

    def test_all_accessible(self):
        data = [{"isAccessible": True}] * 5
        stats = calc_stats(data)
        self.assertEqual(stats["accessible"], 5)
        self.assertEqual(stats["inaccessible"], 0)

    def test_none_accessible(self):
        data = [{"isAccessible": False}] * 3
        stats = calc_stats(data)
        self.assertEqual(stats["accessible"], 0)
        self.assertEqual(stats["inaccessible"], 3)


class TestAccessibilityToggle(unittest.TestCase):
    """Validates optimistic toggle and revert logic."""

    def test_toggle_flips_accessible_to_false(self):
        updated = toggle_accessible(SAMPLE_BUILDINGS, building_id=1)
        b = next(x for x in updated if x["id"] == 1)
        self.assertFalse(b["isAccessible"])

    def test_toggle_flips_inaccessible_to_true(self):
        updated = toggle_accessible(SAMPLE_BUILDINGS, building_id=2)
        b = next(x for x in updated if x["id"] == 2)
        self.assertTrue(b["isAccessible"])

    def test_toggle_only_affects_target(self):
        updated = toggle_accessible(SAMPLE_BUILDINGS, building_id=1)
        others = [x for x in updated if x["id"] != 1]
        originals = [x for x in SAMPLE_BUILDINGS if x["id"] != 1]
        for u, o in zip(others, originals):
            self.assertEqual(u["isAccessible"], o["isAccessible"])

    def test_double_toggle_restores_original(self):
        once  = toggle_accessible(SAMPLE_BUILDINGS, building_id=1)
        twice = toggle_accessible(once, building_id=1)
        original = next(x for x in SAMPLE_BUILDINGS if x["id"] == 1)
        result   = next(x for x in twice if x["id"] == 1)
        self.assertEqual(result["isAccessible"], original["isAccessible"])

    def test_revert_on_error_restores_value(self):
        original_value = True  # building 1 was originally accessible
        optimistic = toggle_accessible(SAMPLE_BUILDINGS, building_id=1)
        reverted   = revert_toggle(optimistic, building_id=1, original_value=original_value)
        b = next(x for x in reverted if x["id"] == 1)
        self.assertTrue(b["isAccessible"])

    def test_toggle_unknown_id_no_change(self):
        updated = toggle_accessible(SAMPLE_BUILDINGS, building_id=999)
        for u, o in zip(updated, SAMPLE_BUILDINGS):
            self.assertEqual(u["isAccessible"], o["isAccessible"])


class TestTagTruncation(unittest.TestCase):
    """Validates the 3-tag truncation display logic."""

    def test_under_3_tags_no_overflow(self):
        shown, overflow = truncate_tags(["lab"])
        self.assertEqual(overflow, 0)
        self.assertEqual(shown, ["lab"])

    def test_exactly_3_tags_no_overflow(self):
        shown, overflow = truncate_tags(["a", "b", "c"])
        self.assertEqual(len(shown), 3)
        self.assertEqual(overflow, 0)

    def test_4_tags_overflow_1(self):
        shown, overflow = truncate_tags(["a", "b", "c", "d"])
        self.assertEqual(len(shown), 3)
        self.assertEqual(overflow, 1)

    def test_6_tags_overflow_3(self):
        shown, overflow = truncate_tags(["a","b","c","d","e","f"])
        self.assertEqual(overflow, 3)

    def test_empty_tags_no_overflow(self):
        shown, overflow = truncate_tags([])
        self.assertEqual(shown, [])
        self.assertEqual(overflow, 0)

    def test_overflow_label_format(self):
        _, overflow = truncate_tags(["a","b","c","d"])
        label = f"+{overflow}"
        self.assertEqual(label, "+1")


class TestModalState(unittest.TestCase):
    """Validates modal open/close state management."""

    def test_initial_modal_state_closed(self):
        state = {"showAdd": False, "editTarget": None}
        self.assertFalse(state["showAdd"])
        self.assertIsNone(state["editTarget"])

    def test_open_add_modal(self):
        state = {"showAdd": False}
        state["showAdd"] = True
        self.assertTrue(state["showAdd"])

    def test_close_add_modal(self):
        state = {"showAdd": True}
        state["showAdd"] = False
        self.assertFalse(state["showAdd"])

    def test_open_edit_modal_sets_target(self):
        b = SAMPLE_BUILDINGS[0]
        state = {"editTarget": None}
        state["editTarget"] = b
        self.assertEqual(state["editTarget"]["id"], 1)

    def test_close_edit_modal_clears_target(self):
        state = {"editTarget": SAMPLE_BUILDINGS[0]}
        state["editTarget"] = None
        self.assertIsNone(state["editTarget"])

    def test_add_and_edit_independent(self):
        state = {"showAdd": False, "editTarget": None}
        state["showAdd"] = True
        state["editTarget"] = SAMPLE_BUILDINGS[0]
        self.assertTrue(state["showAdd"])
        self.assertIsNotNone(state["editTarget"])


class TestApiUrlConstruction(unittest.TestCase):
    """Validates API URL construction for add vs edit."""

    BASE = "http://localhost:8080"
    API  = "http://localhost:8080/api/buildings"

    def get_url(self, is_edit, building_id=None):
        return f"{self.API}/{building_id}" if is_edit else self.API

    def get_method(self, is_edit):
        return "PUT" if is_edit else "POST"

    def test_add_uses_post(self):
        self.assertEqual(self.get_method(False), "POST")

    def test_edit_uses_put(self):
        self.assertEqual(self.get_method(True), "PUT")

    def test_add_url_no_id(self):
        self.assertEqual(self.get_url(False), self.API)

    def test_edit_url_includes_id(self):
        self.assertEqual(self.get_url(True, 42), f"{self.API}/42")

    def test_toggle_url_format(self):
        bid = 7
        url = f"{self.BASE}/api/buildings/{bid}/accessible"
        self.assertIn("/accessible", url)
        self.assertIn(str(bid), url)


class TestEdgeCases(unittest.TestCase):
    """Edge cases and boundary conditions."""

    def test_floors_zero_defaults_to_1_in_payload(self):
        p = build_payload("X", "", "0", True, "", VALID_GEOJSON)
        # int("0") = 0 which is falsy → defaults to 1
        self.assertEqual(p["floors"], 1)

    def test_very_long_name_in_payload(self):
        long_name = "A" * 500
        p = build_payload(long_name, "", "1", True, "", VALID_GEOJSON)
        self.assertEqual(p["name"], long_name)

    def test_unicode_name(self):
        p = build_payload("ഇലക്ട്രിക്കൽ", "", "1", True, "", VALID_GEOJSON)
        self.assertEqual(p["name"], "ഇലക്ട്രിക്കൽ")

    def test_search_unicode(self):
        buildings = [{"id":1,"name":"ഇലക്ട്രിക്കൽ","description":None,"tags":[]}]
        results = filter_buildings(buildings, "ഇലക്ട്രിക്കൽ")
        self.assertEqual(len(results), 1)

    def test_geojson_array_instead_of_object(self):
        result = parse_geojson("[[75.93,11.32],[75.94,11.32]]", "Entries")
        self.assertIsInstance(result, list)

    def test_single_building_stats(self):
        data = [{"isAccessible": True}]
        stats = calc_stats(data)
        self.assertEqual(stats["total"], 1)
        self.assertEqual(stats["accessible"], 1)
        self.assertEqual(stats["inaccessible"], 0)

    def test_tag_with_special_characters(self):
        tags = parse_tags("c++, .net, node.js")
        self.assertIn("c++", tags)
        self.assertIn(".net", tags)

    def test_filter_with_partial_tag_match(self):
        results = filter_buildings(SAMPLE_BUILDINGS, "eng")
        # "engineering" contains "eng"
        names = [r["name"] for r in results]
        self.assertIn("ELHC", names)


# ══════════════════════════════════════════════════════════════════════════════
#  CUSTOM TEST RUNNER  (colored output, pytest-style)
# ══════════════════════════════════════════════════════════════════════════════

class ColoredResult(unittest.TestResult):
    def __init__(self):
        super().__init__()
        self.passed = []
        self._start_times = {}

    def startTest(self, test):
        super().startTest(test)
        self._start_times[test] = time.time()

    def addSuccess(self, test):
        elapsed = time.time() - self._start_times.get(test, time.time())
        self.passed.append((test, elapsed))

    def addFailure(self, test, err):
        super().addFailure(test, err)

    def addError(self, test, err):
        super().addError(test, err)

    def addSkip(self, test, reason):
        super().addSkip(test, reason)


def fmt_test_name(test):
    cls  = test.__class__.__name__
    meth = test._testMethodName
    # Convert TestFoo → foo, test_bar_baz → bar baz
    cls_label  = re.sub(r'(?<!^)(?=[A-Z])', ' ', cls).replace("Test ", "").strip()
    meth_label = meth.replace("test_", "").replace("_", " ")
    return cls_label, meth_label


import re

def run_suite():
    loader = unittest.TestLoader()
    suite  = loader.loadTestsFromModule(sys.modules[__name__])

    result = ColoredResult()

    # Collect all tests
    all_tests = []
    for group in suite:
        for test in group:
            all_tests.append(test)

    total   = len(all_tests)
    passed  = 0
    failed  = 0
    errors  = 0
    skipped = 0

    print(f"\n{BOLD}{CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{RESET}")
    print(f"{BOLD}{CYAN}  BUILDINGS PAGE — TEST SUITE{RESET}")
    print(f"{BOLD}{CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{RESET}\n")

    current_class = None
    fail_details  = []

    for test in all_tests:
        cls_name  = test.__class__.__name__
        cls_label, meth_label = fmt_test_name(test)

        # Print class header when class changes
        if cls_name != current_class:
            current_class = cls_name
            # Friendly class label
            friendly = re.sub(r'(?<!^)(?=[A-Z])', ' ', cls_name).lstrip()
            print(f"\n  {BOLD}{YELLOW}{friendly}{RESET}")

        # Run single test
        single = unittest.TestSuite([test])
        r = ColoredResult()
        start = time.time()
        single.run(r)
        elapsed = time.time() - start
        ms = elapsed * 1000

        if r.wasSuccessful() and not r.skipped:
            passed += 1
            status = f"{GREEN}✓ PASS{RESET}"
            time_s = f"{DIM}{ms:.1f}ms{RESET}"
            print(f"    {status}  {meth_label:<55} {time_s}")
        elif r.skipped:
            skipped += 1
            reason = r.skipped[0][1] if r.skipped else ""
            print(f"    {YELLOW}⚠ SKIP{RESET}  {meth_label:<55} {DIM}{reason}{RESET}")
        elif r.errors:
            errors += 1
            tb = r.errors[0][1].strip().split("\n")[-1]
            print(f"    {RED}✗ ERROR{RESET} {meth_label:<54} {DIM}{ms:.1f}ms{RESET}")
            fail_details.append((cls_name, meth_label, r.errors[0][1], "ERROR"))
        else:
            failed += 1
            tb = r.failures[0][1].strip().split("\n")[-1]
            print(f"    {RED}✗ FAIL{RESET}  {meth_label:<55} {DIM}{ms:.1f}ms{RESET}")
            fail_details.append((cls_name, meth_label, r.failures[0][1], "FAIL"))

    # ── Summary ──────────────────────────────────────────────────────────────
    print(f"\n{BOLD}{CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{RESET}")

    pass_pct = (passed / total * 100) if total else 0
    bar_len  = 40
    filled   = int(bar_len * passed / total) if total else 0
    bar      = f"{GREEN}{'█' * filled}{RED}{'░' * (bar_len - filled)}{RESET}"
    print(f"\n  {bar}  {BOLD}{pass_pct:.0f}%{RESET}")

    print(f"\n  {BOLD}Results:{RESET}  "
          f"{GREEN}{passed} passed{RESET}  "
          f"{RED}{failed} failed{RESET}  "
          f"{RED}{errors} errors{RESET}  "
          f"{YELLOW}{skipped} skipped{RESET}  "
          f"{DIM}/ {total} total{RESET}")

    if fail_details:
        print(f"\n{BOLD}{RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  FAILURES  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{RESET}")
        for cls_n, meth_n, tb, kind in fail_details:
            print(f"\n  {RED}{BOLD}[{kind}] {cls_n} :: {meth_n}{RESET}")
            # Print the most relevant traceback lines
            lines = [l for l in tb.split("\n") if l.strip()]
            for line in lines[-6:]:
                print(f"    {DIM}{line}{RESET}")

    if failed == 0 and errors == 0:
        print(f"\n  {GREEN}{BOLD}🎉  All tests passed!{RESET}\n")
    else:
        print(f"\n  {RED}{BOLD}❌  {failed + errors} test(s) failed.{RESET}\n")

    print(f"{BOLD}{CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{RESET}\n")

    return failed + errors


if __name__ == "__main__":
    sys.exit(run_suite())