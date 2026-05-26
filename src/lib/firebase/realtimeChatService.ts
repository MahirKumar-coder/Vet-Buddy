import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  off,
  push,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";
import { realtimeDb } from "@/firebase/firebase";

export interface Chat {
  id?: string;
  customerId: string;
  customerName: string;
  adminId?: string;
  messages?: ChatMessage[];
  status: "open" | "closed";
  createdAt?: number;
  updatedAt?: number;
}

export interface ChatMessage {
  id?: string;
  sender: "customer" | "admin";
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
  isRead?: boolean;
}

// Create new chat
export const createChat = async (chat: Chat): Promise<string> => {
  try {
    const chatsRef = ref(realtimeDb, "chats");
    const newChatRef = push(chatsRef);
    await set(newChatRef, {
      ...chat,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return newChatRef.key!;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

// Send message
export const sendMessage = async (
  chatId: string,
  message: ChatMessage
): Promise<string> => {
  try {
    const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, {
      ...message,
      timestamp: Date.now(),
    });

    // Update chat timestamp
    await update(ref(realtimeDb, `chats/${chatId}`), {
      updatedAt: Date.now(),
    });

    return newMessageRef.key!;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Get chat
export const getChat = async (chatId: string): Promise<Chat | null> => {
  try {
    const chatRef = ref(realtimeDb, `chats/${chatId}`);
    const snapshot = await get(chatRef);
    if (snapshot.exists()) {
      return { id: chatId, ...snapshot.val() } as Chat;
    }
    return null;
  } catch (error) {
    console.error("Error fetching chat:", error);
    throw error;
  }
};

// Listen to chat in real-time
export const listenToChat = (
  chatId: string,
  callback: (chat: Chat | null) => void
): (() => void) => {
  const chatRef = ref(realtimeDb, `chats/${chatId}`);
  onValue(chatRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: chatId, ...snapshot.val() } as Chat);
    } else {
      callback(null);
    }
  });

  return () => off(chatRef);
};

// Listen to messages in real-time
export const listenToMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);
  onValue(messagesRef, (snapshot) => {
    if (snapshot.exists()) {
      const messages = Object.values(snapshot.val()) as ChatMessage[];
      callback(messages);
    } else {
      callback([]);
    }
  });

  return () => off(messagesRef);
};

// Get all chats for customer
export const getCustomerChats = async (customerId: string): Promise<Chat[]> => {
  try {
    const chatsRef = ref(realtimeDb, "chats");
    const snapshot = await get(chatsRef);
    if (snapshot.exists()) {
      const allChats = snapshot.val();
      return Object.entries(allChats)
        .filter(([, chat]: [string, any]) => chat.customerId === customerId)
        .map(([id, chat]: [string, any]) => ({ id, ...chat } as Chat));
    }
    return [];
  } catch (error) {
    console.error("Error fetching customer chats:", error);
    throw error;
  }
};

// Update chat status
export const updateChatStatus = async (
  chatId: string,
  status: Chat["status"]
): Promise<void> => {
  try {
    await update(ref(realtimeDb, `chats/${chatId}`), {
      status,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Error updating chat status:", error);
    throw error;
  }
};

// Close chat
export const closeChat = async (chatId: string): Promise<void> => {
  try {
    await update(ref(realtimeDb, `chats/${chatId}`), {
      status: "closed",
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Error closing chat:", error);
    throw error;
  }
};

// Delete chat
export const deleteChat = async (chatId: string): Promise<void> => {
  try {
    await remove(ref(realtimeDb, `chats/${chatId}`));
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
};
