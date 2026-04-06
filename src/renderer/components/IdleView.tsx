import React from "react";

export default function IdleView() {
  const handleScan = () => {
    (window as any).electronAPI?.invoke("ble:start-scan");
  };

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
      {/* Center panel header */}
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
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-strong)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M6.5 6.5L17.5 17.5M17.5 6.5L12 12L17.5 17.5M6.5 6.5L12 12"
              stroke="var(--text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 12H5.01"
              stroke="var(--text-muted)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>
            No Connection
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Waiting for nearby devices
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
        }}
      >
        {/* Bluetooth icon circle */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-strong)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M6.5 6.5L17.5 17.5M17.5 6.5L12 12L17.5 17.5M6.5 6.5L12 12"
              stroke="var(--text-muted)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 12H5.01"
              stroke="var(--text-muted)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 8,
          }}
        >
          No nearby users found
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            textAlign: "center",
            lineHeight: 1.7,
            maxWidth: 320,
            marginBottom: 24,
          }}
        >
          Make sure Bluetooth is enabled and others are nearby with the app open.
        </div>

        <button
          onClick={handleScan}
          style={{
            padding: "8px 22px",
            borderRadius: 8,
            border: "1px solid var(--border-strong)",
            background: "transparent",
            color: "var(--text-secondary)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: 0.2,
          }}
        >
          Scan for Rooms
        </button>
      </div>
    </div>
  );
}
