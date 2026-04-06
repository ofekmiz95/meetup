import React, { useEffect, useRef, useState } from "react";
import { useAppStore, isSystemMessage } from "../store/appStore";
import { useChat } from "../hooks/useChat";
import type { Message } from "../../shared/types";
import type { SystemMessage } from "../store/appStore";

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials =
    name
      .split(/[\s_\-.]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "?";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--accent-dim)",
        border: "1.5px solid var(--accent-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 700,
        color: "var(--accent-light)",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function SystemNotice({ msg }: { msg: SystemMessage }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        margin: "10px 0",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
          background: "var(--bg-elevated)",
          padding: "4px 14px",
          borderRadius: 99,
          border: "1px solid var(--border)",
        }}
      >
        {msg.text}
      </span>
    </div>
  );
}

function MessageBubble({ msg, isSelf }: { msg: Message; isSelf: boolean }) {
  const time = new Date(msg.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isSelf) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
          animation: "fadeIn 0.2s ease",
        }}
      >
        <div style={{ maxWidth: "62%", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "16px 16px 4px 16px",
              background: "var(--accent)",
              color: "#fff",
              fontSize: 13,
              lineHeight: 1.55,
              wordBreak: "break-word",
            }}
          >
            {msg.text}
          </div>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            {time}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 16,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <Avatar name={msg.displayName} size={34} />
      <div style={{ maxWidth: "62%" }}>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4, fontWeight: 500 }}>
          {msg.displayName}
        </div>
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "4px 16px 16px 16px",
            background: "var(--bg-elevated)",
            color: "var(--text-primary)",
            fontSize: 13,
            lineHeight: 1.55,
            wordBreak: "break-word",
          }}
        >
          {msg.text}
        </div>
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
          {time}
        </span>
      </div>
    </div>
  );
}

export default function ChatArea() {
  const { room, messages, selfPeerId } = useAppStore();
  const { sendMessage } = useChat();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const t = text.trim();
    setText("");
    setSending(true);
    try {
      await sendMessage(t);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  if (!room) return null;

  const memberCount = room.members.length;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-base)" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 20px",
          height: 58,
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-surface)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--accent-dim)",
            border: "1.5px solid var(--accent-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="var(--accent-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>General Room</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {memberCount} {memberCount === 1 ? "person" : "people"} nearby
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)", fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>💬</div>
            Room is open — say something!
          </div>
        )}
        {messages.map((entry) =>
          isSystemMessage(entry) ? (
            <SystemNotice key={entry.id} msg={entry} />
          ) : (
            <MessageBubble
              key={entry.id}
              msg={entry as Message}
              isSelf={(entry as Message).peerId === selfPeerId}
            />
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border)",
          background: "var(--bg-surface)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        {/* Emoji placeholder */}
        <button
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "transparent",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          ☺
        </button>

        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          style={{
            flex: 1,
            background: "var(--bg-input)",
            border: "1px solid var(--border-strong)",
            borderRadius: 22,
            padding: "9px 16px",
            color: "var(--text-primary)",
            fontSize: 13,
            userSelect: "text",
          }}
          autoFocus
        />

        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: text.trim() ? "var(--accent)" : "var(--bg-elevated)",
            color: text.trim() ? "#fff" : "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
