import React, { useState } from "react";
import { api } from "../ipc/bridge";
import { useAppStore } from "../store/appStore";

export default function NoRoomsFound() {
  const { nearbyPeers } = useAppStore();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    try {
      await api.invoke("room:create");
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
        padding: "0 40px",
        gap: 0,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "var(--bg-elevated)",
          border: "1.5px solid var(--border-strong)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          position: "relative",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
            stroke="var(--text-muted)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 10H15M9 13H12"
            stroke="var(--text-muted)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {/* X badge */}
        <div
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "var(--bg-surface)",
            border: "1.5px solid var(--border-strong)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            color: "var(--text-muted)",
          }}
        >
          ×
        </div>
      </div>

      <div
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        No Active Rooms Found
      </div>

      <div
        style={{
          fontSize: 13,
          color: "var(--text-muted)",
          textAlign: "center",
          lineHeight: 1.7,
          maxWidth: 280,
          marginBottom: 28,
        }}
      >
        {nearbyPeers.length > 0
          ? `${nearbyPeers.length} device${nearbyPeers.length > 1 ? "s" : ""} nearby, but no one has opened a room yet.`
          : "No nearby devices found yet. Make sure others are running ProxiChat."}
      </div>

      {/* Nearby devices found, but no rooms */}
      {nearbyPeers.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {nearbyPeers.slice(0, 4).map((peer) => {
            const initials =
              peer.displayName
                .split(/[\s_\-.]/)
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0].toUpperCase())
                .join("") || "?";
            return (
              <div
                key={peer.peerId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 10px",
                  borderRadius: 8,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "var(--accent-dim)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "var(--accent-light)",
                  }}
                >
                  {initials}
                </div>
                {peer.displayName}
              </div>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleCreate}
        disabled={creating}
        style={{
          padding: "11px 28px",
          borderRadius: 8,
          background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
          color: "#fff",
          fontWeight: 600,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        {creating ? "Creating..." : "Be the first — Create Room"}
      </button>

      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 12 }}>
        Nearby people will be automatically invited
      </div>
    </div>
  );
}
