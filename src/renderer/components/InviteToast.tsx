import React, { useState } from "react";
import { api } from "../ipc/bridge";
import type { RoomInvite } from "../../shared/types";

export default function InviteToast({ invite, onDismiss }: { invite: RoomInvite; onDismiss: () => void }) {
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (joining) return;
    setJoining(true);
    try {
      await api.invoke("room:join", {
        roomId: invite.roomId,
        hostPeerId: invite.hostPeerId,
        hostIp: invite.hostIp,
        hostPort: invite.hostPort,
        hostDisplayName: invite.hostDisplayName,
      });
    } catch (err) {
      console.error("Join failed:", err);
      setJoining(false);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 280,
        background: "var(--bg-elevated)",
        border: "1px solid var(--accent-border)",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        animation: "fadeIn 0.2s ease",
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>Room invite</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            <strong style={{ color: "var(--text-secondary)" }}>{invite.hostDisplayName}</strong> opened a nearby room
          </div>
        </div>
        <button
          onClick={onDismiss}
          style={{ background: "transparent", color: "var(--text-muted)", fontSize: 16, padding: 2 }}
        >
          ×
        </button>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleJoin}
          disabled={joining}
          style={{
            flex: 1,
            padding: "8px 0",
            borderRadius: 7,
            background: "var(--accent)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {joining ? "Joining..." : "Join Room"}
        </button>
        <button
          onClick={onDismiss}
          style={{
            padding: "8px 14px",
            borderRadius: 7,
            background: "var(--bg-surface)",
            color: "var(--text-secondary)",
            fontSize: 13,
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
