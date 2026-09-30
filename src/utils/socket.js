import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
      autoConnect: false, // 🔥 important for control
    });

    // =========================
    // 🔌 CONNECTION EVENTS
    // =========================
    socketInstance.on("connect", () => {
      console.log("🟢 Socket connected:", socketInstance.id);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
    });

    // =========================
    // 🟢 PRESENCE EVENTS
    // =========================
    socketInstance.on("presence:init", ({ onlineUsers }) => {
      console.log("Online users:", onlineUsers);
      // 👉 store in state (Redux / Zustand / Context)
    });

    socketInstance.on("user:online", ({ userId }) => {
      console.log("User online:", userId);
    });

    socketInstance.on("user:offline", ({ userId }) => {
      console.log("User offline:", userId);
    });

    // =========================
    // 💬 MESSAGING EVENTS
    // =========================
    socketInstance.on("message:receive", (message) => {
      console.log("New message:", message);
    });

    socketInstance.on("message:delivered-update", (data) => {
      console.log("Delivered update:", data);
    });

    socketInstance.on("conversation:seen-update", (data) => {
      console.log("Seen update:", data);
    });

    socketInstance.on("notification:new", (notification) => {
      console.log("Notification event:", notification);
    });

    socketInstance.on("error", (err) => {
      console.error("Socket error event:", err);
    });
  }

  return socketInstance;
};


// 🔥 manual connect (call after login)
export const connectSocket = () => {
  const socket = getSocket();
  if (!socket.connected) socket.connect();
};

// 🔥 manual disconnect (call on logout)
export const disconnectSocket = () => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.disconnect();
  }
};