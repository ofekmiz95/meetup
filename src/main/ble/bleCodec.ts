/**
 * Encodes/decodes BLE advertisement payload.
 * Format (15 bytes):
 *   [0..7]  peerId  - first 8 hex chars of UUID
 *   [8..11] IPv4    - 4 bytes
 *   [12..13] WS port - 2 bytes big-endian
 *   [14]    flags   - 0x01 = hasRoom
 */

export interface BlePayload {
  peerId: string;
  ip: string;
  wsPort: number;
  hasRoom: boolean;
}

export function encodePayload(payload: BlePayload): Buffer {
  const buf = Buffer.alloc(15);

  // peerId: first 8 chars (no dashes)
  const peerShort = payload.peerId.replace(/-/g, "").slice(0, 8);
  buf.write(peerShort, 0, "ascii");

  // IPv4
  const parts = payload.ip.split(".").map(Number);
  buf[8] = parts[0] ?? 127;
  buf[9] = parts[1] ?? 0;
  buf[10] = parts[2] ?? 0;
  buf[11] = parts[3] ?? 1;

  // WS port
  buf.writeUInt16BE(payload.wsPort, 12);

  // Flags
  buf[14] = payload.hasRoom ? 0x01 : 0x00;

  return buf;
}

export function decodePayload(
  buf: Buffer,
  displayName: string
): BlePayload & { displayName: string } {
  const peerShort = buf.slice(0, 8).toString("ascii");
  const ip = `${buf[8]}.${buf[9]}.${buf[10]}.${buf[11]}`;
  const wsPort = buf.readUInt16BE(12);
  const hasRoom = (buf[14] & 0x01) === 0x01;

  return { peerId: peerShort, ip, wsPort, hasRoom, displayName };
}
