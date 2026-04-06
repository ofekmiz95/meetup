import React, { useEffect, useState } from "react";
import { useAppStore } from "../store/appStore";

export default function ScanningView() {
  const { bleStatus, nearbyPeers } = useAppStore();
  const [dots, setDots] = useState("");

  useEffect(() => {
    const t = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(t);
  }, []);

  const label =
    bleStatus === "initializing"
      ? "Initializing Bluetooth"
      : bleStatus === "udp-fallback"
      ? "Scanning on local network"
      : "Scanning for nearby devices";

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
        gap: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Radar rings */}
      <div style={{ position: "relative", width: 220, height: 220, marginBottom: 36 }}>
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

        {/* Sweep */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, transparent 75%, rgba(124,58,237,0.18) 85%, rgba(124,58,237,0.35) 100%)",
            animation: "radarSweep 2s linear infinite",
          }}
        />

        {/* Grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1px solid rgba(124,58,237,0.12)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "25%",
            borderRadius: "50%",
            border: "1px solid rgba(124,58,237,0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "50%",
            borderRadius: "50%",
            border: "1px solid rgba(124,58,237,0.1)",
            transform: "translate(-50%,-50%)",
            width: "50%",
            height: "50%",
          }}
        />

        {/* Cross hairs */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: "100%", height: 1, background: "rgba(124,58,237,0.1)" }} />
          <div style={{ position: "absolute", width: 1, height: "100%", background: "rgba(124,58,237,0.1)" }} />
        </div>

        {/* Center dot */}
        <div
          style={{
            position: "absolute",
            inset: 0,
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
              background: "var(--accent)",
              boxShadow: "0 0 12px var(--accent), 0 0 24px rgba(124,58,237,0.4)",
              animation: "centerPulse 1.6s ease-in-out infinite",
            }}
          />
        </div>

        {/* Blips for nearby peers */}
        {nearbyPeers.slice(0, 4).map((peer, i) => {
          const angles = [42, 110, 200, 310];
          const radii = [60, 45, 70, 52];
          const angle = (angles[i] * Math.PI) / 180;
          const r = radii[i];
          const x = 110 + r * Math.cos(angle);
          const y = 110 + r * Math.sin(angle);
          return (
            <div
              key={peer.peerId}
              style={{
                position: "absolute",
                left: x - 4,
                top: y - 4,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 6px #22c55e",
                animation: `blipPulse 1.2s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          );
        })}
      </div>

      {/* Text */}
      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
        {label}
        <span style={{ display: "inline-block", width: 20, textAlign: "left" }}>{dots}</span>
      </div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>
        {nearbyPeers.length === 0
          ? "Looking for people nearby"
          : `${nearbyPeers.length} device${nearbyPeers.length > 1 ? "s" : ""} detected`}
      </div>

      {/* Status chips */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { icon: "📡", label: bleStatus === "udp-fallback" ? "LAN" : "BLE", active: true },
          { icon: "🔒", label: "No login needed", active: true },
          { icon: "⚡", label: "Instant", active: true },
        ].map(({ icon, label: chipLabel, active }) => (
          <div
            key={chipLabel}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 12px",
              borderRadius: 99,
              background: active ? "var(--accent-dim)" : "var(--bg-elevated)",
              border: `1px solid ${active ? "var(--accent-border)" : "var(--border)"}`,
              fontSize: 11,
              color: active ? "var(--accent-light)" : "var(--text-muted)",
            }}
          >
            <span style={{ fontSize: 12 }}>{icon}</span>
            {chipLabel}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes radarRing {
          0%   { transform: scale(0.1); opacity: 0.7; }
          100% { transform: scale(1);   opacity: 0; }
        }
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes centerPulse {
          0%, 100% { transform: scale(1);   opacity: 1; }
          50%       { transform: scale(1.5); opacity: 0.6; }
        }
        @keyframes blipPulse {
          0%, 100% { transform: scale(1);   opacity: 1; }
          50%       { transform: scale(1.8); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
