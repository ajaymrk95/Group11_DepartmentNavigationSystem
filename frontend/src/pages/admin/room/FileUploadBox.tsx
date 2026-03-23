import { X } from "lucide-react";
import { S } from "./constants";

type FileUploadBoxProps = {
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  error: string;
  onChange: (f: File | null) => void;
};

export default function FileUploadBox({
  label,
  hint,
  accept,
  file,
  error,
  onChange,
}: FileUploadBoxProps) {
  const hasError = !!error;

  return (
    <div style={S.formGroup}>
      {label && <label style={S.label}>{label}</label>}

      {file ? (
        <div
          style={{
            border: `1.5px solid ${hasError ? "#ff3b30" : "#34c759"}`,
            borderRadius: 10,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: hasError ? "#fff5f5" : "#f0fdf4",
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: hasError ? "#ff3b30" : "#1e8e3e",
              fontWeight: 500,
            }}
          >
            ✓ {file.name}
          </span>
          <button
            onClick={() => onChange(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9aafbf",
              display: "flex",
              padding: 2,
            }}
            title="Remove file"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <label
          style={{
            border: `1.5px dashed ${hasError ? "#ff3b30" : "#dde6f0"}`,
            borderRadius: 10,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            cursor: "pointer",
            background: hasError ? "#fff5f5" : "#fafcff",
          }}
        >
          <input
            type="file"
            accept={accept}
            style={{ display: "none" }}
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
          <span style={{ fontSize: 13, color: hasError ? "#ff3b30" : "#547792" }}>
            📁 {hint}
          </span>
        </label>
      )}

      {error && (
        <p style={{ fontSize: 12, color: "#ff3b30", margin: "4px 0 0" }}>{error}</p>
      )}
    </div>
  );
}