// Typed wrappers around the contextBridge-exposed electronAPI

declare global {
  interface Window {
    electronAPI: {
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
      on: (
        channel: string,
        callback: (...args: unknown[]) => void
      ) => () => void;
      send: (channel: string) => void;
    };
  }
}

export const api = {
  invoke: <T>(channel: string, ...args: unknown[]): Promise<T> =>
    window.electronAPI.invoke(channel, ...args) as Promise<T>,

  on: (channel: string, cb: (...args: unknown[]) => void): (() => void) =>
    window.electronAPI.on(channel, cb),

  send: (channel: string) => window.electronAPI.send(channel),
};
