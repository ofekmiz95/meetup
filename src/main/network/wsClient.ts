import { WebSocket } from "ws";
import { EventEmitter } from "events";
import type { WsMessage, Peer } from "../../shared/types";
import { logger } from "../utils/logger";

export class WsClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private selfPeer: Peer;
  private roomId: string;

  constructor(selfPeer: Peer, roomId: string) {
    super();
    this.selfPeer = selfPeer;
    this.roomId = roomId;
  }

  connect(ip: string, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `ws://${ip}:${port}`;
      logger.info(`[WsClient] Connecting to ${url}`);

      this.ws = new WebSocket(url);

      const timeout = setTimeout(() => {
        reject(new Error(`Connection timeout to ${url}`));
        this.ws?.terminate();
      }, 5000);

      this.ws.on("open", () => {
        clearTimeout(timeout);
        logger.info(`[WsClient] Connected to ${url}`);

        // Send join message
        this.send({
          type: "join",
          roomId: this.roomId,
          peerId: this.selfPeer.peerId,
          displayName: this.selfPeer.displayName,
        });

        resolve();
      });

      this.ws.on("message", (data) => {
        try {
          const msg: WsMessage = JSON.parse(data.toString());

          if (msg.type === "ping") {
            this.send({ type: "pong" });
            return;
          }

          this.emit("message", msg);
        } catch (err) {
          logger.warn("[WsClient] Failed to parse message", err);
        }
      });

      this.ws.on("close", () => {
        clearTimeout(timeout);
        logger.info("[WsClient] Connection closed");
        this.emit("disconnected");
      });

      this.ws.on("error", (err) => {
        clearTimeout(timeout);
        logger.error("[WsClient] Connection error", err);
        this.emit("error", err);
        reject(err);
      });
    });
  }

  send(msg: WsMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  sendMessage(text: string) {
    this.send({
      type: "message",
      peerId: this.selfPeer.peerId,
      displayName: this.selfPeer.displayName,
      text,
      timestamp: Date.now(),
    });
  }

  disconnect() {
    if (this.reconnectTimer) clearInterval(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    logger.info("[WsClient] Disconnected");
  }
}
