import { useState } from "react";
import { Plus, X } from "lucide-react";
import FileUploadBox from "./FileUploadBox";
import { S } from "./constants";

type EntriesInputProps = {
  isEdit: boolean;
  entriesFile: File | null;
  entriesError: string;
  onFileChange: (f: File | null) => void;
  manualPoints: { lng: string; lat: string }[];
  onAddPoint: () => void;
  onRemovePoint: (i: number) => void;
  onPointChange: (i: number, key: "lng" | "lat", val: string) => void;
};

export default function EntriesInput({
  isEdit,
  entriesFile,
  entriesError,
  onFileChange,
  manualPoints,
  onAddPoint,
  onRemovePoint,
  onPointChange,
}: EntriesInputProps) {
  const [mode, setMode] = useState<"file" | "manual">("file");

  return (
    <div style={S.formGroup}>
      {/* Label + Upload / Manual toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <label style={{ ...S.label, margin: 0 }}>
          Entry Points{isEdit ? "" : " *"}
        </label>
        <div
          style={{
            display: "flex",
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid #dde6f0",
          }}
        >
          {(["file", "manual"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                background: mode === m ? "#1A3263" : "#fff",
                color: mode === m ? "#fff" : "#547792",
                transition: "background 0.15s",
              }}
            >
              {m === "file" ? "Upload" : "Manual"}
            </button>
          ))}
        </div>
      </div>

      {mode === "file" ? (
        <>
          <FileUploadBox
            label=""
            hint={
              isEdit
                ? "Click to replace existing entry points (optional)"
                : "Click to upload entries .json file"
            }
            accept=".json"
            file={entriesFile}
            error={entriesError}
            onChange={onFileChange}
          />
          <p style={{ fontSize: 11, color: "#9aafbf", margin: "-8px 0 0" }}>
            Format: {"[ [lng, lat], [lng, lat] ]"} — one pair per entry point
          </p>
        </>
      ) : (
        <div>
          {manualPoints.length === 0 && (
            <p
              style={{
                fontSize: 13,
                color: "#9aafbf",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              No points added yet.
            </p>
          )}

          {manualPoints.map((pt, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <input
                style={{ ...S.input, flex: 1 }}
                type="number"
                step="any"
                placeholder="Longitude"
                value={pt.lng}
                onChange={(e) => onPointChange(i, "lng", e.target.value)}
              />
              <input
                style={{ ...S.input, flex: 1 }}
                type="number"
                step="any"
                placeholder="Latitude"
                value={pt.lat}
                onChange={(e) => onPointChange(i, "lat", e.target.value)}
              />
              <button
                onClick={() => onRemovePoint(i)}
                style={{
                  background: "#fce8e6",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px",
                  cursor: "pointer",
                  display: "flex",
                  flexShrink: 0,
                }}
                title="Remove point"
              >
                <X size={14} color="#d93025" />
              </button>
            </div>
          ))}

          <button
            onClick={onAddPoint}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              background: "#f0f4f9",
              border: "1px dashed #dde6f0",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 13,
              color: "#547792",
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              width: "100%",
            }}
          >
            <Plus size={14} /> Add Entry Point
          </button>
        </div>
      )}
    </div>
  );
}