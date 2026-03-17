// ─── Shared domain types ──────────────────────────────────────────────────────
// No external imports needed — pure type declarations.

export type SelectedFeature =
  | { kind: "path"; id: string }
  | { kind: "poi";  name: string }
  | { kind: "unit"; index: number };

export type ActiveTab = "paths" | "poi" | "units";
