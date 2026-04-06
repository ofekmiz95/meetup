import { EventEmitter } from "events";
import { decodePayload } from "./bleCodec";
import { logger } from "../utils/logger";
import { BLE_SERVICE_UUID } from "./bleConstants";

export interface DiscoveredPeer {
  peerId: string;
  displayName: string;
  roomId?: string;
  hasRoom: boolean;
  rssi: number;
}

export class BleScanner extends EventEmitter {
  private noble: any;
  private discovered = new Map<string, NodeJS.Timeout>();

  constructor(nobleInstance: any) {
    super();
    this.noble = nobleInstance;
  }

  start() {
    this.noble.on("discover", this.handleDiscover.bind(this));
    this.noble.startScanning([BLE_SERVICE_UUID], true);
    logger.info("[BleScanner] Started scanning");
  }

  stop() {
    this.noble.stopScanning();
    this.noble.removeAllListeners("discover");
    logger.info("[BleScanner] Stopped scanning");
  }

  private handleDiscover(peripheral: any) {
    try {
      const mfData =
        peripheral.advertisement?.manufacturerData;
      if (!mfData || mfData.length < 15) return;

      const localName =
        peripheral.advertisement?.localName ?? "Unknown";
      const decoded = decodePayload(mfData, localName);
      const rssi: number = peripheral.rssi ?? -100;

      const peer: DiscoveredPeer = {
        peerId: decoded.peerId,
        displayName: decoded.displayName,
        roomId: decoded.hasRoom ? decoded.roomId : undefined,
        hasRoom: decoded.hasRoom,
        rssi,
      };

      // Reset stale timer
      const existing = this.discovered.get(peer.peerId);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        this.discovered.delete(peer.peerId);
        this.emit("peer-lost", peer.peerId);
        logger.info(`[BleScanner] Peer lost: ${peer.peerId}`);
      }, 10_000);

      this.discovered.set(peer.peerId, timer);
      this.emit("peer-discovered", peer);
    } catch (err) {
      logger.warn("[BleScanner] Failed to parse advertisement", err);
    }
  }
}
