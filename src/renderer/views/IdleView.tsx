import React, { useState } from "react";
import { api } from "../ipc/bridge";
import { useAppStore } from "../store/appStore";
import PeerList from "../components/PeerList";

export default function IdleView() {
  const { nearbyPeers, bleStatus } = useAppStore();
  const [creating, setCreating] = useState(false);

  const handleCreateRoom = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const result = await api.invoke<{ roomId: string; wsPort: number }>(
        "room:create"
      );
      // Room state handled by useRoom hook via IPC events
    } catch (err) {
      console.error("Failed to create room:", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "0 0",
        gap: 0,
      }}
    >
      {/* Hero area */}
      <div
        style={{
          padding: "32px 24px 24px",
          borderBottom: "1px solid var(--border)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>📡</div>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 6,
          }}
        >
          Proximity Chat
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            maxWidth: 320,
            margin: "0 auto 20px",
          }}
        >
          Instantly connect with nearby people.
          <br />
          No accounts. No history. Just talk.
        </p>

        <button
          onClick={handleCreateRoom}
          disabled={creating || bleStatus === "initializing"}
          style={{
            padding: "10px 28px",
            borderRadius: 99,
            background: creating ? "var(--bg-elevated)" : "var(--accent)",
            color: creating ? "var(--text-muted)" : "#fff",
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: "0.02em",
          }}
          onMouseEnter={(e) => {
            if (!creating)
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--accent-hover)";
          }}
          onMouseLeave={(e) => {
            if (!creating)
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--accent)";
          }}
        >
          {creating ? "Creating..." : "Create Room"}
        </button>
      </div>

      {/* Nearby peers */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px" }}>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 10,
          }}
        >
          Nearby ({nearbyPeers.length})
        </div>
        <PeerList />
      </div>
    </div>
  );
}
