import { BrowserWindow } from "electron";
import { BleManager } from "../ble/bleManager";
import { RoomManager } from "../room/roomManager";
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
  registerBleHandlers(bleManager);

  registerRoomHandlers({
    roomManager,
    bleManager,
    selfPeer,
    mainWindow,
  });

  registerChatHandlers({
    roomManager,
    selfPeer,
  });
}
