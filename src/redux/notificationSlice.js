import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messageUnreadCount: 0,
  notificationUnreadCount: 0,
  hasUnreadMessages: false,
  lastMessageNotificationAt: null,
  lastNotificationsReadAt: null,
};

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setMessageUnreadCount: (state, action) => {
      const count = Number(action.payload || 0);
      state.messageUnreadCount = Number.isFinite(count) ? count : 0;
      state.hasUnreadMessages = state.messageUnreadCount > 0;
    },
    incrementMessageUnread: (state) => {
      state.messageUnreadCount += 1;
      state.hasUnreadMessages = state.messageUnreadCount > 0;
      state.lastMessageNotificationAt = new Date().toISOString();
    },
    clearMessageUnread: (state) => {
      state.messageUnreadCount = 0;
      state.hasUnreadMessages = false;
    },
    setLastMessageNotificationAt: (state, action) => {
      state.lastMessageNotificationAt = action.payload;
    },
    setNotificationUnreadCount: (state, action) => {
      const count = Number(action.payload || 0);
      state.notificationUnreadCount = Number.isFinite(count) ? count : 0;
    },
    incrementNotificationUnread: (state) => {
      state.notificationUnreadCount += 1;
    },
    clearNotificationUnreadCount: (state) => {
      state.notificationUnreadCount = 0;
    },
    setLastNotificationsReadAt: (state, action) => {
      state.lastNotificationsReadAt = action.payload;
    },
  },
});

export const {
  setMessageUnreadCount,
  incrementMessageUnread,
  clearMessageUnread,
  setLastMessageNotificationAt,
  setNotificationUnreadCount,
  incrementNotificationUnread,
  clearNotificationUnreadCount,
  setLastNotificationsReadAt,
} = notificationSlice.actions;

export default notificationSlice.reducer;

