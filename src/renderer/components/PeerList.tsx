import React from "react";
import { useAppStore } from "../store/appStore";
import type { Peer } from "../../shared/types";

function PeerCard({ peer }: { peer: Peer }) {
  const initials = peer.displayName
    .split(/[\s_\-.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const rssiLabel =
    peer.rssi !== undefined
      ? peer.rssi > -60
        ? "Strong"
        : peer.rssi > -80
        ? "Good"
        : "Weak"
      : "Nearby";

  const rssiColor =
    peer.rssi !== undefined
      ? peer.rssi > -60
        ? "#52c27a"
        : peer.rssi > -80
        ? "#f0a952"
        : "#e05252"
      : "#8888a0";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: "var(--radius-sm)",
        background: "var(--bg-elevated)",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "var(--accent-dim)",
          border: "1px solid var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--accent)",
          flexShrink: 0,
        }}
      >
        {initials || "?"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {peer.displayName}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: rssiColor,
            }}
          />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {rssiLabel}
          </span>
          {peer.hasRoom && (
            <span
              style={{
                fontSize: 10,
                color: "var(--accent)",
                background: "var(--accent-dim)",
                padding: "1px 6px",
                borderRadius: 99,
                marginLeft: 4,
              }}
            >
              in room
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PeerList() {
  const { nearbyPeers } = useAppStore();

  if (nearbyPeers.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
          gap: 10,
          color: "var(--text-muted)",
        }}
      >
        <div style={{ fontSize: 28 }}>📡</div>
        <div style={{ fontSize: 13, textAlign: "center", lineHeight: 1.5 }}>
          No one nearby yet
          <br />
          <span style={{ fontSize: 11 }}>
            Others running Meetup will appear here
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {nearbyPeers.map((peer) => (
        <PeerCard key={peer.peerId} peer={peer} />
      ))}
    </div>
  );
}
