import { EventEmitter } from "events";
import { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";

const RELAY_URL = process.env.RELAY_URL ?? "ws://localhost:3001";

interface RelayMessage {
  type: string;
  roomId?: string;
  peerId?: string;
  displayName?: string;
  text?: string;
  timestamp?: number;
  messageId?: string;
  members?: string[];
  [key: string]: unknown;
}

export class RelayClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private pendingResolvers = new Map<string, (data: RelayMessage) => void>();

  private connect(): Promise<WebSocket> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve(this.ws);
    }

    return new Promise((resolve, reject) => {
      logger.info(`[RelayClient] Connecting to ${RELAY_URL}`);
      const ws = new WebSocket(RELAY_URL);

      const timeout = setTimeout(() => {
        reject(new Error(`RelayClient connection timeout to ${RELAY_URL}`));
        ws.terminate();
      }, 8000);

      ws.on("open", () => {
        clearTimeout(timeout);
        this.ws = ws;
        logger.info("[RelayClient] Connected");
        resolve(ws);
      });

      ws.on("message", (data) => {
        try {
          const msg: RelayMessage = JSON.parse(data.toString());
          this.handleMessage(msg);
        } catch (err) {
          logger.warn("[RelayClient] Failed to parse message", err);
        }
      });

      ws.on("close", () => {
        logger.info("[RelayClient] Disconnected");
        this.ws = null;
        this.emit("disconnected");
      });

      ws.on("error", (err) => {
        clearTimeout(timeout);
        logger.error("[RelayClient] Error", err);
        this.emit("error", err);
        reject(err);
      });
    });
  }

  private handleMessage(msg: RelayMessage) {
    // Handle ping/pong keepalive
    if (msg.type === "ping") {
      this.send({ type: "pong" });
      return;
    }

    // Resolve pending promise if applicable
    const resolver = this.pendingResolvers.get(msg.type);
    if (resolver) {
      this.pendingResolvers.delete(msg.type);
      resolver(msg);
    }

    // Always emit for event listeners
    this.emit(msg.type, msg);

    // Convenience aliases
    if (msg.type === "message") {
      this.emit("message", msg);
    }
  }

  private send(msg: RelayMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private waitFor(type: string): Promise<RelayMessage> {
    return new Promise((resolve) => {
      this.pendingResolvers.set(type, resolve);
    });
  }

  async createRoom(roomId: string, peerId: string, displayName: string): Promise<RelayMessage> {
    await this.connect();
    const waitPromise = this.waitFor("room-created");
    this.send({ type: "create-room", roomId, peerId, displayName });
    const result = await waitPromise;
    logger.info(`[RelayClient] Room created: ${roomId}`);
    return result;
  }

  async joinRoom(roomId: string, peerId: string, displayName: string): Promise<string[]> {
    await this.connect();
    const waitPromise = this.waitFor("room-joined");
    this.send({ type: "join-room", roomId, peerId, displayName });
    const result = await waitPromise;
    logger.info(`[RelayClient] Joined room: ${roomId}`);
    return (result.members as string[]) ?? [];
  }

  sendMessage(text: string, peerId: string, displayName: string, roomId: string) {
    this.send({
      type: "message",
      roomId,
      peerId,
      displayName,
      text,
      timestamp: Date.now(),
      messageId: uuidv4(),
    });
  }

  leave(peerId: string, roomId: string) {
    this.send({ type: "leave", peerId, roomId });
    logger.info(`[RelayClient] Left room: ${roomId}`);
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}

// Singleton instance
export const relayClient = new RelayClient();
