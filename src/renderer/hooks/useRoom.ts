import { useEffect } from "react";
import { api } from "../ipc/bridge";
import { useAppStore } from "../store/appStore";
import type { Peer } from "../../shared/types";

export function useRoom() {
  const { setRoom, updateRoomMembers, clearMessages, selfPeerId } =
    useAppStore();

  useEffect(() => {
    const unsubCreated = api.on("room:created", (...args) => {
      const { roomId, wsPort } = args[0] as { roomId: string; wsPort: number };
      setRoom({
        roomId,
        hostPeerId: selfPeerId,
        members: [],
        isHost: true,
      });
    });

    const unsubJoined = api.on("room:joined", (...args) => {
      const { roomId, hostPeerId } = args[0] as {
        roomId: string;
        hostPeerId: string;
      };
      setRoom({
        roomId,
        hostPeerId,
        members: [],
        isHost: false,
      });
    });

    const unsubStateUpdated = api.on("room:state-updated", (...args) => {
      const { members, hostPeerId } = args[0] as {
        roomId: string;
        members: Peer[];
        hostPeerId: string;
      };
      updateRoomMembers(members, hostPeerId);
    });

    const unsubClosed = api.on("room:closed", () => {
      setRoom(null);
      clearMessages();
    });

    const unsubHostChanged = api.on("room:host-changed", (...args) => {
      const { newHostPeerId } = args[0] as { newHostPeerId: string };
      const { room } = useAppStore.getState();
      if (room) {
        setRoom({ ...room, hostPeerId: newHostPeerId });
      }
    });

    return () => {
      unsubCreated();
      unsubJoined();
      unsubStateUpdated();
      unsubClosed();
      unsubHostChanged();
    };
  }, [selfPeerId, setRoom, updateRoomMembers, clearMessages]);
}
