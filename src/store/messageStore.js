import { create } from "zustand";
import axios from "axios";
import { getSocket } from "../utils/socket";

const API_BASE = "http://localhost:3000/api";

export const useMessageStore = create((set, get) => ({
  // =========================
  // STATE
  // =========================
  conversations: [],
  activeConversation: null,
  messages: [],
  onlineUsers: [],
  loading: false,
  messagesLoading: false,
  messagesError: null,
  currentUserId: null,
  conversationScrollPositions: {},

  setCurrentUserId: (userId) => {
    set({ currentUserId: userId });
  },

  // =========================
  // CONVERSATIONS
  // =========================
  fetchConversations: async () => {
    try {
      set({ loading: true });

      const { data } = await axios.get(`${API_BASE}/conversations`, {
        withCredentials: true,
      });

      set({
        conversations: data,
        loading: false,
      });
    } catch (error) {
      console.error("Fetch conversations failed:", error);
      set({ loading: false });
    }
  },

  createOrGetConversation: async (targetUserId) => {
    try {
      const { data } = await axios.post(
        `${API_BASE}/conversations`,
        { targetUserId },
        { withCredentials: true }
      );

      // add to conversation list if missing
      set((state) => {
        const exists = state.conversations.find((c) => c._id === data._id);

        return {
          conversations: exists ? state.conversations : [data, ...state.conversations],
        };
      });

      // ensure we properly join the conversation room and load messages
      // by using the canonical setActiveConversation flow
      if (get().setActiveConversation) {
        await get().setActiveConversation(data);
      } else {
        // fallback: set activeConversation directly
        set({ activeConversation: data });
      }

      return data;
    } catch (error) {
      console.error("Create conversation failed:", error);
      return null;
    }
  },

  setActiveConversation: async (conversation) => {
    const socket = getSocket();

    const prev = get().activeConversation;
    if (prev?._id) {
      socket.emit("leave-conversation", prev._id);
    }

    socket.emit("join-conversation", conversation._id);

    set({
      activeConversation: conversation,
      messages: [],
      messagesLoading: true,
      messagesError: null,
    });

    await get().fetchMessages(conversation._id);
    get().markConversationSeen(conversation._id);
  },

  acceptConversation: async (conversationId) => {
    try {
      await axios.patch(
        `${API_BASE}/conversations/${conversationId}/accept`,
        {},
        { withCredentials: true }
      );

      set((state) => ({
        conversations: state.conversations.map((c) =>
          c._id === conversationId ? { ...c, status: "active" } : c
        ),
      }));
    } catch (error) {
      console.error("Accept conversation failed:", error);
    }
  },

  rejectConversation: async (conversationId) => {
    try {
      await axios.delete(`${API_BASE}/conversations/${conversationId}`, {
        withCredentials: true,
      });

      set((state) => ({
        conversations: state.conversations.filter((c) => c._id !== conversationId),
      }));
    } catch (error) {
      console.error("Reject conversation failed:", error);
    }
  },

  // =========================
  // MESSAGES
  // =========================
  fetchMessages: async (conversationId) => {
    try {
      set({ messagesLoading: true, messagesError: null });
      const { data } = await axios.get(`${API_BASE}/messages/${conversationId}`, {
        withCredentials: true,
      });

      set({ messages: data, messagesLoading: false });
    } catch (error) {
      console.error("Fetch messages failed:", error);
      set({ messagesLoading: false, messagesError: "Failed to load messages" });
    }
  },

  sendMessage: (text) => {
    const { activeConversation } = get();
    if (!activeConversation || !text?.trim()) return;

    const socket = getSocket();

    socket.emit("message:send", {
      conversationId: activeConversation._id,
      text,
    });
  },

  markConversationSeen: (conversationId) => {
    const socket = getSocket();
    socket.emit("conversation:seen", { conversationId });

    const currentUserId = get().currentUserId;
    if (currentUserId) {
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c._id === conversationId
            ? {
                ...c,
                unreadCount: {
                  ...(c.unreadCount || {}),
                  [currentUserId]: 0,
                },
                myUnreadCount: 0,
              }
            : c
        ),
      }));
    }
  },

  setConversationScrollPosition: (conversationId, scrollTop) => {
    if (!conversationId) return;
    set((state) => ({
      conversationScrollPositions: {
        ...state.conversationScrollPositions,
        [conversationId]: scrollTop,
      },
    }));
  },

  // =========================
  // SOCKET LISTENERS
  // =========================
  initSocketListeners: () => {
    const socket = getSocket();

    socket.off("presence:init");
    socket.off("user:online");
    socket.off("user:offline");
    socket.off("message:receive");
    socket.off("message:delivered-update");
    socket.off("conversation:seen-update");

    socket.on("presence:init", ({ onlineUsers }) => {
      set({ onlineUsers });
    });

    socket.on("user:online", ({ userId }) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.includes(userId)
          ? state.onlineUsers
          : [...state.onlineUsers, userId],
      }));
    });

    socket.on("user:offline", ({ userId }) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.filter((id) => id !== userId),
      }));
    });

    socket.on("message:receive", (message) => {
      const { activeConversation, currentUserId } = get();
      const senderId = message?.sender?._id || message?.sender;
      const isMine =
        currentUserId && senderId?.toString?.() === currentUserId?.toString?.();

      // add to current chat
      if (activeConversation?._id === message.conversation) {
        set((state) => ({
          messages: [...state.messages, message],
        }));

        get().markConversationSeen(message.conversation);
      }

      // update conversation preview
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c._id === message.conversation
            ? {
                ...c,
                lastMessage: message.text,
                lastMessageSender: message.sender,
                lastMessageAt: message.createdAt,
                unreadCount: currentUserId
                  ? {
                      ...(c.unreadCount || {}),
                      [currentUserId]: isMine
                        ? c?.unreadCount?.[currentUserId] || 0
                        : activeConversation?._id === message.conversation
                          ? 0
                          : (c?.unreadCount?.[currentUserId] || 0) + 1,
                    }
                  : c.unreadCount,
              }
            : c
        ),
      }));
    });

    socket.on("message:delivered-update", ({ messageId, userId }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId
            ? {
                ...m,
                deliveredTo: [...new Set([...(m.deliveredTo || []), userId])],
              }
            : m
        ),
      }));
    });

    socket.on("conversation:seen-update", ({ userId }) => {
      set((state) => ({
        messages: state.messages.map((m) => ({
          ...m,
          seenBy: [...new Set([...(m.seenBy || []), userId])],
        })),
      }));
    });
  },

  cleanupSocketListeners: () => {
    const socket = getSocket();

    socket.off("presence:init");
    socket.off("user:online");
    socket.off("user:offline");
    socket.off("message:receive");
    socket.off("message:delivered-update");
    socket.off("conversation:seen-update");
  },
}));