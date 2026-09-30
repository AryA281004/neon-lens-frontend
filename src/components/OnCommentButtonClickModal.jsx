import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { addComment } from "../api/api.js";
import { lockScroll, unlockScroll } from "../utils/scrollLock"

const getCommenter = (comment) => {
    const commenter = comment?.commenterId;

    if (!commenter) {
        return {
            username: "user",
            profilePic: "",
        };
    }

    if (typeof commenter === "object") {
        return {
            username: commenter.username || "user",
            profilePic: commenter.profilePic || "",
        };
    }

    return {
        username: "user",
        profilePic: "",
    };
};

const formatPostDate = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const OnCommentButtonClickModal = ({ post, onCommentAdded, onClose }) => {
    const currentUser = useSelector((state) => state.user.user);

    const [commentText, setCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [comments, setComments] = useState(Array.isArray(post?.comments) ? post.comments : []);
    const inputRef = useRef(null);

    const postDate = useMemo(() => formatPostDate(post?.createdAt), [post?.createdAt]);

    useEffect(() => {
        setComments(Array.isArray(post?.comments) ? post.comments : []);
    }, [post?._id, post?.comments]);

    useEffect(() => {
        lockScroll()

        return () => {
            unlockScroll()
        }
    }, []);

    useEffect(() => {
        inputRef.current?.focus();
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

    const handleOverlayMouseDown = (event) => {
        if (event.target === event.currentTarget) {
            onClose?.();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!commentText.trim() || !post?._id) return;

        setIsSubmitting(true);
        try {
            const response = await addComment(post._id, commentText.trim());
            const incomingComment = response?.comment || response;

            const normalizedComment = incomingComment?.commenterId
                ? incomingComment
                : {
                        ...incomingComment,
                        commenterId: {
                            _id: currentUser?._id || currentUser?.id,
                            username: currentUser?.username || "you",
                            profilePic: currentUser?.profilePic || "",
                        },
                    };

            setComments((prev) => [...prev, normalizedComment]);
            setCommentText("");
            onCommentAdded?.(normalizedComment);
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setIsSubmitting(false);
            inputRef.current?.focus();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center"
            onMouseDown={handleOverlayMouseDown}
            role="dialog"
            aria-modal="true"
            aria-label="Comments"
        >
            <div className="relative w-full max-w-4xl h-[92vh] max-h-[92vh] min-h-0 bg-[#0b1020] border border-cyan-400/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-white/2">
                    <div>
                        <h2 className="text-white font-semibold text-base sm:text-lg">Post discussion</h2>
                        <p className="text-xs text-gray-400">Talk about this capture with the community</p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-white/80 hover:text-white text-xl"
                        aria-label="Close comments modal"
                    >
                        ✕
                    </button>
                </div>

                <div className="px-4 sm:px-6 py-4 border-b border-white/10">
                    <div className="flex gap-4">
                        <img
                            src={post?.image}
                            alt={post?.caption || "post"}
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-white/10"
                        />

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3">
                                <img
                                    src={post?.author?.profilePic || "https://via.placeholder.com/40"}
                                    alt={post?.author?.username || "author"}
                                    className="w-9 h-9 rounded-full object-cover"
                                />
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-semibold truncate">{post?.author?.username}</p>
                                    {post?.location && <p className="text-xs text-gray-400 truncate">📍 {post.location}</p>}
                                </div>
                            </div>

                            {post?.caption ? (
                                <p className="text-sm text-gray-200 leading-relaxed mt-3 line-clamp-3">{post.caption}</p>
                            ) : (
                                <p className="text-sm text-gray-400 mt-3">No caption</p>
                            )}

                            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                                <span className="px-2 py-1 rounded-full bg-white/5">❤️ {post?.likes?.length || 0} likes</span>
                                {postDate && <span>{postDate}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar px-4 sm:px-6 py-4 space-y-3"
                    data-lenis-prevent
                    onWheelCapture={(e) => e.stopPropagation()}
                    onTouchMoveCapture={(e) => e.stopPropagation()}
                >
                    {comments.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center mt-6">No comments yet. Be the first one ✨</p>
                    ) : (
                        comments.map((comment, index) => {
                            const commenter = getCommenter(comment);

                            return (
                                <div key={comment?._id || `${comment?.createdAt || "comment"}-${index}`} className="flex items-start gap-3">
                                    <img
                                        src={commenter.profilePic || "https://via.placeholder.com/32"}
                                        alt={commenter.username}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <div className="rounded-xl border border-white/10 bg-white/2 px-3 py-2">
                                            <p className="text-sm text-gray-100 wrap-break-word leading-relaxed">
                                                <span className="font-semibold text-white mr-1">{commenter.username}</span>
                                                {comment?.text}
                                            </p>
                                        </div>
                                        <p className="text-[11px] text-gray-500 mt-1 ml-1">{formatPostDate(comment?.createdAt)}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="border-t border-white/10 px-4 sm:px-6 py-4 bg-black/20">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/2 px-3 py-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
                            placeholder="Write a comment..."
                            disabled={isSubmitting}
                        />

                        <button
                            type="submit"
                            className={`text-sm font-semibold transition-colors ${commentText.trim() && !isSubmitting ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-400/50"}`}
                            disabled={isSubmitting || !commentText.trim()}
                        >
                            {isSubmitting ? "Posting..." : "Post"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OnCommentButtonClickModal;