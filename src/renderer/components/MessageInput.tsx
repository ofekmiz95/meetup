import React, { useState, useRef } from "react";
import { useChat } from "../hooks/useChat";

export default function MessageInput() {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { sendMessage } = useChat();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(text.trim());
      setText("");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 12px",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-surface)",
      }}
    >
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
        placeholder="Message..."
        style={{
          flex: 1,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "8px 14px",
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
          width: 34,
          height: 34,
          borderRadius: "50%",
          background:
            text.trim() ? "var(--accent)" : "var(--bg-elevated)",
          color: text.trim() ? "#fff" : "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          flexShrink: 0,
          transition: "background 0.15s, color 0.15s",
        }}
      >
        ↑
      </button>
    </div>
  );
}
