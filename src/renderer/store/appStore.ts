import { create } from "zustand";
import type { BleStatus, Message, Peer } from "../../shared/types";

interface RoomState {
  roomId: string;
  hostPeerId: string;
  members: Peer[];
  isHost: boolean;
}

interface AppState {
  // Self
  selfPeerId: string;
  selfDisplayName: string;
  bleStatus: BleStatus;

  // Discovery
  nearbyPeers: Peer[];

  // Room
  room: RoomState | null;

  // Chat
  messages: Message[];

  // Actions
  setSelf: (peerId: string, displayName: string) => void;
  setBleStatus: (status: BleStatus) => void;
  addNearbyPeer: (peer: Peer) => void;
  removeNearbyPeer: (peerId: string) => void;
  setRoom: (room: RoomState | null) => void;
  updateRoomMembers: (members: Peer[], hostPeerId: string) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

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
      const existing = state.nearbyPeers.findIndex(
        (p) => p.peerId === peer.peerId
      );
      if (existing >= 0) {
        const updated = [...state.nearbyPeers];
        updated[existing] = peer;
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
      room: state.room
        ? { ...state.room, members, hostPeerId }
        : null,
    })),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  clearMessages: () => set({ messages: [] }),
}));
