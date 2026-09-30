import React from "react";
import { useSelector } from "react-redux";
import { useMessageStore } from "../../store/messageStore";
import { formatConversationTime, getOtherParticipant, getUserId } from "../../utils/messageUtils";

const RequestList = ({ requests }) => {
  const { acceptConversation, rejectConversation } = useMessageStore();
  const user = useSelector((state) => state.user.user);
  const currentUserId = getUserId(user);

  return (
    <div className="border-b border-white/10 px-3 py-3">
      <div className="mb-3 flex items-center justify-between px-2">
        <h3 className="text-sm font-medium text-white">Requests</h3>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/60">
          {requests.length}
        </span>
      </div>

      <div className="space-y-2">
        {requests.map((conversation) => {
          const otherUser = getOtherParticipant(conversation, currentUserId);
          const lastTime = formatConversationTime(
            conversation?.lastMessageAt || conversation?.updatedAt || conversation?.createdAt
          );

          return (
            <div
              key={conversation._id}
              className="rounded-2xl border border-white/8 bg-white/5 p-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={otherUser?.profilePic || "/default-avatar.png"}
                  alt={otherUser?.username}
                  className="h-11 w-11 rounded-full object-cover"
                />

                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-medium text-white">
                    {otherUser?.username}
                  </h4>
                  <p className="truncate text-xs text-white/45">
                    {conversation?.lastMessage || "Sent you a message request"}
                  </p>
                </div>

                <span className="text-[11px] text-white/35">{lastTime}</span>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => acceptConversation(conversation._id)}
                  className="flex-1 rounded-xl bg-white px-3 py-2 text-xs font-medium text-black transition hover:opacity-90"
                >
                  Accept
                </button>
                <button
                  onClick={() => rejectConversation(conversation._id)}
                  className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/5"
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RequestList;