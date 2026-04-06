export interface Peer {
  peerId: string;
  displayName: string;
  ip: string;
  wsPort: number;
  rssi?: number;
  isHost: boolean;
  hasRoom?: boolean;
}

export interface Message {
  id: string;
  peerId: string;
  displayName: string;
  text: string;
  timestamp: number;
}

export interface Room {
  roomId: string;
  hostPeerId: string;
  members: Map<string, Peer>;
  messages: Message[];
  wsPort: number;
  createdAt: number;
}

export interface AppInitData {
  selfPeerId: string;
  selfDisplayName: string;
  bleStatus: BleStatus;
}

export type BleStatus =
  | "initializing"
  | "scanning"
  | "unavailable"
  | "udp-fallback";

export type WsMessageType =
  | "join"
  | "leave"
  | "message"
  | "member-joined"
  | "member-left"
  | "room-state"
  | "host-migrating"
  | "ping"
  | "pong";

export interface WsMessage {
  type: WsMessageType;
  roomId?: string;
  peerId?: string;
  displayName?: string;
  text?: string;
  timestamp?: number;
  messageId?: string;
  members?: Peer[];
  hostPeerId?: string;
  nextHostPeerId?: string;
}

export interface RoomInvite {
  roomId: string;
  hostPeerId: string;
  hostIp: string;
  hostPort: number;
  hostDisplayName: string;
}

export interface AppError {
  code: AppErrorCode;
  message: string;
}

export type AppErrorCode =
  | "BLE_INIT_FAILED"
  | "WS_CONNECT_FAILED"
  | "WS_SERVER_FAILED"
  | "PEER_TIMEOUT";
