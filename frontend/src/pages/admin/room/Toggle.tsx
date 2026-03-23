type ToggleProps = {
    checked: boolean;
    onChange: () => void;
    loading: boolean;
  };
  
  export default function Toggle({ checked, onChange, loading }: ToggleProps) {
    return (
      <button
        onClick={onChange}
        disabled={loading}
        title={checked ? "Accessible — click to disable" : "Not accessible — click to enable"}
        style={{
          width: 42,
          height: 24,
          borderRadius: 12,
          border: "none",
          cursor: loading ? "wait" : "pointer",
          background: checked ? "#34c759" : "#ff3b30",
          position: "relative",
          transition: "background 0.25s",
          padding: 0,
          flexShrink: 0,
          opacity: loading ? 0.6 : 1,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 21 : 3,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "left 0.25s",
          }}
        />
      </button>
    );
  }