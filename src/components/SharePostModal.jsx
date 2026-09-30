import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getFollowers, getFollowing, sharePost } from "../api/api.js";
import { lockScroll, unlockScroll } from "../utils/scrollLock"

const SharePostModal = ({ post, onClose, onShared }) => {
  const currentUser = useSelector((state) => state.user.user);
  const currentUserId = currentUser?._id || currentUser?.id;

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState(new Set());
  const [activeTab, setActiveTab] = useState("followers");
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  const selectedCount = selectedRecipients.size;

  const recipients = useMemo(() => {
    return activeTab === "followers" ? followers : following;
  }, [activeTab, followers, following]);

  useEffect(() => {
    if (!currentUserId) return;

    const loadPeople = async () => {
      setIsLoading(true);
      try {
        const [followersResponse, followingResponse] = await Promise.all([
          getFollowers(currentUserId),
          getFollowing(currentUserId),
        ]);

        setFollowers(Array.isArray(followersResponse?.followers) ? followersResponse.followers : []);
        setFollowing(Array.isArray(followingResponse?.following) ? followingResponse.following : []);
      } catch (error) {
        console.error("Error loading share recipients:", error);
        toast.error("Unable to load followers or following right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPeople();
  }, [currentUserId]);

  useEffect(() => {
    lockScroll()
    return () => {
      unlockScroll()
    }
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const hasRecipients = selectedCount > 0;

  const toggleRecipient = (recipientId) => {
    setSelectedRecipients((prev) => {
      const next = new Set(prev);
      if (next.has(recipientId)) {
        next.delete(recipientId);
      } else {
        next.add(recipientId);
      }
      return next;
    });
  };

  const selectAll = () => {
    const ids = recipients.map((user) => user?._id || user?.id).filter(Boolean);
    setSelectedRecipients((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedRecipients(new Set());
  };

  const handleShare = async (event) => {
    event.preventDefault();
    if (!post?._id) return;

    if (selectedCount === 0) {
      toast.error("Select at least one recipient.");
      return;
    }

    setIsSharing(true);
    try {
      const response = await sharePost(post._id, Array.from(selectedRecipients));
      toast.success(response?.message || "Post shared successfully");
      onShared?.(response);
      onClose?.();
    } catch (error) {
      console.error("Share post error:", error);
      toast.error(error?.message || "Failed to share post");
    } finally {
      setIsSharing(false);
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Share post"
      onMouseDown={handleOverlayClick}
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0f1525] shadow-[0_26px_60px_rgba(0,0,0,0.55)]">
        <div className="border-b border-white/10 px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Send to</h2>
              <p className="text-sm text-gray-400">Share this post with your followers or people you follow.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10"
              aria-label="Close share modal"
            >
              Close
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[auto,1fr] items-center">
            <img
              src={post?.image || "https://via.placeholder.com/120"}
              alt={post?.caption || "Post preview"}
              className="h-24 w-24 rounded-3xl object-cover border border-white/10"
            />
            <div className="min-w-0">
              <p className="text-sm text-white line-clamp-2">{post?.caption || "No caption"}</p>
              <p className="mt-2 text-xs text-gray-500">{post?.author?.username ? `@${post.author.username}` : "Unknown author"}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 sm:px-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("followers")}
              className={`rounded-full px-4 py-2 text-sm transition ${activeTab === "followers" ? "bg-cyan-400 text-black" : "bg-white/5 text-white hover:bg-white/10"}`}
            >
              Followers ({followers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("following")}
              className={`rounded-full px-4 py-2 text-sm transition ${activeTab === "following" ? "bg-cyan-400 text-black" : "bg-white/5 text-white hover:bg-white/10"}`}
            >
              Following ({following.length})
            </button>
            <button
              type="button"
              onClick={selectAll}
              className="rounded-full bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-full bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              Clear
            </button>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
            {isLoading ? (
              <p className="text-sm text-gray-400">Loading recipients…</p>
            ) : recipients.length === 0 ? (
              <p className="text-sm text-gray-400">No {activeTab} available to share with.</p>
            ) : (
              <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                {recipients.map((user) => {
                  const userId = user?._id || user?.id;
                  const isSelected = selectedRecipients.has(userId);
                  return (
                    <button
                      type="button"
                      key={userId}
                      onClick={() => toggleRecipient(userId)}
                      className={`flex w-full items-center gap-3 rounded-3xl border px-3 py-3 text-left transition ${isSelected ? "border-cyan-400 bg-cyan-500/15" : "border-white/10 bg-[#0f1525] hover:border-white/20 hover:bg-white/5"}`}
                    >
                      <img
                        src={user?.profilePic || "https://via.placeholder.com/40"}
                        alt={user?.username || "user"}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.username || "Unknown"}</p>
                        <p className="text-xs text-gray-400 truncate">{[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "No name"}</p>
                      </div>
                      <div className={`ml-auto flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition ${isSelected ? "border-cyan-300 bg-cyan-400 text-black" : "border-white/10 text-gray-400"}`}>
                        {isSelected ? "✓" : "+"}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 bg-[#090d18] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm text-gray-300">{selectedCount} selected</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-transparent px-4 py-2 text-sm text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={!hasRecipients || isSharing}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${hasRecipients ? "bg-cyan-400 text-black hover:bg-cyan-300" : "bg-white/10 text-white/50 cursor-not-allowed"}`}
            >
              {isSharing ? "Sending…" : `Send (${selectedCount})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePostModal;
