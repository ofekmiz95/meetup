import { ipcMain } from "electron";
import type { RoomManager } from "../room/roomManager";
import type { Peer } from "../../shared/types";
import { relayClient } from "../network/relayClient";

interface ChatContext {
  roomManager: RoomManager;
  selfPeer: Peer;
}

export function registerChatHandlers(ctx: ChatContext) {
  const { roomManager, selfPeer } = ctx;

  ipcMain.handle("chat:send", async (_, { text }: { text: string }) => {
    const activeRoom = roomManager.getActiveRoom();
    if (!activeRoom) throw new Error("No active room");

    // Relay echoes back to all members including sender,
    // so the message will arrive via chat:message-received — no optimistic add here.
    relayClient.sendMessage(text, selfPeer.peerId, selfPeer.displayName, activeRoom.roomId);
  });
}
