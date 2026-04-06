import React, { useState } from "react";
import { api } from "../ipc/bridge";
import { useAppStore } from "../store/appStore";
import type { RoomInvite } from "../../shared/types";

interface Props {
  invite: RoomInvite;
  onDecline: () => void;
}

export default function InviteView({ invite, onDecline }: Props) {
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
      console.error("Failed to join room:", err);
      setJoining(false);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        right: 16,
        background: "var(--bg-elevated)",
        border: "1px solid var(--accent)",
        borderRadius: "var(--radius)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        zIndex: 100,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
          Room invite
        </div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          <strong>{invite.hostDisplayName}</strong> opened a nearby room
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleJoin}
          disabled={joining}
          style={{
            flex: 1,
            padding: "8px 0",
            borderRadius: "var(--radius-sm)",
            background: "var(--accent)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {joining ? "Joining..." : "Join Room"}
        </button>
        <button
          onClick={onDecline}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-sm)",
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
