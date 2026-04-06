import { ipcMain, BrowserWindow } from "electron";
import { v4 as uuidv4 } from "uuid";
import type { RoomManager } from "../room/roomManager";
import type { BleManager } from "../ble/bleManager";
import type { Peer } from "../../shared/types";
import { relayClient } from "../network/relayClient";
import { logger } from "../utils/logger";

interface RoomContext {
  roomManager: RoomManager;
  bleManager: BleManager;
  selfPeer: Peer;
  mainWindow: BrowserWindow;
}

function wireRelayEvents(roomId: string, roomManager: RoomManager, mainWindow: BrowserWindow) {
  // Remove old listeners to avoid duplicate handlers on repeated room joins
  relayClient.removeAllListeners("message");
  relayClient.removeAllListeners("member-joined");
  relayClient.removeAllListeners("member-left");
  relayClient.removeAllListeners("disconnected");

  relayClient.on("message", (msg: any) => {
    mainWindow.webContents.send("chat:message-received", {
      peerId: msg.peerId,
      displayName: msg.displayName,
      text: msg.text,
      timestamp: msg.timestamp,
      messageId: msg.messageId,
    });
  });

  relayClient.on("member-joined", (msg: any) => {
    const activeRoom = roomManager.getActiveRoom();
    if (!activeRoom) return;

    roomManager.addMember(activeRoom.roomId, {
      peerId: msg.peerId,
      displayName: msg.displayName ?? "Unknown",
      isHost: false,
    });

    mainWindow.webContents.send("room:state-updated", {
      roomId: activeRoom.roomId,
      members: roomManager.getRoomMembers(activeRoom.roomId),
      hostPeerId: activeRoom.hostPeerId,
    });
  });

  relayClient.on("member-left", (msg: any) => {
    const activeRoom = roomManager.getActiveRoom();
    if (!activeRoom) return;

    const { empty } = roomManager.removeMember(activeRoom.roomId, msg.peerId);

    mainWindow.webContents.send("room:state-updated", {
      roomId: activeRoom.roomId,
      members: roomManager.getRoomMembers(activeRoom.roomId),
      hostPeerId: activeRoom.hostPeerId,
    });

    if (empty) {
      roomManager.destroyRoom(activeRoom.roomId);
      mainWindow.webContents.send("room:closed", {
        roomId: activeRoom.roomId,
        reason: "empty",
      });
    }
  });

  relayClient.on("disconnected", () => {
    const activeRoom = roomManager.getActiveRoom();
    if (activeRoom) {
      roomManager.destroyRoom(activeRoom.roomId);
      mainWindow.webContents.send("room:closed", {
        roomId: activeRoom.roomId,
        reason: "host-disconnected",
      });
    }
  });
}

export function registerRoomHandlers(ctx: RoomContext) {
  const { roomManager, bleManager, selfPeer, mainWindow } = ctx;

  ipcMain.handle("room:create", async () => {
    try {
      const roomId = uuidv4();

      await bleManager.startScanning();
      bleManager.setRoomState(roomId, true);

      await relayClient.createRoom(roomId, selfPeer.peerId, selfPeer.displayName);

      const hostPeer: Peer = { ...selfPeer, isHost: true };
      const room = roomManager.createRoom(hostPeer, 0);

      wireRelayEvents(room.roomId, roomManager, mainWindow);

      logger.info(`[RoomHandlers] Room created: ${room.roomId}`);
      mainWindow.webContents.send("room:created", { roomId: room.roomId });

      return { roomId: room.roomId };
    } catch (err) {
      logger.error("[RoomHandlers] Failed to create room", err);
      throw err;
    }
  });

  ipcMain.handle(
    "room:join",
    async (
      _,
      {
        roomId,
        hostPeerId,
        hostDisplayName,
      }: {
        roomId: string;
        hostPeerId: string;
        hostDisplayName: string;
        // legacy fields - no longer used for connection but kept for compat
        hostIp?: string;
        hostPort?: number;
      }
    ) => {
      try {
        await bleManager.startScanning();

        const members = await relayClient.joinRoom(roomId, selfPeer.peerId, selfPeer.displayName);

        const hostPeer: Peer = {
          peerId: hostPeerId,
          displayName: hostDisplayName,
          isHost: true,
        };

        roomManager.joinRoomAsGuest(roomId, hostPeer, selfPeer, 0);

        wireRelayEvents(roomId, roomManager, mainWindow);

        logger.info(`[RoomHandlers] Joined room: ${roomId}`);
        mainWindow.webContents.send("room:joined", { roomId, hostPeerId, members });

        return { roomId, hostPeerId };
      } catch (err) {
        logger.error("[RoomHandlers] Failed to join room", err);
        throw err;
      }
    }
  );

  ipcMain.handle("room:leave", async () => {
    const activeRoom = roomManager.getActiveRoom();
    if (!activeRoom) return;

    relayClient.leave(selfPeer.peerId, activeRoom.roomId);

    // Remove relay event listeners
    relayClient.removeAllListeners("message");
    relayClient.removeAllListeners("member-joined");
    relayClient.removeAllListeners("member-left");
    relayClient.removeAllListeners("disconnected");

    bleManager.setRoomState("", false);
    bleManager.stopScanning();

    roomManager.destroyRoom(activeRoom.roomId);

    mainWindow.webContents.send("room:closed", {
      roomId: activeRoom.roomId,
      reason: "user-left",
    });
  });
}
