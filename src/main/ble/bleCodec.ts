/**
 * Encodes/decodes BLE advertisement payload.
 * Format (15 bytes):
 *   [0..7]  peerId  - first 8 ASCII chars of UUID (no dashes)
 *   [8..13] roomId  - first 6 ASCII chars of UUID (no dashes), zeros if no room
 *   [14]    flags   - 0x01 = hasRoom
 */

export interface BlePayload {
  peerId: string;
  roomId: string;
  hasRoom: boolean;
}

export function encodePayload(payload: BlePayload): Buffer {
  const buf = Buffer.alloc(15, 0);

  // peerId: first 8 chars (no dashes)
  const peerShort = payload.peerId.replace(/-/g, "").slice(0, 8);
  buf.write(peerShort, 0, "ascii");

  // roomId: first 6 chars (no dashes), zeros if no room
  if (payload.hasRoom && payload.roomId) {
    const roomShort = payload.roomId.replace(/-/g, "").slice(0, 6);
    buf.write(roomShort, 8, "ascii");
  }

  // Flags
  buf[14] = payload.hasRoom ? 0x01 : 0x00;

  return buf;
}

export function decodePayload(
  buf: Buffer,
  displayName: string
): BlePayload & { displayName: string } {
  const peerId = buf.slice(0, 8).toString("ascii");
  const roomIdRaw = buf.slice(8, 14).toString("ascii");
  const hasRoom = (buf[14] & 0x01) === 0x01;
  const roomId = hasRoom ? roomIdRaw : "";

  return { peerId, roomId, hasRoom, displayName };
}
