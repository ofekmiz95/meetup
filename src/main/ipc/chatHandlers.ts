import { ipcMain } from "electron";
import type { WsServer } from "../network/wsServer";
import type { WsClient } from "../network/wsClient";
import type { RoomManager } from "../room/roomManager";
import type { Peer } from "../../shared/types";
import { v4 as uuidv4 } from "uuid";

interface ChatContext {
  roomManager: RoomManager;
  getWsServer: () => WsServer | null;
  getWsClient: () => WsClient | null;
  selfPeer: Peer;
}

export function registerChatHandlers(ctx: ChatContext) {
  const { roomManager, getWsServer, getWsClient, selfPeer } = ctx;

  ipcMain.handle("chat:send", async (_, { text }: { text: string }) => {
    const activeRoom = roomManager.getActiveRoom();
    if (!activeRoom) throw new Error("No active room");

    const wsServer = getWsServer();
    const wsClient = getWsClient();

    const messageId = uuidv4();
    const timestamp = Date.now();

    const msg = {
      type: "message" as const,
      roomId: activeRoom.roomId,
      peerId: selfPeer.peerId,
      displayName: selfPeer.displayName,
      text,
      timestamp,
      messageId,
    };

    if (wsServer) {
      // We are host - broadcast to all clients
      wsServer.broadcast(msg);
    } else if (wsClient) {
      // We are guest - send to host
      wsClient.send(msg);
    }

    return { messageId, timestamp };
  });
}
