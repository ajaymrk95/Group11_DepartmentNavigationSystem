import { X } from "lucide-react";
import { S } from "./constants";

type Props = {
  label: string;
  value: string;
  error: string;
  example: string;
  onChange: (val: string) => void;
};

export default function FileUploadBox({
  label,
  value,
  error,
  example,
  onChange,
}: Props) {
  const hasError = !!error;

  return (
    <div style={S.formGroup}>
      {/* Label */}
      <label style={{ ...S.label, marginBottom: 6 }}>{label}</label>

      {/* Single Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={example} // ✅ FIX: example inside
        spellCheck={false}
        style={{
          width: "100%",
          minHeight: 140,
          padding: "14px 16px",
          fontSize: 13,
          fontFamily: "monospace",
          color: "#1A3263",
          background: "#ffffff",
          border: `1.5px solid ${hasError ? "#ff3b30" : "#dde6f0"}`,
          borderRadius: 12,
          outline: "none",
          resize: "vertical",
          lineHeight: 1.5,
        }}
      />

      {/* Clear */}
      {value && (
        <button
          onClick={() => onChange("")}
          style={{
            marginTop: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9aafbf",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
          }}
        >
          <X size={14} /> Clear
        </button>
      )}

      {/* Error */}
      {error && (
        <p style={{ fontSize: 12, color: "#ff3b30", marginTop: 4 }}>
          {error}
        </p>
      )}
    </div>
  );
}