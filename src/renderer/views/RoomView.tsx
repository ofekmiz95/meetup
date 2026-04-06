import React from "react";
import { api } from "../ipc/bridge";
import { useAppStore } from "../store/appStore";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import MemberList from "../components/MemberList";
import { useChat } from "../hooks/useChat";

export default function RoomView() {
  const { room, selfPeerId } = useAppStore();

  // Register chat listeners
  useChat();

  if (!room) return null;

  const handleLeave = async () => {
    await api.invoke("room:leave");
  };

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Main chat area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Room header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-surface)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#52c27a",
                boxShadow: "0 0 6px #52c27a80",
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              Room{" "}
              <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                #{room.roomId.slice(0, 8)}
              </span>
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {room.members.length} member{room.members.length !== 1 ? "s" : ""}
            </span>
            {room.isHost && (
              <span
                style={{
                  fontSize: 10,
                  color: "var(--accent)",
                  background: "var(--accent-dim)",
                  padding: "2px 7px",
                  borderRadius: 99,
                }}
              >
                host
              </span>
            )}
          </div>
          <button
            onClick={handleLeave}
            style={{
              padding: "5px 14px",
              borderRadius: 6,
              background: "transparent",
              color: "var(--danger)",
              fontSize: 12,
              border: "1px solid var(--danger)",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(224, 82, 82, 0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            Leave
          </button>
        </div>

        {/* Messages */}
        <MessageList />

        {/* Input */}
        <MessageInput />
      </div>

      {/* Members sidebar */}
      <MemberList />
    </div>
  );
}
