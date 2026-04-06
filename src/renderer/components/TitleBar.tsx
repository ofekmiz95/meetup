import React from "react";
import { api } from "../ipc/bridge";
import { useAppStore } from "../store/appStore";

const statusLabel: Record<string, string> = {
  initializing: "Initializing...",
  scanning: "Scanning nearby",
  unavailable: "BLE unavailable",
  "udp-fallback": "LAN discovery",
};

const statusColor: Record<string, string> = {
  initializing: "#8888a0",
  scanning: "#52c27a",
  unavailable: "#e05252",
  "udp-fallback": "#f0a952",
};

export default function TitleBar() {
  const { bleStatus, room, selfDisplayName } = useAppStore();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        height: 40,
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        WebkitAppRegion: "drag" as any,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          WebkitAppRegion: "no-drag" as any,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>
          meetup
        </span>
        {room && (
          <span
            style={{
              fontSize: 11,
              color: "var(--text-secondary)",
              background: "var(--accent-dim)",
              padding: "2px 8px",
              borderRadius: 99,
            }}
          >
            in room
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: statusColor[bleStatus] ?? "#888",
            }}
          />
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
            {statusLabel[bleStatus] ?? bleStatus}
          </span>
        </div>

        <span
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            maxWidth: 120,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selfDisplayName}
        </span>

        {/* Window controls */}
        <div
          style={{
            display: "flex",
            gap: 6,
            WebkitAppRegion: "no-drag" as any,
          }}
        >
          {(
            [
              ["window:minimize", "−"],
              ["window:maximize", "□"],
              ["window:close", "×"],
            ] as const
          ).map(([ch, label]) => (
            <button
              key={ch}
              onClick={() => api.send(ch)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                background: "transparent",
                color: "var(--text-muted)",
                fontSize: ch === "window:close" ? 14 : 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  ch === "window:close"
                    ? "var(--danger)"
                    : "var(--bg-elevated)";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--text-muted)";
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
