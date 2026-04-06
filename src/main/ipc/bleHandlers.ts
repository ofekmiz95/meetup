import { ipcMain } from "electron";
import type { BleManager } from "../ble/bleManager";

export function registerBleHandlers(bleManager: BleManager) {
  ipcMain.handle("ble:get-status", () => {
    return { status: bleManager["status"] };
  });
}
