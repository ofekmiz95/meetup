import React, { useEffect, useState } from "react";

export default function WelcomeView() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 500);
    return () => clearInterval(t);
  }, []);

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
              animation: "spin 0.9s linear infinite",
            }}
          />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Welcome to ProxiChat</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Looking for nearby devices{dots}
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          animation: "fadeIn 0.4s ease",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            boxShadow: "0 0 40px rgba(124,58,237,0.25)",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="2.5" fill="white" />
            <path d="M8.5 12C8.5 9.51 10.51 7.5 13 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
            <path d="M15.5 12C15.5 9.51 13.49 7.5 11 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
            <path d="M5 12C5 7.03 9.03 3 14 3" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <path d="M19 12C19 7.03 14.97 3 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          </svg>
        </div>

        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
          Welcome to ProxiChat
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            textAlign: "center",
            lineHeight: 1.8,
            maxWidth: 300,
            marginBottom: 36,
          }}
        >
          Instant, ephemeral chat with people nearby.
          <br />
          No accounts. No history. Just talk.
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { icon: "📡", label: "Proximity-based" },
            { icon: "🔒", label: "No login needed" },
            { icon: "⚡", label: "Instant connect" },
            { icon: "🗑️", label: "Ephemeral" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 12px",
                borderRadius: 99,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              <span style={{ fontSize: 13 }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
