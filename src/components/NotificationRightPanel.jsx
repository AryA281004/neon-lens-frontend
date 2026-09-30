import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMyNotifications, markAllNotificationsRead } from "../api/api.js";
import {
  setActivityError,
  setActivityItems,
  setActivityLoading,
} from "../redux/activitySlice.js";
import { formatConversationTime, formatDayLabel } from "../utils/messageUtils";
import { connectSocket, getSocket } from "../utils/socket.js";
import {
  incrementMessageUnread,
  setNotificationUnreadCount,
  clearNotificationUnreadCount,
  setLastNotificationsReadAt,
} from "../redux/notificationSlice.js";

const PAGE_SIZE = 8;

const TYPE_COPY = {
  follow: "started following you",
  like: "liked your post",
  comment: "commented on your post",
  save: "saved your post",
  share: "shared your post",
  message: "sent you a message",
};

const TYPE_ICON = {
  follow: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </svg>
  ),
  like: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.5 2.09C12.09 5.01 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.18z" />
    </svg>
  ),
  comment: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  ),
  save: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  ),
  share: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 3.9" />
      <path d="M15.4 6.6l-6.8 3.9" />
    </svg>
  ),
  message: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16v12H5.5L4 18.5V4z" />
      <path d="M22 4l-10 8L2 4" />
    </svg>
  ),
};

function getActorName(actor) {
  const fullName = `${actor?.username || ""} `.trim();
  return fullName || actor?.username || "Unknown";
}

function getActorInitials(actor) {
  const first = actor?.firstName?.[0] || "";
  const last = actor?.lastName?.[0] || "";
  if (first || last) return `${first}${last}`.toUpperCase();
  return (actor?.username?.[0] || "U").toUpperCase();
}

function getBadgeClass(type) {
  if (type === "follow") return "bg-emerald-400/15 text-emerald-200 border-emerald-400/30";
  if (type === "like") return "bg-rose-400/15 text-rose-200 border-rose-400/30";
  if (type === "comment") return "bg-sky-400/15 text-sky-200 border-sky-400/30";
  if (type === "save") return "bg-amber-400/15 text-amber-200 border-amber-400/30";
  if (type === "share") return "bg-lime-400/15 text-lime-200 border-lime-400/30";
  if (type === "message") return "bg-violet-400/15 text-violet-200 border-violet-400/30";
  return "border-white/10";
}

