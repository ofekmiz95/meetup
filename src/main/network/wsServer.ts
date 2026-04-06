import { WebSocketServer, WebSocket } from "ws";
import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";
import type { WsMessage, Peer } from "../../shared/types";
import { logger } from "../utils/logger";

const HEARTBEAT_INTERVAL = 15_000;
const HEARTBEAT_TIMEOUT = 5_000;

interface ConnectedClient {
  ws: WebSocket;
  peerId: string;
  displayName: string;
  isAlive: boolean;
  pingTimer?: NodeJS.Timeout;
}

export class WsServer extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, ConnectedClient>();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  port = 0;

  async start(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.wss = new WebSocketServer({ port: 0 });

      this.wss.on("listening", () => {
        const addr = this.wss!.address() as { port: number };
        this.port = addr.port;
        logger.info(`[WsServer] Listening on port ${this.port}`);
        this.startHeartbeat();
        resolve(this.port);
      });

      this.wss.on("error", (err) => {
        logger.error("[WsServer] Server error", err);
        reject(err);
        this.emit("error", err);
      });

      this.wss.on("connection", (ws) => this.handleConnection(ws));
    });
  }

  private handleConnection(ws: WebSocket) {
    let clientPeerId: string | null = null;

    ws.on("message", (data) => {
      try {
        const msg: WsMessage = JSON.parse(data.toString());

        if (msg.type === "pong") {
          const client = clientPeerId
            ? this.clients.get(clientPeerId)
            : null;
          if (client) client.isAlive = true;
          return;
        }

        if (msg.type === "join" && msg.peerId) {
          clientPeerId = msg.peerId;
          this.clients.set(clientPeerId, {
            ws,
            peerId: msg.peerId,
            displayName: msg.displayName ?? "Unknown",
            isAlive: true,
          });

          logger.info(`[WsServer] Client joined: ${msg.peerId}`);

          const joinNotify: WsMessage = {
            type: "member-joined",
            peerId: msg.peerId,
            displayName: msg.displayName,
            roomId: msg.roomId,
          };
          this.broadcast(joinNotify, msg.peerId);
          this.emit("member-joined", {
            peerId: msg.peerId,
            displayName: msg.displayName,
          });
          return;
        }

        if (msg.type === "leave" && clientPeerId) {
          this.handleClientLeave(clientPeerId, ws);
          return;
        }

        if (msg.type === "message" && clientPeerId) {
          const outMsg: WsMessage = {
            ...msg,
            messageId: uuidv4(),
            timestamp: Date.now(),
          };
          this.broadcast(outMsg);
          this.emit("message", outMsg);
          return;
        }
      } catch (err) {
        logger.warn("[WsServer] Failed to parse message", err);
      }
    });

    ws.on("close", () => {
      if (clientPeerId) {
        this.handleClientLeave(clientPeerId, ws);
      }
    });

    ws.on("error", (err) => {
      logger.warn("[WsServer] Client socket error", err);
    });
  }

  private handleClientLeave(peerId: string, ws: WebSocket) {
    const client = this.clients.get(peerId);
    if (!client) return;

    this.clients.delete(peerId);
    logger.info(`[WsServer] Client left: ${peerId}`);

    const leaveMsg: WsMessage = { type: "member-left", peerId };
    this.broadcast(leaveMsg);
    this.emit("member-left", peerId);

    if (this.clients.size === 0) {
      this.emit("empty");
    }
  }

  broadcast(msg: WsMessage, excludePeerId?: string) {
    const data = JSON.stringify(msg);
    for (const [peerId, client] of this.clients) {
      if (peerId === excludePeerId) continue;
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }

  sendToAll(msg: WsMessage) {
    this.broadcast(msg);
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      for (const [peerId, client] of this.clients) {
        if (!client.isAlive) {
          logger.warn(`[WsServer] Peer timed out: ${peerId}`);
          client.ws.terminate();
          this.handleClientLeave(peerId, client.ws);
          continue;
        }

        client.isAlive = false;
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify({ type: "ping" }));
        }
      }
    }, HEARTBEAT_INTERVAL);
  }

  close() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    for (const client of this.clients.values()) {
      try {
        client.ws.close();
      } catch (_) {}
    }
    this.clients.clear();
    this.wss?.close();
    logger.info("[WsServer] Closed");
  }

  getClientCount(): number {
    return this.clients.size;
  }
}
