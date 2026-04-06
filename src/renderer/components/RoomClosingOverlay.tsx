import React, { useEffect, useState } from "react";

interface Props {
  reason: "empty" | "host-disconnected" | "user-left" | string;
  onDone: () => void;
}

const MESSAGES: Record<string, { title: string; subtitle: string; icon: string }> = {
  empty: {
    title: "Room Closed",
    subtitle: "Everyone has left the room",
    icon: "🚪",
  },
  "host-disconnected": {
    title: "Host Disconnected",
    subtitle: "The room host has left",
    icon: "🔌",
  },
  "user-left": {
    title: "You Left the Room",
    subtitle: "The conversation has ended",
    icon: "👋",
  },
};

export default function RoomClosingOverlay({ reason, onDone }: Props) {
  const [count, setCount] = useState(3);
  const [phase, setPhase] = useState<"visible" | "fadeout">("visible");

  const msg = MESSAGES[reason] ?? MESSAGES["empty"];

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(timer);
          setPhase("fadeout");
          setTimeout(onDone, 500);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onDone]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        opacity: phase === "fadeout" ? 0 : 1,
        transition: "opacity 0.5s ease",
        animation: "fadeIn 0.25s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          animation: "fadeIn 0.3s ease",
        }}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: 48,
            marginBottom: 16,
            animation: "iconBounce 0.4s ease",
          }}
        >
          {msg.icon}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 8,
          }}
        >
          {msg.title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 14,
            color: "var(--text-muted)",
            marginBottom: 32,
          }}
        >
          {msg.subtitle}
        </div>

        {/* Countdown ring */}
        <div style={{ position: "relative", width: 64, height: 64 }}>
          <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--bg-elevated)" strokeWidth="4" />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - count / 3)}`}
              style={{ transition: "stroke-dashoffset 0.9s linear" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 700,
              color: count === 0 ? "var(--text-muted)" : "var(--text-primary)",
            }}
          >
            {count}
          </div>
        </div>

        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
          Returning to lobby...
        </div>
      </div>

      <style>{`
        @keyframes iconBounce {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
