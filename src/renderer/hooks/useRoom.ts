import { useEffect } from "react";
import { api } from "../ipc/bridge";
import { useAppStore } from "../store/appStore";
import type { Peer } from "../../shared/types";

export function useRoom() {
  const { setRoom, updateRoomMembers, clearMessages, selfPeerId, addSystemMessage } =
    useAppStore();

  useEffect(() => {
    const unsubCreated = api.on("room:created", (...args) => {
      const { roomId } = args[0] as { roomId: string; wsPort: number };
      const { selfDisplayName } = useAppStore.getState();
      setRoom({ roomId, hostPeerId: selfPeerId, members: [], isHost: true, createdAt: Date.now() });
      addSystemMessage(`${selfDisplayName} created the room`);
    });

    const unsubJoined = api.on("room:joined", (...args) => {
      const { roomId, hostPeerId } = args[0] as { roomId: string; hostPeerId: string };
      const { selfDisplayName } = useAppStore.getState();
      setRoom({ roomId, hostPeerId, members: [], isHost: false, createdAt: Date.now() });
      addSystemMessage(`${selfDisplayName} joined the room`);
    });

    const unsubStateUpdated = api.on("room:state-updated", (...args) => {
      const { members, hostPeerId, joinedPeer, leftPeer } = args[0] as {
        roomId: string;
        members: Peer[];
        hostPeerId: string;
        joinedPeer?: string;
        leftPeer?: string;
      };
      updateRoomMembers(members, hostPeerId);
      if (joinedPeer) addSystemMessage(`${joinedPeer} joined the room`);
      if (leftPeer) addSystemMessage(`${leftPeer} left the room`);
    });

    const unsubClosed = api.on("room:closed", (...args) => {
      const { reason } = args[0] as { reason: string };
      addSystemMessage(
        reason === "empty" ? "Room closed — everyone left" : "Room closed"
      );
      setRoom(null);
      clearMessages();
    });

    const unsubHostChanged = api.on("room:host-changed", (...args) => {
      const { newHostPeerId } = args[0] as { newHostPeerId: string };
      const { room } = useAppStore.getState();
      if (room) setRoom({ ...room, hostPeerId: newHostPeerId });
      addSystemMessage("Host changed");
    });

    return () => {
      unsubCreated();
      unsubJoined();
      unsubStateUpdated();
      unsubClosed();
      unsubHostChanged();
    };
  }, [selfPeerId, setRoom, updateRoomMembers, clearMessages, addSystemMessage]);
}
