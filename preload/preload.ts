import { contextBridge, ipcRenderer } from "electron";

// Whitelist of all IPC channels renderer is allowed to use
const INVOKE_CHANNELS = [
  "app:ready",
  "ble:get-status",
  "room:create",
  "room:join",
  "room:leave",
  "chat:send",
] as const;

const LISTEN_CHANNELS = [
  "app:init-data",
  "app:error",
  "ble:status-changed",
  "ble:peer-discovered",
  "ble:peer-lost",
  "room:created",
  "room:joined",
  "room:invite-received",
  "room:state-updated",
  "room:closed",
  "room:host-changed",
  "chat:message-received",
] as const;

type InvokeChannel = (typeof INVOKE_CHANNELS)[number];
type ListenChannel = (typeof LISTEN_CHANNELS)[number];

contextBridge.exposeInMainWorld("electronAPI", {
  invoke: (channel: InvokeChannel, ...args: unknown[]) => {
    if (!INVOKE_CHANNELS.includes(channel)) {
      throw new Error(`IPC channel not allowed: ${channel}`);
    }
    return ipcRenderer.invoke(channel, ...args);
  },

  on: (channel: ListenChannel, callback: (...args: unknown[]) => void) => {
    if (!LISTEN_CHANNELS.includes(channel)) {
      throw new Error(`IPC channel not allowed: ${channel}`);
    }
    const wrapped = (_: Electron.IpcRendererEvent, ...args: unknown[]) =>
      callback(...args);
    ipcRenderer.on(channel, wrapped);
    return () => ipcRenderer.removeListener(channel, wrapped);
  },

  send: (channel: "window:minimize" | "window:maximize" | "window:close") => {
    ipcRenderer.send(channel);
  },
});
