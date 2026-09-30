import React from "react";
import { useSelector } from "react-redux";
import { formatMessageTime, getUserId } from "../../utils/messageUtils";

const MessageBubble = ({ message, avatarUrl, showAvatar, isGrouped }) => {
  const user = useSelector((state) => state.user.user);
  const currentUserId = getUserId(user);

  const senderId = message?.sender?._id || message?.sender;
  const isMine = senderId?.toString?.() === currentUserId?.toString?.();

  const isSeen = (message?.seenBy || []).length > 1;
  const isDelivered = (message?.deliveredTo || []).length > 1;
  const statusLabel = isSeen ? "Seen" : isDelivered ? "Delivered" : "Sent";
  const timeLabel = formatMessageTime(message?.createdAt);

  const isSharedPost = message?.type === "post" && !!message?.sharedPost;
  const sharedPost = isSharedPost ? message.sharedPost : null;
  const sharedPostAuthor = sharedPost?.author;
  const sharedPostCaption = sharedPost?.caption;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} ${isGrouped ? "mt-1" : "mt-3"}`}>
      {!isMine && showAvatar && (
        <img
          src={avatarUrl || "/default-avatar.png"}
          alt="User"
          className="mr-2 h-8 w-8 rounded-full object-cover"
        />
      )}
      <div
        className={`max-w-[72%] rounded-2xl ${isSharedPost ? "p-2" : "px-4 py-2"} ${
          isMine
            ? "rounded-br-md bg-white text-black"
            : "rounded-bl-md bg-white/8 text-white"
        }`}
      >
        {isSharedPost ? (
          <div className="space-y-2">
            <div
              className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${
                isMine ? "text-black/50" : "text-white/40"
              }`}
            >
              Shared post
            </div>

            <div
              className={`overflow-hidden rounded-xl border ${
                isMine ? "border-black/10 bg-black/5" : "border-white/10 bg-black/20"
              }`}
            >
              {sharedPost?.image && (
                <img
                  src={sharedPost.image}
                  alt={sharedPostCaption || "Shared post"}
                  className="h-44 w-full object-cover"
                />
              )}

              {(sharedPostCaption || sharedPostAuthor?.username) && (
                <div className="p-3">
                  {sharedPostAuthor?.username && (
                    <p
                      className={`text-[11px] font-semibold ${
                        isMine ? "text-black/70" : "text-white/80"
                      }`}
                    >
                      @{sharedPostAuthor.username}
                    </p>
                  )}
                  {sharedPostCaption && (
                    <p
                      className={`mt-1 text-xs leading-relaxed ${
                        isMine ? "text-black/70" : "text-white/70"
                      } line-clamp-2`}
                    >
                      {sharedPostCaption}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed">{message?.text}</p>
        )}

        <div
          className={`mt-1 flex items-center gap-1 text-[10px] ${
            isMine ? "justify-end text-black/50" : "justify-end text-white/35"
          }`}
        >
          <span>{timeLabel}</span>

          {isMine && (
            <span>
              {isSeen ? "✓✓" : isDelivered ? "✓✓" : "✓"} {statusLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;