import React from "react";
import { useSelector } from "react-redux";
import MessageBubble from "./MessageBubble";
import { useMessageStore } from "../../store/messageStore";
import { getSocket } from "../../utils/socket";
import {
  formatDayLabel,
  getOtherParticipant,
  getUserId,
  isSameDay,
} from "../../utils/messageUtils";

const MessageList = () => {
  const {
    messages,
    activeConversation,
    messagesLoading,
    messagesError,
  } = useMessageStore();
  const user = useSelector((state) => state.user.user);
  const currentUserId = getUserId(user);
  const otherUser = getOtherParticipant(activeConversation, currentUserId);
  const scrollContainerRef = React.useRef(null);
  const bottomRef = React.useRef(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = React.useState(false);

  const isNearBottom = (container) => {
    if (!container) return false;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 50;
  };

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !activeConversation) return;

    setAutoScrollEnabled(isNearBottom(container));
  }, [messages, activeConversation]);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !activeConversation) return;

    if (autoScrollEnabled) {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages, activeConversation, autoScrollEnabled]);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !activeConversation?._id) return;

    const handleScroll = () => {
      setAutoScrollEnabled(isNearBottom(container));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeConversation?._id]);

  React.useEffect(() => {
    if (!currentUserId) return;
    const socket = getSocket();

    messages.forEach((message) => {
      const senderId = message?.sender?._id || message?.sender;
      const deliveredTo = message?.deliveredTo || [];

      if (
        senderId?.toString?.() !== currentUserId?.toString?.() &&
        !deliveredTo.includes(currentUserId)
      ) {
        socket.emit("message:delivered", { messageId: message._id });
      }
    });
  }, [messages, currentUserId]);

  return (
    <div
      ref={scrollContainerRef}
      data-lenis-prevent
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar px-4 py-4 touch-pan-y overscroll-contain"
      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
    >
      {messagesLoading ? (
        <div className="flex h-full items-center justify-center text-sm text-white/45">
          Loading messages...
        </div>
      ) : messagesError ? (
        <div className="flex h-full items-center justify-center text-sm text-white/45">
          {messagesError}
        </div>
      ) : messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-white/45">
          {activeConversation
            ? "No messages yet. Say hello!"
            : "Select a conversation to start chatting"}
        </div>
      ) : (
        <div className="space-y-2" data-lenis-prevent="true">
          {messages.map((message, index) => {
            const prev = messages[index - 1];
            const showDaySeparator =
              !prev || !isSameDay(message?.createdAt, prev?.createdAt);
            const senderId = message?.sender?._id || message?.sender;
            const prevSenderId = prev?.sender?._id || prev?.sender;
            const isGrouped =
              !showDaySeparator &&
              senderId?.toString?.() === prevSenderId?.toString?.();
            const isMine =
              currentUserId &&
              senderId?.toString?.() === currentUserId?.toString?.();

            return (
              <React.Fragment key={message._id}>
                {showDaySeparator && (
                  <div className="my-4 flex items-center justify-center">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/35">
                      {formatDayLabel(message?.createdAt)}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={message}
                  avatarUrl={otherUser?.profilePic}
                  showAvatar={!isMine && !isGrouped}
                  isGrouped={isGrouped}
                />
              </React.Fragment>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;