import { useEffect } from "react";
import { api } from "../ipc/bridge";
import { useAppStore } from "../store/appStore";
import type { BleStatus, Peer } from "../../shared/types";

export function useBle() {
  const { addNearbyPeer, removeNearbyPeer, setBleStatus, selfPeerId } =
    useAppStore();

  useEffect(() => {
    const unsubDiscover = api.on("ble:peer-discovered", (...args) => {
      const peer = args[0] as Peer;
      if (peer.peerId === selfPeerId) return;
      addNearbyPeer(peer);
    });

    const unsubLost = api.on("ble:peer-lost", (...args) => {
      const { peerId } = args[0] as { peerId: string };
      removeNearbyPeer(peerId);
    });

    const unsubStatus = api.on("ble:status-changed", (...args) => {
      const { status } = args[0] as { status: BleStatus };
      setBleStatus(status);
    });

    return () => {
      unsubDiscover();
      unsubLost();
      unsubStatus();
    };
  }, [selfPeerId, addNearbyPeer, removeNearbyPeer, setBleStatus]);
}
