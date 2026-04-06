import { ipcMain, BrowserWindow } from "electron";
import type { RoomManager } from "../room/roomManager";
import type { WsServer } from "../network/wsServer";
import type { WsClient } from "../network/wsClient";
import type { BleManager } from "../ble/bleManager";
import type { Peer } from "../../shared/types";
import { WsClient as WsClientClass } from "../network/wsClient";
import { logger } from "../utils/logger";

interface RoomContext {
  roomManager: RoomManager;
  wsServer: WsServer | null;
  wsClient: WsClient | null;
  bleManager: BleManager;
  selfPeer: Peer;
  mainWindow: BrowserWindow;
  setWsServer: (s: WsServer | null) => void;
  setWsClient: (c: WsClient | null) => void;
}

export function registerRoomHandlers(ctx: RoomContext) {
  const {
    roomManager,
    bleManager,
    selfPeer,
    mainWindow,
    setWsServer,
    setWsClient,
  } = ctx;

  ipcMain.handle("room:create", async () => {
    const { WsServer: WsServerClass } = await import("../network/wsServer");
    const server = new WsServerClass();

    try {
      const port = await server.start();
      setWsServer(server);

      const hostPeer: Peer = { ...selfPeer, isHost: true, wsPort: port };
      const room = roomManager.createRoom(hostPeer, port);

      bleManager.setRoomState(port, true);

      server.on("member-joined", ({ peerId, displayName }) => {
        roomManager.addMember(room.roomId, {
          peerId,
          displayName,
          ip: "",
          wsPort: 0,
          isHost: false,
        });
        mainWindow.webContents.send("room:state-updated", {
          roomId: room.roomId,
          members: roomManager.getRoomMembers(room.roomId),
          hostPeerId: room.hostPeerId,
        });
      });

      server.on("member-left", (peerId: string) => {
        const { empty } = roomManager.removeMember(room.roomId, peerId);
        mainWindow.webContents.send("room:state-updated", {
          roomId: room.roomId,
          members: roomManager.getRoomMembers(room.roomId),
          hostPeerId: room.hostPeerId,
        });
        if (empty) {
          server.close();
          setWsServer(null);
          roomManager.destroyRoom(room.roomId);
          bleManager.setRoomState(0, false);
          mainWindow.webContents.send("room:closed", {
            roomId: room.roomId,
            reason: "empty",
          });
        }
      });

      server.on("message", (msg) => {
        mainWindow.webContents.send("chat:message-received", {
          peerId: msg.peerId,
          displayName: msg.displayName,
          text: msg.text,
          timestamp: msg.timestamp,
          messageId: msg.messageId,
        });
      });

      logger.info(`[RoomHandlers] Room created: ${room.roomId}`);
      return { roomId: room.roomId, wsPort: port };
    } catch (err) {
      server.close();
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
        hostIp,
        hostPort,
        hostDisplayName,
      }: {
        roomId: string;
        hostPeerId: string;
        hostIp: string;
        hostPort: number;
        hostDisplayName: string;
      }
    ) => {
      const client = new WsClientClass(selfPeer, roomId);
      setWsClient(client);

      client.on("message", (msg) => {
        if (msg.type === "message") {
          mainWindow.webContents.send("chat:message-received", {
            peerId: msg.peerId,
            displayName: msg.displayName,
            text: msg.text,
            timestamp: msg.timestamp,
            messageId: msg.messageId,
          });
        }

        if (msg.type === "member-joined" || msg.type === "member-left") {
          const activeRoom = roomManager.getActiveRoom();
          if (activeRoom) {
            if (msg.type === "member-joined" && msg.peerId) {
              roomManager.addMember(activeRoom.roomId, {
                peerId: msg.peerId,
                displayName: msg.displayName ?? "Unknown",
                ip: "",
                wsPort: 0,
                isHost: false,
              });
            } else if (msg.type === "member-left" && msg.peerId) {
              roomManager.removeMember(activeRoom.roomId, msg.peerId);
            }
            mainWindow.webContents.send("room:state-updated", {
              roomId: activeRoom.roomId,
              members: roomManager.getRoomMembers(activeRoom.roomId),
              hostPeerId: activeRoom.hostPeerId,
            });
          }
        }

        if (msg.type === "host-migrating" && msg.nextHostPeerId) {
          const activeRoom = roomManager.getActiveRoom();
          if (activeRoom) {
            roomManager.updateHost(activeRoom.roomId, msg.nextHostPeerId);
            mainWindow.webContents.send("room:host-changed", {
              newHostPeerId: msg.nextHostPeerId,
            });
          }
        }
      });

      client.on("disconnected", () => {
        const activeRoom = roomManager.getActiveRoom();
        if (activeRoom) {
          roomManager.destroyRoom(activeRoom.roomId);
          mainWindow.webContents.send("room:closed", {
            roomId: activeRoom.roomId,
            reason: "host-disconnected",
          });
        }
        setWsClient(null);
      });

      try {
        await client.connect(hostIp, hostPort);

        const hostPeer: Peer = {
          peerId: hostPeerId,
          displayName: hostDisplayName,
          ip: hostIp,
          wsPort: hostPort,
          isHost: true,
        };
        const room = roomManager.joinRoomAsGuest(
          roomId,
          hostPeer,
          selfPeer,
          hostPort
        );

        logger.info(`[RoomHandlers] Joined room: ${roomId}`);
        return { roomId, hostPeerId };
      } catch (err) {
        client.disconnect();
        setWsClient(null);
        logger.error("[RoomHandlers] Failed to join room", err);
        throw err;
      }
    }
  );

  ipcMain.handle("room:leave", async () => {
    const activeRoom = roomManager.getActiveRoom();
    if (!activeRoom) return;

    const wsServer = ctx.wsServer;
    const wsClient = ctx.wsClient;

    if (wsServer) {
      // We are the host - migrate or close
      const nextHost = roomManager.electNextHost(
        activeRoom.roomId,
        selfPeer.peerId
      );

      if (nextHost) {
        wsServer.sendToAll({
          type: "host-migrating",
          nextHostPeerId: nextHost,
          roomId: activeRoom.roomId,
        });
      }

      wsServer.close();
      setWsServer(null);
    }

    if (wsClient) {
      wsClient.send({
        type: "leave",
        peerId: selfPeer.peerId,
        roomId: activeRoom.roomId,
      });
      wsClient.disconnect();
      setWsClient(null);
    }

    roomManager.destroyRoom(activeRoom.roomId);
    bleManager.setRoomState(0, false);

    mainWindow.webContents.send("room:closed", {
      roomId: activeRoom.roomId,
      reason: "user-left",
    });
  });
}