const NotificationRightPanel = () => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  const activityState = useSelector((state) => state.activity);
  const items = activityState?.items || [];
  const messageUnreadCount = useSelector((state) => state.notification?.messageUnreadCount || 0);
  const notificationUnreadCount = useSelector((state) => state.notification?.notificationUnreadCount || 0);
  const hasUnreadMessages = useSelector((state) => state.notification?.hasUnreadMessages);

  const socketRef = useRef(null);

  const followersCount = user?.followers?.length ?? user?.followersCount ?? 0;
  const followingCount = user?.following?.length ?? user?.followingCount ?? 0;
  const pendingFollowRequests = user?.pendingFollowRequests?.length ?? user?.followRequests?.length ?? 0;

  const summaryCounts = useMemo(() => {
    return items.reduce(
      (summary, item) => {
        const type = item?.type;
        if (type === "like") summary.likes += 1;
        else if (type === "comment") summary.comments += 1;
        else if (type === "follow") summary.follows += 1;
        else if (type === "save") summary.saves += 1;
        else if (type === "share") summary.shares += 1;
        else summary.other += 1;
        return summary;
      },
      { likes: 0, comments: 0, follows: 0, saves: 0, shares: 0, other: 0 },
    );
  }, [items]);

  const totalNotifications = items.length + messageUnreadCount;

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) connectSocket();

    const handler = () => {
      dispatch(incrementMessageUnread());
    };

    socket.on("message:receive", handler);

    return () => {
      socket.off("message:receive", handler);
    };
  }, [dispatch, user]);

  const loadLatest = useCallback(async () => {
    if (!user) return;
    if (items.length > 0) return;

    dispatch(setActivityLoading(true));
    dispatch(setActivityError(""));

    try {
      const response = await getMyNotifications({ page: 1, limit: PAGE_SIZE });
      const nextItems = Array.isArray(response?.notifications)
        ? response.notifications
        : Array.isArray(response?.activities)
          ? response.activities
          : Array.isArray(response?.items)
            ? response.items
            : [];

      dispatch(
        setActivityItems({
          items: nextItems,
          pagination: response?.pagination || {},
        }),
      );
      dispatch(setNotificationUnreadCount(response?.unreadCount || 0));
      dispatch(setLastNotificationsReadAt(response?.lastNotificationsReadAt || null));

      if (response?.unreadCount > 0) {
        try {
          await markAllNotificationsRead();
          dispatch(clearNotificationUnreadCount());
          dispatch(setLastNotificationsReadAt(new Date().toISOString()));
        } catch (innerError) {
          console.warn("Unable to mark notifications read", innerError);
        }
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load notifications";
      dispatch(setActivityError(message));
    } finally {
      dispatch(setActivityLoading(false));
    }
  }, [dispatch, user, items.length]);

  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  const grouped = useMemo(() => {
    const groups = [];
    let current = "";

    const sorted = [...items].sort((a, b) => {
      const aTime = new Date(a?.createdAt || 0).getTime();
      const bTime = new Date(b?.createdAt || 0).getTime();
      return bTime - aTime;
    });

    for (const item of sorted) {
      const label = formatDayLabel(item?.createdAt) || "Earlier";
      if (label !== current) {
        current = label;
        groups.push({ label, items: [] });
      }
      groups[groups.length - 1].items.push(item);
    }

    return groups;
  }, [items]);

  const summaryCards = [
    {
      title: "Messages",
      value: messageUnreadCount,
      description: "Unread messages",
      badge: "✉️",
      className: "border-violet-400/20 bg-violet-400/10 text-violet-200",
    },
    {
      title: "Likes",
      value: summaryCounts.likes,
      description: "Recent likes",
      badge: "❤️",
      className: "border-rose-400/20 bg-rose-400/10 text-rose-200",
    },
    {
      title: "Comments",
      value: summaryCounts.comments,
      description: "Recent comments",
      badge: "💬",
      className: "border-sky-400/20 bg-sky-400/10 text-sky-200",
    },
    {
      title: "Follows",
      value: summaryCounts.follows,
      description: "New followers",
      badge: "🤝",
      className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    },
  ];

  const profileStats = [
    {
      label: "Following",
      value: followingCount,
      accent: "text-cyan-200",
    },
    {
      label: "Followers",
      value: followersCount,
      accent: "text-emerald-200",
    },
    {
      label: "Requests",
      value: pendingFollowRequests,
      accent: "text-amber-200",
    },
  ];

  return (
    <aside data-lenis-prevent className="w-80 h-full flex flex-col overflow-hidden  border border-white/10 p-4 rounded-[28px] ">
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-xl">
              🔔
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">Notifications</h2>
              <p className="text-xs text-white/50">
                Likes, comments, follows, requests and messages.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80">
          {totalNotifications} items
        </div>
      </div>

      <div className="grid gap-3 mb-4 sm:grid-cols-2">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className={`rounded-3xl border px-3 py-3 text-sm ${card.className} border-opacity-40 bg-opacity-10`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-white/90">{card.title}</span>
              <span className="text-lg">{card.badge}</span>
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div>
                <div className="text-2xl font-semibold text-white">{card.value}</div>
                <div className="text-[11px] text-white/50">{card.description}</div>
              </div>
              <div className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-white/70">
                now
              </div>
            </div>
          </div>
        ))}
      </div>

      {(followersCount || followingCount || pendingFollowRequests) && (
        <div className="grid gap-3 mb-4 sm:grid-cols-3">
          {profileStats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-3">
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                {stat.label}
              </div>
              <div className={`mt-2 text-2xl font-semibold ${stat.accent}`}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {hasUnreadMessages && (
        <div className="rounded-3xl border border-violet-400/20 bg-violet-400/10 p-4 text-white/90 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Unread messages</h3>
              <p className="mt-1 text-xs text-white/70">
                You have {messageUnreadCount} unread message{messageUnreadCount === 1 ? "" : "s"} waiting in chat.
              </p>
            </div>
            <span className="text-2xl">✉️</span>
          </div>
          <Link
            to="/messages"
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
          >
            View messages
          </Link>
        </div>
      )}

      <div className="overflow-y-auto flex-1 pr-1">
        {grouped.length === 0 && activityState?.isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-3xl bg-white/5 border border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
            <div className="text-white/90 font-semibold">No new notifications yet</div>
            <div className="mt-2 text-xs text-white/50">
              New activity from other users will appear here when someone likes, comments, or follows you.
            </div>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="space-y-3 mb-3 last:mb-0">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">
                {group.label}
              </div>
              <div className="space-y-3">
                {group.items.map((item) => {
                  const actor = item?.actor || {};
                  const actorName = getActorName(actor);
                  const initials = getActorInitials(actor);
                  const type = item?.type;
                  const time = formatConversationTime(item?.createdAt);

                  const commentText = item?.metadata?.text || "";
                  const targetCaption = item?.target?.caption || "";
                  const targetImage = item?.target?.image || "";

                  return (
                    <div
                      key={item?.id || `${type}-${time}-${actorName}`}
                      className="group rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl hover:bg-white/10 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          {actor?.profilePic ? (
                            <img
                              src={actor.profilePic}
                              alt={actorName}
                              className="h-11 w-11 rounded-2xl object-cover ring-1 ring-white/10"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-sm font-semibold ring-1 ring-white/10">
                              {initials}
                            </div>
                          )}
                          <div
                            className={`absolute -bottom-2 -right-2 rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.15em] ${getBadgeClass(type)}`}
                          >
                            {TYPE_ICON[type] || <span className="block h-3 w-3" />}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white/90 truncate">{actorName}</div>
                              <div className="text-xs text-white/50 truncate">{TYPE_COPY[type] || "Activity"}</div>
                            </div>
                            <div className="text-[11px] text-white/50 whitespace-nowrap">{time}</div>
                          </div>

                          {commentText ? (
                            <div className="mt-3 rounded-2xl bg-white/5 border border-white/10 p-3 text-xs text-white/60">
                              “{commentText}”
                            </div>
                          ) : targetCaption ? (
                            <div className="mt-3 text-xs text-white/40 truncate">{targetCaption}</div>
                          ) : null}
                        </div>
                      </div>

                      {targetImage ? (
                        <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                          <img
                            src={targetImage}
                            alt="Post preview"
                            className="h-20 w-full object-cover"
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default NotificationRightPanel;

