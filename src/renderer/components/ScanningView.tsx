import React, { useEffect, useState } from "react";
import { useAppStore } from "../store/appStore";

export default function ScanningView() {
  const { nearbyPeers, bleStatus } = useAppStore();
  const [dots, setDots] = useState("");

  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 500);
    return () => clearInterval(t);
  }, []);

  const label =
    bleStatus === "udp-fallback" ? "Scanning on local network" : "Scanning for nearby devices";

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "var(--bg-base)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 20px",
          height: 58,
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-surface)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "var(--accent-dim)",
            border: "1px solid var(--accent-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: "2px solid var(--accent-light)",
              borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Creating Room</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {label}
            {dots}
          </div>
        </div>
      </div>

      {/* Radar body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        <div style={{ position: "relative", width: 200, height: 200, marginBottom: 32 }}>
          {/* Expanding rings */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "1.5px solid var(--accent)",
                opacity: 0,
                animation: `radarRing 2.4s ease-out ${i * 0.6}s infinite`,
              }}
            />
          ))}

          {/* Grid circles */}
          {["75%", "50%"].map((inset) => (
            <div
              key={inset}
              style={{
                position: "absolute",
                top: `calc(${inset} / 2)`,
                left: `calc(${inset} / 2)`,
                right: `calc(${inset} / 2)`,
                bottom: `calc(${inset} / 2)`,
                borderRadius: "50%",
                border: "1px solid rgba(124,58,237,0.1)",
              }}
            />
          ))}

          {/* Outer border */}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(124,58,237,0.15)" }} />

          {/* Crosshairs */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", width: "100%", height: 1, background: "rgba(124,58,237,0.08)" }} />
            <div style={{ position: "absolute", width: 1, height: "100%", background: "rgba(124,58,237,0.08)" }} />
          </div>

          {/* Sweep */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "conic-gradient(from 0deg, transparent 70%, rgba(124,58,237,0.12) 85%, rgba(124,58,237,0.3) 100%)",
              animation: "radarSweep 2s linear infinite",
            }}
          />

          {/* Center dot */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "var(--accent)",
                boxShadow: "0 0 10px var(--accent), 0 0 20px rgba(124,58,237,0.3)",
                animation: "centerPulse 1.6s ease-in-out infinite",
              }}
            />
          </div>

          {/* Peer blips */}
          {nearbyPeers.slice(0, 4).map((peer, i) => {
            const positions = [{ x: 130, y: 60 }, { x: 60, y: 140 }, { x: 155, y: 130 }, { x: 50, y: 70 }];
            const pos = positions[i];
            return (
              <div
                key={peer.peerId}
                style={{
                  position: "absolute",
                  left: pos.x - 5,
                  top: pos.y - 5,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 8px #22c55e",
                  animation: `blipPulse 1.2s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
            );
          })}
        </div>

        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
          {nearbyPeers.length === 0 ? "Looking for devices nearby" : `${nearbyPeers.length} device${nearbyPeers.length > 1 ? "s" : ""} found`}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Your room will open automatically
        </div>
      </div>

      <style>{`
        @keyframes radarRing {
          0%   { transform: scale(0.1); opacity: 0.6; }
          100% { transform: scale(1);   opacity: 0; }
        }
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes centerPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.6); opacity: 0.6; }
        }
        @keyframes blipPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(2); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
