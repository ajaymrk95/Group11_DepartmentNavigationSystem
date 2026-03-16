import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

function Scanner() {
  const startedRef = useRef(false);
  const stoppedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const scanner = new Html5Qrcode("reader");

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
      
        stoppedRef.current = true;
      
        let searchValue = decodedText;
      
        try {
          const parsed = JSON.parse(decodedText);
      
          if (parsed.name) {
            searchValue = parsed.name;
          }
      
        } catch {
          // QR was not JSON → use raw text
        }
      
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
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
      }}
    >
      <div
        id="reader"
        style={{
          width: "min(75vw, 700px)",
          height: "min(calc(min(85vh, 1000px) * 9 / 16), 90vh)",
          overflow: "hidden",
          borderRadius: "12px",
          border: "2px solid #fff",
        }}
      />
    </div>
  );
}

export default Scanner;