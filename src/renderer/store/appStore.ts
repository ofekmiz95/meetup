import { create } from "zustand";
import type { BleStatus, Message, Peer } from "../../shared/types";

export interface SystemMessage {
  id: string;
  type: "system";
  text: string;
  timestamp: number;
}

export type ChatEntry = Message | SystemMessage;

export function isSystemMessage(entry: ChatEntry): entry is SystemMessage {
  return (entry as SystemMessage).type === "system";
}

interface RoomState {
  roomId: string;
  hostPeerId: string;
  members: Peer[];
  isHost: boolean;
  createdAt: number;
}

interface AppState {
  selfPeerId: string;
  selfDisplayName: string;
  bleStatus: BleStatus;
  nearbyPeers: Peer[];
  room: RoomState | null;
  messages: ChatEntry[];

  setSelf: (peerId: string, displayName: string) => void;
  setBleStatus: (status: BleStatus) => void;
  addNearbyPeer: (peer: Peer) => void;
  removeNearbyPeer: (peerId: string) => void;
  setRoom: (room: RoomState | null) => void;
  updateRoomMembers: (members: Peer[], hostPeerId: string) => void;
  addMessage: (message: Message) => void;
  addSystemMessage: (text: string) => void;
  clearMessages: () => void;
}

let systemMsgCounter = 0;

export const useAppStore = create<AppState>((set) => ({
  selfPeerId: "",
  selfDisplayName: "",
  bleStatus: "initializing",
  nearbyPeers: [],
  room: null,
  messages: [],

  setSelf: (peerId, displayName) =>
    set({ selfPeerId: peerId, selfDisplayName: displayName }),

  setBleStatus: (status) => set({ bleStatus: status }),

  addNearbyPeer: (peer) =>
    set((state) => {
      const idx = state.nearbyPeers.findIndex((p) => p.peerId === peer.peerId);
      if (idx >= 0) {
        const updated = [...state.nearbyPeers];
        updated[idx] = peer;
        return { nearbyPeers: updated };
      }
      return { nearbyPeers: [...state.nearbyPeers, peer] };
    }),

  removeNearbyPeer: (peerId) =>
    set((state) => ({
      nearbyPeers: state.nearbyPeers.filter((p) => p.peerId !== peerId),
    })),

  setRoom: (room) => set({ room }),

  updateRoomMembers: (members, hostPeerId) =>
    set((state) => ({
      room: state.room ? { ...state.room, members, hostPeerId } : null,
    })),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  addSystemMessage: (text) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `sys-${++systemMsgCounter}`,
          type: "system",
          text,
          timestamp: Date.now(),
        } as SystemMessage,
      ],
    })),

  clearMessages: () => set({ messages: [] }),
}));
