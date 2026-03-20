import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

function Scanner() {
  const startedRef = useRef(false);
  const stoppedRef = useRef(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const resetScan = () => {
    setError(null);
    stoppedRef.current = false;
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: "environment" },
      {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.8;
          return { width: size, height: size };
        },
      },
      (decodedText: string) => {
        if (stoppedRef.current) return;

        let searchValue: string | null = null;

        try {
          const parsed = JSON.parse(decodedText);
          if (parsed.name) {
            searchValue = parsed.name;
          }
        } catch {
          // QR was not JSON — invalid
        }

        if (!searchValue) {
          // Show error, keep camera running so user can retry
          setError("This QR code isn't a valid location. Please scan a location QR code.");
          return;
        }

        stoppedRef.current = true;

        scanner.stop().then(() => {
          navigate("/outdoor-navigation", { state: { qrData: searchValue } });
        });
      },
      () => {}
    );

    return () => {
      if (!stoppedRef.current) {
        stoppedRef.current = true;
        scanner.stop().catch(() => {});
      }
    };
  }, [navigate]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0d1a35",
        fontFamily: "'Segoe UI', sans-serif",
        gap: "20px",
      }}
    >
      {/* Viewfinder */}
      <div
        id="reader"
        style={{
          width: "min(75vw, 700px)",
          height: "min(calc(min(85vh, 1000px) * 9 / 16), 90vh)",
          overflow: "hidden",
          borderRadius: "16px",
          border: "2px solid #547792",
          boxShadow: "0 0 0 4px rgba(84,119,146,0.15), 0 8px 32px rgba(0,0,0,0.5)",
        }}
      />

      {/* Error toast */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            backgroundColor: "#1A3263",
            border: "1px solid #547792",
            borderLeft: "4px solid #FAB95B",
            borderRadius: "12px",
            padding: "14px 20px",
            maxWidth: "min(75vw, 500px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            animation: "slideUp 0.3s ease",
          }}
        >
          {/* Icon */}
          <div
            style={{
              flexShrink: 0,
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "rgba(250,185,91,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="#FAB95B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Text */}
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                color: "#E8E2DB",
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "1.5",
              }}
            >
              {error}
            </p>
          </div>

          {/* Dismiss */}
          <button
            onClick={resetScan}
            style={{
              flexShrink: 0,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#547792",
              padding: "4px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Scanner;