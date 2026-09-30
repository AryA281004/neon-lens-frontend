import React from "react";
import { useSelector } from "react-redux";
import { useMessageStore } from "../../store/messageStore";
import {
  formatConversationTime,
  getOtherParticipant,
  getUserId,
} from "../../utils/messageUtils";

const ChatHeader = ({ conversation }) => {
  const user = useSelector((state) => state.user.user);
  const { onlineUsers } = useMessageStore();

  const currentUserId = getUserId(user);
  const otherUser = getOtherParticipant(conversation, currentUserId);
  const isOnline = otherUser?._id && onlineUsers.includes(otherUser._id);
  const isPending = conversation?.status === "pending";
  const isInitiator =
    conversation?.initiatedBy?.toString?.() === currentUserId?.toString?.();

  const lastActivity =
    conversation?.lastMessageAt || conversation?.updatedAt || conversation?.createdAt;

  return (
    <div className="border-b border-white/10 px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative">
            <img
              src={otherUser?.profilePic || "/default-avatar.png"}
              alt={otherUser?.username || "User"}
              className="h-11 w-11 rounded-full object-cover"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-black bg-green-500" />
            )}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-white">
              {otherUser?.username || "Conversation"}
            </h2>
            <p className="text-xs text-white/45">
              {isOnline ? "Active now" : lastActivity ? `Last active ${formatConversationTime(lastActivity)}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          
          <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </button>
        </div>
      </div>

      {isPending && (
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
          {isInitiator
            ? "Message request sent. You can message once they accept."
            : "This is a message request. Accept it from the requests panel to start chatting."}
        </div>
      )}
    </div>
  );
};

export default ChatHeader;