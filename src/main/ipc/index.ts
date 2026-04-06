import { BrowserWindow } from "electron";
import { BleManager } from "../ble/bleManager";
import { RoomManager } from "../room/roomManager";
import { WsServer } from "../network/wsServer";
import { WsClient } from "../network/wsClient";
import type { Peer } from "../../shared/types";
import { registerBleHandlers } from "./bleHandlers";
import { registerRoomHandlers } from "./roomHandlers";
import { registerChatHandlers } from "./chatHandlers";

export function registerAllHandlers(
  mainWindow: BrowserWindow,
  bleManager: BleManager,
  roomManager: RoomManager,
  selfPeer: Peer
) {
  let wsServer: WsServer | null = null;
  let wsClient: WsClient | null = null;

  registerBleHandlers(bleManager);

  registerRoomHandlers({
    roomManager,
    get wsServer() {
      return wsServer;
    },
    get wsClient() {
      return wsClient;
    },
    bleManager,
    selfPeer,
    mainWindow,
    setWsServer: (s) => {
      wsServer = s;
    },
    setWsClient: (c) => {
      wsClient = c;
    },
  });

  registerChatHandlers({
    roomManager,
    getWsServer: () => wsServer,
    getWsClient: () => wsClient,
    selfPeer,
  });
}
