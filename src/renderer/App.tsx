import React, { useEffect, useState } from "react";
import { api } from "./ipc/bridge";
import { useAppStore } from "./store/appStore";
import { useBle } from "./hooks/useBle";
import { useRoom } from "./hooks/useRoom";
import TitleBar from "./components/TitleBar";
import IdleView from "./views/IdleView";
import RoomView from "./views/RoomView";
import InviteView from "./views/InviteView";
import type { AppInitData, BleStatus, RoomInvite } from "../shared/types";

export default function App() {
  const { room, setSelf, setBleStatus } = useAppStore();
  const [pendingInvite, setPendingInvite] = useState<RoomInvite | null>(null);
  const [loading, setLoading] = useState(true);

  // Register BLE and room event hooks
  useBle();
  useRoom();

  useEffect(() => {
    // Signal to main process that renderer is ready
    api
      .invoke<AppInitData>("app:ready")
      .then((data) => {
        setSelf(data.selfPeerId, data.selfDisplayName);
        setBleStatus(data.bleStatus);
        setLoading(false);
      })
      .catch(console.error);

    // Listen for room invites from peers
    const unsubInvite = api.on("room:invite-received", (...args) => {
      const invite = args[0] as RoomInvite;
      // Don't show invite if already in a room
      if (!useAppStore.getState().room) {
        setPendingInvite(invite);
      }
    });

    const unsubError = api.on("app:error", (...args) => {
      const { code, message } = args[0] as { code: string; message: string };
      console.error(`[App Error] ${code}: ${message}`);
    });

    return () => {
      unsubInvite();
      unsubError();
    };
  }, [setSelf, setBleStatus]);

  // Dismiss invite if we joined a room another way
  useEffect(() => {
    if (room) setPendingInvite(null);
  }, [room]);

  if (loading) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-base)",
        }}
      >
        <TitleBar />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            fontSize: 13,
            gap: 10,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              border: "2px solid var(--accent)",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          Initializing...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-base)",
        position: "relative",
      }}
    >
      <TitleBar />

      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        {room ? <RoomView /> : <IdleView />}
      </div>

      {pendingInvite && !room && (
        <InviteView
          invite={pendingInvite}
          onDecline={() => setPendingInvite(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
