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
import IdleView from "./components/IdleView";
import WelcomeView from "./components/WelcomeView";
import ScanningView from "./components/ScanningView";
import RoomClosingView from "./components/RoomClosingView";
import type { AppInitData, RoomInvite } from "../shared/types";
import "./styles/global.css";

type MainView = "welcome" | "idle" | "scanning" | "chat" | "closing";

export default function App() {
  const { room, setSelf, setBleStatus } = useAppStore();
  const [pendingInvite, setPendingInvite] = useState<RoomInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainView, setMainView] = useState<MainView>("welcome");
  const [closingRoom, setClosingRoom] = useState<{ roomId: string; members: any[] } | null>(null);

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

    // Room created/joined → go to chat
    const unsubCreated = api.on("room:created", () => setMainView("chat"));
    const unsubJoined = api.on("room:joined", () => setMainView("chat"));

    // Room closed → show closing view, then idle
    const unsubClosed = api.on("room:closed", (...args) => {
      const { reason } = args[0] as { reason: string };
      const state = useAppStore.getState();
      setClosingRoom({
        roomId: state.room?.roomId ?? "",
        members: state.room?.members ?? [],
      });
      setMainView("closing");
    });

    const unsubError = api.on("app:error", (...args) => {
      const { code, message } = args[0] as { code: string; message: string };
      console.error(`[App Error] ${code}: ${message}`);
    });

    return () => {
      unsubInvite();
      unsubCreated();
      unsubJoined();
      unsubClosed();
      unsubError();
    };
  }, [setSelf, setBleStatus]);

  useEffect(() => {
    if (room) setPendingInvite(null);
  }, [room]);

  // After 5s on welcome with no peers → show idle ("No nearby users found")
  useEffect(() => {
    if (mainView !== "welcome") return;
    const timer = setTimeout(() => {
      setMainView((v) => (v === "welcome" ? "idle" : v));
    }, 5000);
    return () => clearTimeout(timer);
  }, [mainView]);

  // If a peer is discovered while on welcome → move to idle immediately
  const { nearbyPeers } = useAppStore();
  useEffect(() => {
    if (mainView === "welcome" && nearbyPeers.length > 0) {
      setMainView("idle");
    }
  }, [nearbyPeers, mainView]);

  // Expose setMainView so Sidebar's Create Room can trigger scanning
  const handleCreateRoomStart = () => setMainView("scanning");
  const handleClosingDone = () => {
    setClosingRoom(null);
    setMainView("idle");
  };

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

  const showMembersPanel = mainView === "chat" || mainView === "closing";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-base)" }}>
      <TitleBar />
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        <Sidebar onCreateRoomStart={handleCreateRoomStart} />

        {mainView === "welcome" && <WelcomeView />}
        {mainView === "idle" && <IdleView />}
        {mainView === "scanning" && <ScanningView />}
        {mainView === "chat" && room && (
          <>
            <ChatArea />
            <MembersPanel />
          </>
        )}
        {mainView === "closing" && (
          <>
            <RoomClosingView onDone={handleClosingDone} />
            {closingRoom && <ClosingMembersPanel members={closingRoom.members} />}
          </>
        )}

        {pendingInvite && mainView === "idle" && (
          <InviteToast
            invite={pendingInvite}
            onDismiss={() => setPendingInvite(null)}
          />
        )}
      </div>
    </div>
  );
}

// Frozen snapshot of members shown during room closing
function ClosingMembersPanel({ members }: { members: any[] }) {
  const { selfPeerId } = useAppStore();
  const self = members.find((m) => m.peerId === selfPeerId) ?? { displayName: "You", peerId: selfPeerId };

  return (
    <div
      style={{
        width: "var(--members-width)",
        borderLeft: "1px solid var(--border)",
        background: "var(--bg-sidebar)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: "0 16px",
          height: 58,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600 }}>In This Room</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "2px 8px", borderRadius: 99 }}>1</span>
      </div>
      <div style={{ padding: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: "var(--accent-dim)" }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg-elevated)", border: "1.5px solid var(--accent-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--accent-light)" }}>
              {self.displayName[0]?.toUpperCase() ?? "Y"}
            </div>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, borderRadius: "50%", background: "var(--online)", border: "2px solid var(--bg-sidebar)" }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>You</div>
            <div style={{ fontSize: 11, color: "var(--online)" }}>Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}
