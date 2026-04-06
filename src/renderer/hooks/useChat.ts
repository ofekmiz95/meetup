import { useEffect } from "react";
import { api } from "../ipc/bridge";
import { useAppStore } from "../store/appStore";
import { v4 as uuidv4 } from "uuid";
import type { Message } from "../../shared/types";

export function useChat() {
  const { addMessage, selfPeerId, selfDisplayName } = useAppStore();

  useEffect(() => {
    const unsub = api.on("chat:message-received", (...args) => {
      const msg = args[0] as {
        peerId: string;
        displayName: string;
        text: string;
        timestamp: number;
        messageId?: string;
      };

      const message: Message = {
        id: msg.messageId ?? uuidv4(),
        peerId: msg.peerId,
        displayName: msg.displayName,
        text: msg.text,
        timestamp: msg.timestamp,
      };

      addMessage(message);
    });

    return unsub;
  }, [addMessage]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Optimistically add own message to the store for hosts
    // (guests receive their own message echoed back from the server)
    const { room } = useAppStore.getState();
    if (room?.isHost) {
      addMessage({
        id: uuidv4(),
        peerId: selfPeerId,
        displayName: selfDisplayName,
        text: text.trim(),
        timestamp: Date.now(),
      });
    }

    await api.invoke("chat:send", { text: text.trim() });
  };

  return { sendMessage };
}
