import React, { useEffect, useState } from "react";
import { api } from "./ipc/bridge";
import { useAppStore } from "./store/appStore";
import { useBle } from "./hooks/useBle";
import { useRoom } from "./hooks/useRoom";
import { useChat } from "./hooks/useChat";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import MembersPanel from "./components/MembersPanel";
import InviteToast from "./components/InviteToast";
import TitleBar from "./components/TitleBar";
import ScanningView from "./components/ScanningView";
import NoRoomsFound from "./components/NoRoomsFound";
import RoomClosingOverlay from "./components/RoomClosingOverlay";
import type { AppInitData, RoomInvite } from "../shared/types";
import "./styles/global.css";

export default function App() {
  const { room, setSelf, setBleStatus, bleStatus, nearbyPeers } = useAppStore();
  const [pendingInvite, setPendingInvite] = useState<RoomInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [closingReason, setClosingReason] = useState<string | null>(null);

  useBle();
  useRoom();
  useChat();

  useEffect(() => {
    api.invoke<AppInitData>("app:ready").then((data) => {
      setSelf(data.selfPeerId, data.selfDisplayName);
      setBleStatus(data.bleStatus);
      setLoading(false);
    });

    const unsubInvite = api.on("room:invite-received", (...args) => {
      if (!useAppStore.getState().room) {
        setPendingInvite(args[0] as RoomInvite);
      }
    });

    // Intercept room:closed to show the closing overlay
    const unsubClosed = api.on("room:closed", (...args) => {
      const { reason } = args[0] as { reason: string };
      setClosingReason(reason);
    });

    const unsubError = api.on("app:error", (...args) => {
      const { code, message } = args[0] as { code: string; message: string };
      console.error(`[App Error] ${code}: ${message}`);
    });

    return () => {
      unsubInvite();
      unsubClosed();
      unsubError();
    };
  }, [setSelf, setBleStatus]);

  useEffect(() => {
    if (room) {
      setPendingInvite(null);
      setClosingReason(null);
    }
  }, [room]);

  // Determine which main view to show
  const isScanning = !room && (bleStatus === "initializing" || nearbyPeers.length === 0);
  const hasRooms = nearbyPeers.some((p) => p.hasRoom);
  const showNoRooms = !room && !isScanning && nearbyPeers.length > 0 && !hasRooms;

  if (loading) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-base)" }}>
        <TitleBar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-muted)" }}>
          <div style={{ width: 18, height: 18, border: "2px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: 13 }}>Starting ProxiChat...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-base)" }}>
      <TitleBar />

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        <Sidebar />

        {/* Main content area */}
        {room ? (
          <>
            <ChatArea />
            <MembersPanel />
          </>
        ) : isScanning ? (
          <ScanningView />
        ) : showNoRooms ? (
          <NoRoomsFound />
        ) : (
          <EmptyState />
        )}

        {/* Invite toast */}
        {pendingInvite && !room && (
          <InviteToast invite={pendingInvite} onDismiss={() => setPendingInvite(null)} />
        )}

        {/* Room closing overlay — shown over the chat area */}
        {closingReason && room && (
          <RoomClosingOverlay
            reason={closingReason}
            onDone={() => setClosingReason(null)}
          />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-muted)", background: "var(--bg-base)" }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "var(--accent-dim)",
          border: "1.5px solid var(--accent-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="var(--accent-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-secondary)" }}>No active room</div>
      <div style={{ fontSize: 13, textAlign: "center", maxWidth: 240, lineHeight: 1.6 }}>
        Click <strong style={{ color: "var(--accent-light)" }}>Create Room</strong> to start a proximity chat with nearby people
      </div>
    </div>
  );
}
