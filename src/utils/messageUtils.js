const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getUserId = (user) => user?._id || user?.id || null;

export const getOtherParticipant = (conversation, currentUserId) => {
  if (conversation?.otherUser) return conversation.otherUser;
  const participants = conversation?.participants || [];
  if (!participants.length) return null;
  if (!currentUserId) return participants[0];
  return (
    participants.find((p) => p?._id?.toString() !== currentUserId?.toString()) ||
    participants[0]
  );
};

export const getUnreadCount = (conversation, currentUserId) => {
  if (conversation?.myUnreadCount !== undefined && conversation?.myUnreadCount !== null) {
    return conversation.myUnreadCount;
  }

  const unread = conversation?.unreadCount;
  if (!unread || !currentUserId) return 0;

  if (typeof unread.get === "function") {
    return unread.get(currentUserId) || 0;
  }

  return unread[currentUserId] || 0;
};

export const isSameDay = (a, b) => {
  const dateA = toDate(a);
  const dateB = toDate(b);
  if (!dateA || !dateB) return false;
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

export const formatMessageTime = (value) => {
  const date = toDate(value);
  if (!date) return "";

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatConversationTime = (value) => {
  const date = toDate(value);
  if (!date) return "";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((startOfToday - startOfDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return formatMessageTime(date);
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatDayLabel = (value) => {
  const date = toDate(value);
  if (!date) return "";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((startOfToday - startOfDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
};
