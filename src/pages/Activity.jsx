import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMyActivity } from "../api/api.js";
import {
  appendActivityItems,
  resetActivity,
  setActivityError,
  setActivityItems,
  setActivityLoading,
} from "../redux/activitySlice.js";
import { formatConversationTime, formatDayLabel } from "../utils/messageUtils";

const PAGE_SIZE = 20;

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "follow", label: "Follows" },
  { value: "like", label: "Likes" },
  { value: "comment", label: "Comments" },
  { value: "save", label: "Saves" },
  { value: "share", label: "Shares" },
];

const TYPE_COPY = {
  follow: "started following you",
  like: "liked your post",
  comment: "commented on your post",
  save: "saved your post",
  share: "shared your post",
};

const TYPE_BADGE = {
  follow: "bg-emerald-400/15 text-emerald-200 border-emerald-400/30",
  like: "bg-rose-400/15 text-rose-200 border-rose-400/30",
  comment: "bg-sky-400/15 text-sky-200 border-sky-400/30",
  save: "bg-amber-400/15 text-amber-200 border-amber-400/30",
  share: "bg-lime-400/15 text-lime-200 border-lime-400/30",
};

const getActorName = (actor) => {
  const fullName = `${actor?.username || ""} `.trim();
  return fullName || actor?.username || "Unknown";
};

const getActorInitials = (actor) => {
  const first = actor?.firstName?.[0] || "";
  const last = actor?.lastName?.[0] || "";
  if (first || last) return `${first}${last}`.toUpperCase();
  return (actor?.username?.[0] || "U").toUpperCase();
};

const ActivityIcon = ({ type }) => {
  if (type === "follow") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6" />
        <path d="M22 11h-6" />
      </svg>
    );
  }

  if (type === "comment") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
    );
  }

  if (type === "save") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    );
  }

  if (type === "share") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 3.9" />
        <path d="M15.4 6.6l-6.8 3.9" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.5 2.09C12.09 5.01 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.18z" />
    </svg>
  );
};

