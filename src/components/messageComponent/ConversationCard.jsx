import React from "react";
import { useSelector } from "react-redux";
import { useMessageStore } from "../../store/messageStore";
import {
  formatConversationTime,
  getOtherParticipant,
  getUnreadCount,
  getUserId,
} from "../../utils/messageUtils";

const ConversationCard = ({ conversation }) => {
  const {
    activeConversation,
    setActiveConversation,
    onlineUsers,
  } = useMessageStore();
  const user = useSelector((state) => state.user.user);
  const currentUserId = getUserId(user);

  const otherUser = getOtherParticipant(conversation, currentUserId);
  const unreadCount = getUnreadCount(conversation, currentUserId);
  const isActive = activeConversation?._id === conversation._id;
  const isOnline = onlineUsers.includes(otherUser?._id);

  const lastMessageSenderId =
    conversation?.lastMessageSender?._id || conversation?.lastMessageSender;
  const isLastFromMe =
    currentUserId &&
    lastMessageSenderId?.toString?.() === currentUserId?.toString?.();
  const lastMessageText = conversation?.lastMessage || "Start conversation";
  const lastMessageLabel = isLastFromMe
    ? `You: ${lastMessageText}`
    : lastMessageText;
  const lastMessageTime = formatConversationTime(
    conversation?.lastMessageAt || conversation?.updatedAt || conversation?.createdAt
  );

  return (
    <button
      onClick={() => setActiveConversation(conversation)}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
        isActive
          ? "bg-white/10"
          : "hover:bg-white/5"
      }`}
    >
      <div className="relative">
        <img
          src={otherUser?.profilePic || "/default-avatar.png"}
          alt={otherUser?.username}
          className="h-12 w-12 rounded-full object-cover"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-black bg-green-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-medium text-white">
            {otherUser?.username}
          </h3>
          <span className="shrink-0 text-[11px] text-white/35">
            {lastMessageTime}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-white/45">
            {lastMessageLabel}
          </p>

          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-black px-1.5">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ConversationCard;