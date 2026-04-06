import React, { useEffect, useState } from "react";

interface Props {
  onDone: () => void;
}

export default function RoomClosingView({ onDone }: Props) {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowToast(true), 400);
    const t2 = setTimeout(onDone, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "var(--bg-base)",
        position: "relative",
      }}
    >
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
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "rgba(220,38,38,0.12)",
            border: "1px solid rgba(220,38,38,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
              stroke="var(--danger)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="9" cy="7" r="4" stroke="var(--danger)" strokeWidth="2" />
            <line x1="18" y1="8" x2="23" y2="13" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" />
            <line x1="23" y1="8" x2="18" y2="13" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--danger)" }}>
            Room Closing
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            All users have left
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          animation: "fadeIn 0.3s ease",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-strong)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="9" cy="7" r="4" stroke="var(--text-muted)" strokeWidth="1.5" />
            <path
              d="M23 11l-4 4M19 11l4 4"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
          Room is closing
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.7 }}>
          All users have left the room.{" "}
          <span style={{ color: "var(--accent-light)" }}>The chat will be deleted.</span>
        </div>
      </div>

      {/* Room Ended toast — bottom right */}
      {showToast && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            background: "rgba(60,10,10,0.95)",
            border: "1px solid rgba(220,38,38,0.35)",
            borderRadius: 10,
            padding: "12px 16px",
            width: 220,
            animation: "fadeIn 0.25s ease",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--danger)", marginBottom: 4 }}>
            Room Ended
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
            This room has been closed and all messages will be deleted.
          </div>
        </div>
      )}
    </div>
  );
}
