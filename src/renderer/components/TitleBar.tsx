import React from "react";
import { api } from "../ipc/bridge";

export default function TitleBar() {
  return (
    <div
      style={{
        height: 32,
        background: "var(--bg-sidebar)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 8px",
        WebkitAppRegion: "drag" as any,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", gap: 4, WebkitAppRegion: "no-drag" as any }}>
        {(
          [
            ["window:minimize", "−", false],
            ["window:maximize", "□", false],
            ["window:close", "×", true],
          ] as const
        ).map(([ch, label, isDanger]) => (
          <button
            key={ch}
            onClick={() => api.send(ch)}
            style={{
              width: 24,
              height: 24,
              borderRadius: 5,
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: ch === "window:close" ? 15 : 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = isDanger
                ? "var(--danger)"
                : "var(--bg-elevated)";
              (e.currentTarget as HTMLButtonElement).style.color = isDanger
                ? "#fff"
                : "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