const Activity = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const isLoadingUser = useSelector((state) => state.user.isLoading);
  const activityState = useSelector((state) => state.activity);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);

  const loadActivity = useCallback(
    async ({ targetPage = 1, append = false } = {}) => {
      if (!append) {
        dispatch(setActivityLoading(true));
      } else {
        setLoadingMore(true);
      }

      dispatch(setActivityError(""));

      try {
        const response = await getMyActivity({ page: targetPage, limit: PAGE_SIZE });
        const items = Array.isArray(response?.activities) ? response.activities : [];
        const pagination = response?.pagination || {};

        if (append) {
          dispatch(appendActivityItems({ items, pagination }));
        } else {
          dispatch(setActivityItems({ items, pagination }));
        }
      } catch (error) {
        const message =
          error?.response?.data?.message || error?.message || "Failed to load activity";
        dispatch(setActivityError(message));
      } finally {
        if (!append) {
          dispatch(setActivityLoading(false));
        } else {
          setLoadingMore(false);
        }
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (!isLoadingUser && !user) {
      navigate("/account");
    }
  }, [isLoadingUser, user, navigate]);

  useEffect(() => {
    if (!user) {
      dispatch(resetActivity());
      return;
    }

    loadActivity({ targetPage: 1, append: false });
  }, [dispatch, loadActivity, user]);

  const handleLoadMore = () => {
    if (activityState.hasNextPage && !loadingMore) {
      loadActivity({ targetPage: activityState.page + 1, append: true });
    }
  };

  const handleRefresh = () => {
    loadActivity({ targetPage: 1, append: false });
  };

  const filteredItems = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    let items = Array.isArray(activityState.items) ? activityState.items : [];

    if (filter !== "all") {
      items = items.filter((item) => item?.type === filter);
    }

    if (searchTerm) {
      items = items.filter((item) => {
        const actor = item?.actor || {};
        const name = getActorName(actor).toLowerCase();
        const username = String(actor?.username || "").toLowerCase();
        const caption = String(item?.target?.caption || "").toLowerCase();
        const comment = String(item?.metadata?.text || "").toLowerCase();
        return (
          name.includes(searchTerm) ||
          username.includes(searchTerm) ||
          caption.includes(searchTerm) ||
          comment.includes(searchTerm)
        );
      });
    }

    return [...items].sort((a, b) => {
      const aTime = new Date(a?.createdAt || 0).getTime();
      const bTime = new Date(b?.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [activityState.items, filter, search]);

  const groupedItems = useMemo(() => {
    const groups = [];
    let currentLabel = "";

    for (const item of filteredItems) {
      const label = formatDayLabel(item?.createdAt) || "Earlier";
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ label, items: [] });
      }

      groups[groups.length - 1].items.push(item);
    }

    return groups;
  }, [filteredItems]);

  const summary = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    const counts = {
      follow: 0,
      like: 0,
      comment: 0,
      save: 0,
      share: 0,
    };

    for (const item of activityState.items || []) {
      if (!item?.createdAt) continue;
      const date = new Date(item.createdAt);
      if (Number.isNaN(date.getTime()) || date < cutoff) continue;
      if (counts[item.type] !== undefined) counts[item.type] += 1;
    }

    return counts;
  }, [activityState.items]);

  if (isLoadingUser && !user) {
    return <div className="text-white text-center py-20">Loading activity...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative w-full min-h-screen text-white">
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-amber-500/20 blur-[140px]" />

      <div className="relative mx-auto w-full max-w-6xl space-y-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.25),rgba(15,23,42,0.9)_55%)] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Pulse</p>
              <h1 className="use-font text-3xl md:text-5xl">Your Activity</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/60">
                A live trail of who is noticing your work and how your shots ripple across the community.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRefresh}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20"
                disabled={activityState.isLoading}
              >
                Refresh
              </button>
              <div className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs text-white/60">
                Last 7 days
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Object.entries(summary).map(([type, count]) => (
            <div
              key={type}
              className={`rounded-2xl border bg-white/5 p-4 backdrop-blur-xl ${
                TYPE_BADGE[type] || "border-white/10"
              }`}
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
                <ActivityIcon type={type} />
                <span>{type}</span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">{count}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition ${
                  filter === option.value
                    ? "border-white/40 bg-white/20 text-white"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search activity, names, or captions"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/40"
              />
            </div>
            <div className="text-xs text-white/40">
              {filteredItems.length} item{filteredItems.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        {activityState.error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {activityState.error}
          </div>
        )}

        {activityState.isLoading && activityState.items.length === 0 ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-24 rounded-2xl border border-white/10 bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-2xl font-semibold">No activity yet</h2>
            <p className="mt-2 text-sm text-white/60">
              When people follow you or react to your posts, it will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedItems.map((group) => (
              <div key={group.label} className="space-y-3">
                <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                  {group.label}
                </div>
                <div className="space-y-3">
                  {group.items.map((item) => {
                    const actor = item?.actor || {};
                    const actorName = getActorName(actor);
                    const badgeClass = TYPE_BADGE[item?.type] || "border-white/10";
                    const handleActorClick = () => {
                      if (!actor?.username) return;
                      if (actor.username === user?.username) {
                        navigate("/profile/me");
                      } else {
                        navigate(`/profile/${actor.username}`);
                      }
                    };

                    return (
                      <div
                        key={item?.id}
                        className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            {actor?.profilePic ? (
                              <img
                                src={actor.profilePic}
                                alt={actorName}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold">
                                {getActorInitials(actor)}
                              </div>
                            )}
                            <div
                              className={`absolute -bottom-2 -right-2 rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.15em] ${badgeClass}`}
                            >
                              <ActivityIcon type={item?.type} />
                            </div>
                          </div>
                          <div>
                            <button
                              onClick={handleActorClick}
                              className="text-left text-sm font-semibold text-white hover:text-white/80"
                            >
                              {actorName}
                            </button>
                            <p className="text-xs text-white/60">
                              {TYPE_COPY[item?.type] || "Activity"}
                            </p>
                            {item?.metadata?.text && (
                              <p className="mt-2 max-w-md text-xs text-white/50">
                                "{item.metadata.text}"
                              </p>
                            )}
                            {item?.target?.caption && (
                              <p className="mt-2 max-w-md text-xs text-white/40">
                                {item.target.caption}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {item?.target?.image && (
                            <img
                              src={item.target.image}
                              alt="Post"
                              className="h-16 w-16 rounded-2xl object-cover"
                            />
                          )}
                          <div className="text-xs text-white/50">
                            {formatConversationTime(item?.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {activityState.hasNextPage && (
          <div className="flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-xs uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20 disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
