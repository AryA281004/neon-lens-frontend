import React from "react";
import { useSelector } from "react-redux";
import ConversationCard from "./ConversationCard";
import RequestList from "./RequestList";
import { useMessageStore } from "../../store/messageStore";
import { getOtherParticipant, getUserId } from "../../utils/messageUtils";
import { getFollowers, getFollowing } from "../../api/api";

const ConversationSidebar = () => {
  const { conversations, loading, createOrGetConversation } = useMessageStore();
  const user = useSelector((state) => state.user.user);
  const currentUserId = getUserId(user);
  const [search, setSearch] = React.useState("");

  const activeChats = conversations.filter((c) => c.status === "active");
  const requests = conversations.filter((c) => c.status === "pending");

  const filteredActiveChats = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    const sorted = [...activeChats].sort((a, b) => {
      const dateA = new Date(a.lastMessageAt || a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.lastMessageAt || b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    if (!query) return sorted;

    return sorted.filter((conversation) => {
      const otherUser = getOtherParticipant(conversation, currentUserId);
      const name = otherUser?.username?.toLowerCase() || "";
      const lastMessage = conversation?.lastMessage?.toLowerCase() || "";
      return name.includes(query) || lastMessage.includes(query);
    });
  }, [activeChats, search, currentUserId]);

  // ---- followers/following search data
  const [followersList, setFollowersList] = React.useState([]);
  const [followingList, setFollowingList] = React.useState([]);
  const [peopleLoading, setPeopleLoading] = React.useState(false);
  const [peopleError, setPeopleError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    const fetchLists = async () => {
      if (!currentUserId) return;
      setPeopleLoading(true);
      setPeopleError(null);

      try {
        const [fRes, followingRes] = await Promise.all([
          getFollowers(currentUserId, 1, 500).catch(() => ({ followers: [] })),
          getFollowing(currentUserId, 1, 500).catch(() => ({ following: [] })),
        ]);

        if (!mounted) return;

        setFollowersList(Array.isArray(fRes?.followers) ? fRes.followers : []);
        setFollowingList(Array.isArray(followingRes?.following) ? followingRes.following : []);
      } catch (err) {
        if (!mounted) return;
        setPeopleError(err?.message || "Failed to load lists");
      } finally {
        if (mounted) setPeopleLoading(false);
      }
    };

    fetchLists();
    return () => {
      mounted = false;
    };
  }, [currentUserId]);

  const combinedPeople = React.useMemo(() => {
    const map = new Map();
    [...(followersList || []), ...(followingList || [])].forEach((u) => {
      const id = String(u?._id || u?.id || u?.username || Math.random());
      if (!map.has(id)) map.set(id, u);
    });
    return Array.from(map.values());
  }, [followersList, followingList]);

  const peopleMatches = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return combinedPeople.filter((u) => {
      const username = String(u?.username || "").toLowerCase();
      const name = `${u?.firstName || ""} ${u?.lastName || ""}`.toLowerCase();
      return username.includes(q) || name.includes(q);
    });
  }, [combinedPeople, search]);

  return (
    <div
      data-lenis-prevent
      className="flex h-full min-h-0 flex-col touch-pan-y"
      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
    >
      {/* Header */}
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">Messages</h2>
        <p className="text-sm text-white/45">
          Conversations, requests, and active chats
        </p>
      </div>

      <div className="px-5 pt-4">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-white/35"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={search}
            onChange={(event) => 
                setSearch(event.target.value)
                
            }
            placeholder="Search conversations"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Requests */}
      {requests.length > 0 && <RequestList requests={requests} />}

      {/* Conversations */}
      <div
        data-lenis-prevent
        className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-2 py-2 touch-pan-y overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        <div className="mb-2 flex items-center justify-between px-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
            {search.trim() ? "People" : "Active"}
          </h3>
          <span className="text-[11px] text-white/35">
            {search.trim() ? peopleMatches.length : filteredActiveChats.length}
          </span>
        </div>

        {search.trim() ? (
          peopleLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-white/50">
              Searching people...
            </div>
          ) : peopleMatches.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-white/50">
              No matches found
            </div>
          ) : (
            <div className="space-y-1">
              {peopleMatches.map((userEntry) => {
                const id = String(userEntry?._id || userEntry?.id || userEntry?.username);
                if (!id || id === String(currentUserId)) return null;

                return (
                  <button
                    key={id}
                    onClick={async () => {
                      await createOrGetConversation(id);
                      setSearch("");
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/5"
                  >
                    <img
                      src={userEntry?.profilePic || "/default-avatar.png"}
                      alt={userEntry?.username}
                      className="h-10 w-10 rounded-full object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="truncate text-sm font-medium text-white">
                          {userEntry?.username}
                        </h4>
                        <span className="shrink-0 text-[11px] text-white/35">
                          {userEntry?.followersCount ? `${userEntry.followersCount}f` : ""}
                        </span>
                      </div>
                      <p className="truncate text-xs text-white/45">
                        {`${userEntry?.firstName || ""} ${userEntry?.lastName || ""}`.trim() || "@" + (userEntry?.username || "")}
                      </p>
                    </div>
                    <div className="text-xs text-white/40">Message</div>
                  </button>
                );
              })}
            </div>
          )
        ) : loading ? (
          <div className="flex h-full items-center justify-center text-sm text-white/50">
            Loading conversations...
          </div>
        ) : filteredActiveChats.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-white/50">
            {"No conversations yet"}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredActiveChats.map((conversation) => (
              <ConversationCard
                key={conversation._id}
                conversation={conversation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationSidebar;