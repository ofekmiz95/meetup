import React, { useEffect, useRef } from "react";
import { useAppStore } from "../store/appStore";
import type { Message } from "../../shared/types";

function MessageBubble({
  message,
  isSelf,
}: {
  message: Message;
  isSelf: boolean;
}) {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isSelf ? "flex-end" : "flex-start",
        marginBottom: 12,
      }}
    >
      {!isSelf && (
        <span
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            marginBottom: 3,
            paddingLeft: 4,
          }}
        >
          {message.displayName}
        </span>
      )}
      <div
        style={{
          maxWidth: "72%",
          padding: "8px 12px",
          borderRadius: isSelf ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          background: isSelf ? "var(--accent)" : "var(--bg-elevated)",
          color: isSelf ? "#fff" : "var(--text-primary)",
          fontSize: 13,
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}
      >
        {message.text}
      </div>
      <span
        style={{
          fontSize: 10,
          color: "var(--text-muted)",
          marginTop: 3,
          paddingRight: isSelf ? 2 : 0,
          paddingLeft: isSelf ? 0 : 2,
        }}
      >
        {time}
      </span>
    </div>
  );
}

export default function MessageList() {
  const { messages, selfPeerId } = useAppStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: 13,
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 24 }}>💬</div>
        <span>Room is open — say something!</span>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px 16px 4px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isSelf={msg.peerId === selfPeerId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
