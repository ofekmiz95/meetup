import React from "react";
import { api } from "../ipc/bridge";
import { useAppStore } from "../store/appStore";

export default function MembersPanel() {
  const { room, selfPeerId } = useAppStore();
  if (!room) return null;

  const handleLeave = () => api.invoke("room:leave");

  const createdTime = new Date(room.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const durationMs = Date.now() - room.createdAt;
  const durationMin = Math.max(1, Math.floor(durationMs / 60000));

  return (
    <div
      style={{
        width: "var(--members-width)",
        borderLeft: "1px solid var(--border)",
        background: "var(--bg-sidebar)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "0 16px",
          height: 58,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
          In This Room
        </span>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            background: "var(--bg-elevated)",
            padding: "2px 8px",
            borderRadius: 99,
          }}
        >
          {room.members.length}
        </span>
      </div>

      {/* Member list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px 0" }}>
        {room.members.map((member) => {
          const isSelf = member.peerId === selfPeerId;
          const initials =
            member.displayName
              .split(/[\s_\-.]/)
              .filter(Boolean)
              .slice(0, 2)
              .map((w: string) => w[0].toUpperCase())
              .join("") || "?";

          return (
            <div
              key={member.peerId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 8,
                marginBottom: 4,
                background: isSelf ? "var(--accent-dim)" : "transparent",
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "var(--bg-elevated)",
                    border: `1.5px solid ${isSelf ? "var(--accent-border)" : "var(--border-strong)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: isSelf ? "var(--accent-light)" : "var(--text-secondary)",
                  }}
                >
                  {initials}
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: "var(--online)",
                    border: "2px solid var(--bg-sidebar)",
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "var(--text-primary)",
                  }}
                >
                  {isSelf ? "You" : member.displayName}
                </div>
                <div style={{ fontSize: 11, color: "var(--online)", marginTop: 1 }}>
                  Active
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Info */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: "14px 16px",
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>
          Room Info
        </div>
        {[
          ["Created", createdTime],
          ["Duration", `${durationMin} minute${durationMin !== 1 ? "s" : ""}`],
          ["Range", "LAN / BLE"],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{value}</span>
          </div>
        ))}

        <button
          onClick={handleLeave}
          style={{
            width: "100%",
            marginTop: 12,
            padding: "9px 0",
            borderRadius: 8,
            background: "var(--danger-dim)",
            color: "var(--danger)",
            fontWeight: 600,
            fontSize: 13,
            border: "1px solid rgba(220,38,38,0.25)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,0.25)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--danger-dim)";
          }}
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}
