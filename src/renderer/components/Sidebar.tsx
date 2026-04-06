import React, { useState } from "react";
import { api } from "../ipc/bridge";
import { useAppStore } from "../store/appStore";
import type { Peer } from "../../shared/types";

function rssiToDistance(rssi?: number): string {
  if (rssi === undefined) return "nearby";
  if (rssi > -50) return "1m away";
  if (rssi > -60) return "2m away";
  if (rssi > -70) return "5m away";
  if (rssi > -80) return "8m away";
  return "10m+ away";
}

function DeviceCard({ peer }: { peer: Peer }) {
  const initials =
    peer.displayName
      .split(/[\s_\-.]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "?";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 8,
        background: "var(--bg-elevated)",
        marginBottom: 6,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "var(--accent-dim)",
          border: "1.5px solid var(--accent-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          color: "var(--accent-light)",
          flexShrink: 0,
          position: "relative",
        }}
      >
        {initials}
        <div
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "var(--online)",
            border: "2px solid var(--bg-elevated)",
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "var(--text-primary)",
          }}
        >
          {peer.displayName}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 22V2M12 2L7 7M12 2L17 7"
              stroke="var(--text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {rssiToDistance(peer.rssi)}
          </span>
          {peer.hasRoom && (
            <span
              style={{
                fontSize: 10,
                color: "var(--accent-light)",
                background: "var(--accent-dim)",
                padding: "1px 6px",
                borderRadius: 99,
                marginLeft: 2,
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

interface SidebarProps {
  onCreateRoomStart?: () => void;
}

export default function Sidebar({ onCreateRoomStart }: SidebarProps) {
  const { nearbyPeers, bleStatus, room } = useAppStore();
  const [creating, setCreating] = useState(false);

  const handleCreateRoom = async () => {
    if (creating || room) return;
    setCreating(true);
    onCreateRoomStart?.();
    try {
      await api.invoke("room:create");
    } catch (err) {
      console.error("Failed to create room:", err);
      setCreating(false);
    }
  };

  const btnBg = room
    ? "var(--bg-elevated)"
    : "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)";

  return (
    <div
      style={{
        width: "var(--sidebar-width)",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Branding */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="2.5" fill="white" />
              <path d="M8.5 12C8.5 9.51 10.51 7.5 13 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <path d="M15.5 12C15.5 9.51 13.49 7.5 11 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <path d="M5.5 12C5.5 7.25 9.36 3.5 14 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
              <path d="M18.5 12C18.5 7.25 14.64 3.5 10 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
              ProxiChat
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {bleStatus === "scanning"
                ? "Nearby connection"
                : bleStatus === "udp-fallback"
                ? "LAN discovery"
                : bleStatus === "initializing"
                ? "Initializing..."
                : "BLE unavailable"}
            </div>
          </div>
        </div>
      </div>

      {/* Create Room Button */}
      <div style={{ padding: "14px 14px 8px" }}>
        <button
          onClick={handleCreateRoom}
          disabled={creating || !!room}
          style={{
            width: "100%",
            padding: "11px 0",
            borderRadius: 8,
            background: btnBg,
            color: room ? "var(--text-muted)" : "#fff",
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {!room && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          )}
          {creating ? "Creating..." : room ? "In a Room" : "Create Room"}
        </button>
      </div>

      {/* Nearby Devices header */}
      <div
        style={{
          padding: "8px 16px 6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Nearby Devices
        </span>
        <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "1px 7px", borderRadius: 99 }}>
          {nearbyPeers.length}
        </span>
      </div>

      {/* Device list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "2px 10px 10px" }}>
        {nearbyPeers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 12px", color: "var(--text-muted)", fontSize: 12, lineHeight: 1.7 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📡</div>
            No devices nearby
            <br />
            <span style={{ fontSize: 11 }}>Others running ProxiChat will appear here</span>
          </div>
        ) : (
          nearbyPeers.map((peer) => <DeviceCard key={peer.peerId} peer={peer} />)
        )}
      </div>
    </div>
  );
}
