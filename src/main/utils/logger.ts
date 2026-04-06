import log from "electron-log";

log.transports.file.level = "info";
log.transports.console.level = "debug";

// Never log message content - only metadata
export const logger = {
  info: (msg: string, ...args: unknown[]) => log.info(msg, ...args),
  warn: (msg: string, ...args: unknown[]) => log.warn(msg, ...args),
  error: (msg: string, ...args: unknown[]) => log.error(msg, ...args),
  debug: (msg: string, ...args: unknown[]) => log.debug(msg, ...args),
};
