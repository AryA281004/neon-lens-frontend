import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyNotifications, markAllNotificationsRead } from "../api/api.js";
import { connectSocket, getSocket } from "../utils/socket.js";
import {
  setNotificationUnreadCount,
  incrementNotificationUnread,
  clearNotificationUnreadCount,
  setLastNotificationsReadAt,
} from "../redux/notificationSlice.js";
import { formatConversationTime } from "../utils/messageUtils";

const TYPE_COPY = {
  follow: "started following you",
  like: "liked your post",
  comment: "commented on your post",
  save: "saved your post",
  share: "shared your post",
  message: "sent you a message",
};

const TYPE_ICON = {
  follow: "🤝",
  like: "❤️",
  comment: "💬",
  save: "🔖",
  share: "📤",
  message: "✉️",
};

const getBadgeClass = (type) => {
  if (type === "follow") return "bg-emerald-400/15 text-emerald-200";
  if (type === "like") return "bg-rose-400/15 text-rose-200";
  if (type === "comment") return "bg-sky-400/15 text-sky-200";
  if (type === "save") return "bg-amber-400/15 text-amber-200";
  if (type === "share") return "bg-lime-400/15 text-lime-200";
  if (type === "message") return "bg-violet-400/15 text-violet-200";
  return "bg-white/10 text-white/80";
};

const NotificationsPanel = () => {
  const dispatch = useDispatch();
  const notificationUnreadCount = useSelector(
    (state) => state.notification?.notificationUnreadCount || 0,
  );

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const socketRef = useRef(null);
  const markReadRef = useRef(false);

  const formatTime = (value) => {
    return formatConversationTime(value) || new Date(value).toLocaleString();
  };

  const loadNotifications = useCallback(
    async (targetPage = 1) => {
      setLoading(true);
      setError("");

      try {
        const response = await getMyNotifications({ page: targetPage, limit: 20 });
        const items = Array.isArray(response?.notifications)
          ? response.notifications
          : [];

        setNotifications((prev) => (targetPage === 1 ? items : [...prev, ...items]));
        setPage(targetPage);
        setHasNextPage(response?.pagination?.hasNextPage || false);
        dispatch(setNotificationUnreadCount(response?.unreadCount || 0));
        dispatch(setLastNotificationsReadAt(response?.lastNotificationsReadAt || null));
        markReadRef.current = true;

        if (response?.unreadCount > 0) {
          await markAllNotificationsRead();
          dispatch(clearNotificationUnreadCount());
        }
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || fetchError?.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    connectSocket();
    const socket = getSocket();
    socketRef.current = socket;

    const handleNotification = async (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      dispatch(incrementNotificationUnread());
      if (markReadRef.current) {
        try {
          await markAllNotificationsRead();
          dispatch(clearNotificationUnreadCount());
        } catch (err) {
          console.warn("Failed to mark notification read:", err);
        }
      }
    };

    socket.on("notification:new", handleNotification);

    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [dispatch]);

  useEffect(() => {
    loadNotifications(1);
  }, [loadNotifications]);

  const groupedNotifications = useMemo(() => {
    const sorted = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const groups = [];
    sorted.forEach((notification) => {
      const dateKey = new Date(notification.createdAt).toDateString();
      let group = groups.find((item) => item.dateKey === dateKey);
      if (!group) {
        group = { dateKey, items: [] };
        groups.push(group);
      }
      group.items.push(notification);
    });
    return groups;
  }, [notifications]);

  const loadMore = async () => {
    if (!hasNextPage || loading) return;
    await loadNotifications(page + 1);
  };

  return (
    <div
      data-lenis-prevent
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Notifications</h1>
          <p className="text-sm text-white/50">Real-time activity from likes, comments, follows, and messages.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80">
          {notificationUnreadCount} unread
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        {[
          { label: "New", value: notificationUnreadCount, accent: "text-violet-200" },
          { label: "Total", value: notifications.length, accent: "text-white" },
        ].map((summary) => (
          <div key={summary.label} className="rounded-3xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs uppercase tracking-[0.26em] text-white/40">{summary.label}</div>
            <div className={`mt-2 text-3xl font-semibold ${summary.accent}`}>{summary.value}</div>
          </div>
        ))}
      </div>

      <div
        data-lenis-prevent
        className="flex-1 min-h-0 overflow-y-auto pr-1 touch-pan-y overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        {loading && notifications.length === 0 ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-24 rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
            No notifications yet. New activity will appear here in real time.
          </div>
        ) : (
          groupedNotifications.map((group) => (
            <div key={group.dateKey} className="mb-4">
              <div className="mb-3 text-xs uppercase tracking-[0.28em] text-white/40">{group.dateKey}</div>
              <div className="space-y-3">
                {group.items.map((notification, index) => {
                  const actor = notification.actor || {};
                  const actorName = actor.username || `${actor.firstName || ""} ${actor.lastName || ""}`.trim() || "Someone";

                  return (
                    <div key={`${notification.type}-${notification.createdAt}-${index}`} className="rounded-3xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${getBadgeClass(notification.type)} text-sm font-semibold`}>
                          {TYPE_ICON[notification.type] || "🔔"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-white">{actorName}</div>
                              <div className="truncate text-xs text-white/50">{TYPE_COPY[notification.type] || "sent an update"}</div>
                            </div>
                            <div className="shrink-0 text-[11px] text-white/45">{formatTime(notification.createdAt)}</div>
                          </div>
                          {notification.metadata?.text ? (
                            <p className="mt-3 text-xs text-white/50">"{notification.metadata.text}"</p>
                          ) : notification.target?.caption ? (
                            <p className="mt-3 text-xs text-white/50 truncate">{notification.target.caption}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {hasNextPage && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-3xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
