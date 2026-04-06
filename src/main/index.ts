import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { BleManager } from "./ble/bleManager";
import { RoomManager } from "./room/roomManager";
import { registerAllHandlers } from "./ipc/index";
import { getLocalIp } from "./utils/localIp";
import { logger } from "./utils/logger";
import type { Peer } from "../shared/types";

const isDev = process.env.NODE_ENV === "development";

// Self peer info - lives only in memory for session lifetime
const selfPeer: Peer = {
  peerId: uuidv4(),
  displayName: os.userInfo().username,
  ip: getLocalIp(),
  wsPort: 0,
  isHost: false,
};

let mainWindow: BrowserWindow | null = null;
const bleManager = new BleManager({
  peerId: selfPeer.peerId,
  displayName: selfPeer.displayName,
  localIp: selfPeer.ip ?? "",
});
const roomManager = new RoomManager();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    minWidth: 640,
    minHeight: 480,
    webPreferences: {
      preload: path.join(__dirname, "../../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: false,
    titleBarStyle: "hidden",
    backgroundColor: "#0f0f13",
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow!.show();
  });

  mainWindow.on("close", async () => {
    // Leave any active room before quit
    const activeRoom = roomManager.getActiveRoom();
    if (activeRoom) {
      ipcMain.emit("room:leave");
    }
    bleManager.destroy();
  });
}

app.whenReady().then(async () => {
  createWindow();
  if (!mainWindow) return;

  registerAllHandlers(mainWindow, bleManager, roomManager, selfPeer);

  // Handle app:ready from renderer — BLE does NOT auto-start
  ipcMain.handle("app:ready", async () => {
    logger.info(`[Main] App ready. PeerId: ${selfPeer.peerId}`);

    return {
      selfPeerId: selfPeer.peerId,
      selfDisplayName: selfPeer.displayName,
      bleStatus: "idle" as const,
    };
  });

  // Explicit scan trigger from renderer (e.g. "Scan for Rooms" button)
  ipcMain.handle("ble:start-scan", async () => {
    const status = await bleManager.init();

    // Attach peer event forwarding after init (only once)
    bleManager.removeAllListeners("peer-discovered");
    bleManager.removeAllListeners("peer-lost");

    bleManager.on("peer-discovered", (peer) => {
      mainWindow?.webContents.send("ble:peer-discovered", peer);

      // If peer has a room open and we're not in one, send invite
      if (peer.hasRoom && !roomManager.getActiveRoom()) {
        mainWindow?.webContents.send("room:invite-received", {
          roomId: peer.roomId ?? `${peer.peerId}-room`,
          hostPeerId: peer.peerId,
          hostDisplayName: peer.displayName,
        });
      }
    });

    bleManager.on("peer-lost", (peerId: string) => {
      mainWindow?.webContents.send("ble:peer-lost", { peerId });
    });

    await bleManager.startScanning();

    logger.info(`[Main] BLE scan started. Status: ${status}`);
    return { bleStatus: status };
  });

  // Window controls
  ipcMain.on("window:minimize", () => mainWindow?.minimize());
  ipcMain.on("window:maximize", () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize();
    else mainWindow?.maximize();
  });
  ipcMain.on("window:close", () => mainWindow?.close());
});

app.on("window-all-closed", () => {
  bleManager.destroy();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
