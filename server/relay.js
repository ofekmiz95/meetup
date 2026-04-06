/**
 * Meetup Relay Server
 * Standalone WebSocket relay for routing messages between peers in rooms.
 * Run with: node server/relay.js
 */

const { WebSocketServer, WebSocket } = require("ws");
const { v4: uuidv4 } = require("uuid");

const PORT = process.env.PORT || 3001;
const HEARTBEAT_INTERVAL_MS = 15_000;
const HEARTBEAT_TIMEOUT_MS = 5_000;

// rooms: Map<roomId, Map<peerId, WebSocket>>
const rooms = new Map();

// clientMeta: Map<ws, { peerId, displayName, roomId }>
const clientMeta = new Map();

const wss = new WebSocketServer({ port: PORT });

// ── Heartbeat ────────────────────────────────────────────────────────────────

const heartbeatInterval = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws._isAlive === false) {
      ws.terminate();
      continue;
    }
    ws._isAlive = false;
    ws.send(JSON.stringify({ type: "ping" }));
  }
}, HEARTBEAT_INTERVAL_MS);

wss.on("close", () => clearInterval(heartbeatInterval));

// ── Helpers ───────────────────────────────────────────────────────────────────

function broadcastToRoom(roomId, msg, excludeWs) {
  const room = rooms.get(roomId);
  if (!room) return;
  const data = JSON.stringify(msg);
  for (const [, ws] of room) {
    if (ws === excludeWs) continue;
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}

function broadcastToRoomAll(roomId, msg) {
  broadcastToRoom(roomId, msg, null);
}

function getRoomMemberList(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.keys());
}

function removeClientFromRoom(ws) {
  const meta = clientMeta.get(ws);
  if (!meta) return;
  const { peerId, roomId } = meta;
  if (!roomId) return;

  const room = rooms.get(roomId);
  if (!room) return;

  room.delete(peerId);
  console.log(`[Relay] Peer left room ${roomId}: ${peerId}`);

  broadcastToRoomAll(roomId, { type: "member-left", peerId, roomId });

  if (room.size === 0) {
    rooms.delete(roomId);
    console.log(`[Relay] Room destroyed (empty): ${roomId}`);
  }
}

// ── Connection handler ────────────────────────────────────────────────────────

wss.on("connection", (ws) => {
  ws._isAlive = true;
  clientMeta.set(ws, { peerId: null, displayName: null, roomId: null });

  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }

    const meta = clientMeta.get(ws);

    switch (msg.type) {
      case "pong": {
        ws._isAlive = true;
        break;
      }

      case "create-room": {
        const { peerId, displayName, roomId } = msg;
        if (!peerId || !roomId) break;

        // Create room if not exists
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Map());
        }
        const room = rooms.get(roomId);
        room.set(peerId, ws);

        clientMeta.set(ws, { peerId, displayName, roomId });

        console.log(`[Relay] Room created: ${roomId} by ${peerId}`);

        ws.send(JSON.stringify({
          type: "room-created",
          roomId,
          peerId,
        }));
        break;
      }

      case "join-room": {
        const { peerId, displayName, roomId } = msg;
        if (!peerId || !roomId) break;

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Map());
        }
        const room = rooms.get(roomId);
        room.set(peerId, ws);

        clientMeta.set(ws, { peerId, displayName, roomId });

        const members = getRoomMemberList(roomId);

        console.log(`[Relay] Peer joined room ${roomId}: ${peerId}`);

        // Notify others
        broadcastToRoom(roomId, {
          type: "member-joined",
          peerId,
          displayName,
          roomId,
        }, ws);

        // Confirm to joiner with member list
        ws.send(JSON.stringify({
          type: "room-joined",
          roomId,
          peerId,
          members,
        }));
        break;
      }

      case "message": {
        const { peerId, displayName, roomId, text, timestamp } = msg;
        if (!roomId || !text) break;

        const messageId = msg.messageId || uuidv4();
        const outMsg = {
          type: "message",
          roomId,
          peerId,
          displayName,
          text,
          timestamp: timestamp || Date.now(),
          messageId,
        };

        // Broadcast to all members including sender
        broadcastToRoomAll(roomId, outMsg);
        break;
      }

      case "leave": {
        removeClientFromRoom(ws);
        // Clear meta roomId so close handler won't double-remove
        if (meta) meta.roomId = null;
        break;
      }

      default:
        break;
    }
  });

  ws.on("close", () => {
    removeClientFromRoom(ws);
    clientMeta.delete(ws);
  });

  ws.on("error", (err) => {
    console.error("[Relay] Socket error:", err.message);
  });
});

console.log(`[Relay] Listening on port ${PORT}`);
