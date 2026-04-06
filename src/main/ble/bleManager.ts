import { EventEmitter } from "events";
import dgram from "dgram";
import { BleScanner, DiscoveredPeer } from "./bleScanner";
import { encodePayload } from "./bleCodec";
import { logger } from "../utils/logger";
import {
  BLE_SERVICE_UUID,
  UDP_DISCOVERY_PORT,
  ADVERTISE_INTERVAL_MS,
} from "./bleConstants";
import type { BleStatus } from "../../shared/types";

export type { DiscoveredPeer };

interface BleManagerOptions {
  peerId: string;
  displayName: string;
  localIp: string; // kept for constructor compat but unused for chat
}

export class BleManager extends EventEmitter {
  private noble: any;
  private scanner: BleScanner | null = null;
  private udpSocket: dgram.Socket | null = null;
  private udpAdvertiseTimer: NodeJS.Timeout | null = null;
  private options: BleManagerOptions;
  private roomId = "";
  private hasRoom = false;
  private usingUdpFallback = false;
  private initialized = false;
  private status: BleStatus = "idle";

  constructor(options: BleManagerOptions) {
    super();
    this.options = options;
  }

  async init(): Promise<BleStatus> {
    if (this.initialized) return this.status;

    try {
      // Dynamically require noble to catch native module errors gracefully
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.noble = require("@abandonware/noble");

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Noble init timeout")),
          5000
        );

        this.noble.on("stateChange", (state: string) => {
          logger.info(`[BleManager] Noble state: ${state}`);
          if (state === "poweredOn") {
            clearTimeout(timeout);
            resolve();
          } else if (state === "unsupported" || state === "unauthorized") {
            clearTimeout(timeout);
            reject(new Error(`BLE state: ${state}`));
          }
        });

        // If already powered on
        if (this.noble.state === "poweredOn") {
          clearTimeout(timeout);
          resolve();
        }
      });

      this.scanner = new BleScanner(this.noble);
      this.scanner.on("peer-discovered", (peer: DiscoveredPeer) =>
        this.emit("peer-discovered", peer)
      );
      this.scanner.on("peer-lost", (peerId: string) =>
        this.emit("peer-lost", peerId)
      );

      this.initialized = true;
      this.status = "scanning";
      logger.info("[BleManager] BLE initialized successfully");
    } catch (err) {
      logger.warn("[BleManager] BLE unavailable, falling back to UDP", err);
      this.usingUdpFallback = true;
      this.initialized = true;
      this.status = "udp-fallback";
    }

    return this.status;
  }

  async startScanning(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }

    if (this.usingUdpFallback) {
      if (!this.udpSocket) {
        this.startUdpDiscovery();
      }
      return;
    }

    if (this.scanner) {
      this.scanner.start();
    }
  }

  stopScanning(): void {
    if (this.scanner) {
      this.scanner.stop();
    }

    if (this.udpAdvertiseTimer) {
      clearInterval(this.udpAdvertiseTimer);
      this.udpAdvertiseTimer = null;
    }

    if (this.udpSocket) {
      try {
        this.udpSocket.close();
      } catch (_) {}
      this.udpSocket = null;
    }

    logger.info("[BleManager] Scanning stopped");
  }

  setRoomState(roomId: string, hasRoom: boolean) {
    this.roomId = roomId;
    this.hasRoom = hasRoom;
  }

  private getPayloadBuffer(): Buffer {
    return encodePayload({
      peerId: this.options.peerId,
      roomId: this.roomId,
      hasRoom: this.hasRoom,
    });
  }

  private startUdpDiscovery() {
    this.udpSocket = dgram.createSocket({ type: "udp4", reuseAddr: true });

    this.udpSocket.on("message", (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        if (data.appId !== "meetup-proximity-v1") return;
        if (data.peerId === this.options.peerId) return; // ignore self

        const peer: DiscoveredPeer = {
          peerId: data.peerId,
          displayName: data.displayName,
          roomId: data.hasRoom ? data.roomId : undefined,
          hasRoom: data.hasRoom,
          rssi: -70, // simulated
        };

        this.emit("peer-discovered", peer);
      } catch (_) {
        // ignore malformed packets
      }
    });

    this.udpSocket.bind(UDP_DISCOVERY_PORT, () => {
      this.udpSocket!.setBroadcast(true);
      logger.info(`[BleManager] UDP discovery bound on ${UDP_DISCOVERY_PORT}`);
      this.scheduleUdpBroadcast();
    });
  }

  private scheduleUdpBroadcast() {
    const broadcast = () => {
      if (!this.udpSocket) return;

      const payload = JSON.stringify({
        appId: "meetup-proximity-v1",
        peerId: this.options.peerId,
        displayName: this.options.displayName,
        roomId: this.roomId,
        hasRoom: this.hasRoom,
      });

      const msg = Buffer.from(payload);
      this.udpSocket.send(
        msg,
        0,
        msg.length,
        UDP_DISCOVERY_PORT,
        "255.255.255.255"
      );
    };

    broadcast();
    this.udpAdvertiseTimer = setInterval(broadcast, ADVERTISE_INTERVAL_MS);
  }

  destroy() {
    this.stopScanning();
    logger.info("[BleManager] Destroyed");
  }
}
