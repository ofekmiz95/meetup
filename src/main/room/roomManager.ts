import { v4 as uuidv4 } from "uuid";
import type { Room, Peer, Message } from "../../shared/types";
import { logger } from "../utils/logger";

export class RoomManager {
  private rooms = new Map<string, Room>();

  createRoom(hostPeer: Peer, wsPort: number): Room {
    const room: Room = {
      roomId: uuidv4(),
      hostPeerId: hostPeer.peerId,
      members: new Map([[hostPeer.peerId, hostPeer]]),
      messages: [],
      wsPort,
      createdAt: Date.now(),
    };

    this.rooms.set(room.roomId, room);
    logger.info(`[RoomManager] Room created: ${room.roomId}`);
    return room;
  }

  joinRoomAsGuest(
    roomId: string,
    hostPeer: Peer,
    selfPeer: Peer,
    wsPort: number
  ): Room {
    const room: Room = {
      roomId,
      hostPeerId: hostPeer.peerId,
      members: new Map([
        [hostPeer.peerId, hostPeer],
        [selfPeer.peerId, selfPeer],
      ]),
      messages: [],
      wsPort,
      createdAt: Date.now(),
    };

    this.rooms.set(roomId, room);
    logger.info(`[RoomManager] Joined room as guest: ${roomId}`);
    return room;
  }

  addMember(roomId: string, peer: Peer): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    room.members.set(peer.peerId, peer);
    logger.info(
      `[RoomManager] Member joined room ${roomId}: ${peer.peerId}`
    );
    return true;
  }

  removeMember(roomId: string, peerId: string): { empty: boolean } {
    const room = this.rooms.get(roomId);
    if (!room) return { empty: true };

    room.members.delete(peerId);
    logger.info(`[RoomManager] Member left room ${roomId}: ${peerId}`);

    return { empty: room.members.size === 0 };
  }

  addMessage(roomId: string, message: Message): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    room.messages.push(message);
    return true;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getActiveRoom(): Room | undefined {
    return this.rooms.values().next().value;
  }

  destroyRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.messages = [];
      room.members.clear();
      this.rooms.delete(roomId);
      logger.info(`[RoomManager] Room destroyed: ${roomId}`);
    }
  }

  updateHost(roomId: string, newHostPeerId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.hostPeerId = newHostPeerId;
      const peer = room.members.get(newHostPeerId);
      if (peer) peer.isHost = true;
    }
  }

  getRoomMembers(roomId: string): Peer[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.members.values());
  }

  electNextHost(roomId: string, excludePeerId: string): string | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const candidates = Array.from(room.members.keys()).filter(
      (id) => id !== excludePeerId
    );

    if (candidates.length === 0) return null;

    // Elect lowest peerId lexicographically
    return candidates.sort()[0];
  }
}
