import React from "react";
import { useAppStore } from "../store/appStore";

export default function MemberList() {
  const { room, selfPeerId } = useAppStore();

  if (!room) return null;

  const members = room.members;

  return (
    <div
      style={{
        width: 180,
        borderLeft: "1px solid var(--border)",
        background: "var(--bg-surface)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          fontSize: 11,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          borderBottom: "1px solid var(--border)",
        }}
      >
        Members ({members.length})
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {members.map((member) => {
          const isSelf = member.peerId === selfPeerId;
          const isHost = member.peerId === room.hostPeerId;
          const initials = member.displayName
            .split(/[\s_\-.]/)
            .filter(Boolean)
            .slice(0, 2)
            .map((w: string) => w[0].toUpperCase())
            .join("");

          return (
            <div
              key={member.peerId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                borderRadius: "var(--radius-sm)",
                background: isSelf ? "var(--accent-dim)" : "transparent",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: isHost ? "var(--accent-dim)" : "var(--bg-elevated)",
                  border: `1px solid ${isHost ? "var(--accent)" : "var(--border)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 600,
                  color: isHost ? "var(--accent)" : "var(--text-secondary)",
                  flexShrink: 0,
                }}
              >
                {initials || "?"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: isSelf
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                  }}
                >
                  {member.displayName}
                  {isSelf ? " (you)" : ""}
                </div>
                {isHost && (
                  <div
                    style={{ fontSize: 10, color: "var(--accent)", marginTop: 1 }}
                  >
                    host
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
