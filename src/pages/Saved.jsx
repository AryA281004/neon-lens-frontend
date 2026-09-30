import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getSavedPosts, recordPostView } from "../api/api.js";
import GalleryPostCard from "../components/GalleryPostCard.jsx";
import PostCard from "../components/PostCard.jsx";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "landscape", label: "Landscape" },
  { value: "portrait", label: "Portrait" },
  { value: "wildlife", label: "Wildlife" },
  { value: "street", label: "Street" },
  { value: "macro", label: "Macro" },
  { value: "architecture", label: "Architecture" },
  { value: "other", label: "Other" },
];

const Saved = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const isLoading = useSelector((state) => state.user.isLoading);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("all");
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/account");
    }
  }, [user, isLoading, navigate]);

  const fetchSaved = useCallback(
    async (pageNum) => {
      try {
        setLoading(true);
        const response = await getSavedPosts(pageNum, 12, category);
        const newPosts = response?.posts || [];
        const totalPages = Number(response?.pagination?.total || 0);
        const hasNextPage =
          typeof response?.pagination?.hasNextPage === "boolean"
            ? response.pagination.hasNextPage
            : pageNum < totalPages;

        if (pageNum === 1) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }

        setHasMore(hasNextPage);
      } catch (error) {
        console.error("Error fetching saved posts:", error);
      } finally {
        setLoading(false);
      }
    },
    [category],
  );

  useEffect(() => {
    if (!user) return;
    setPage(1);
    fetchSaved(1);
  }, [user, category, fetchSaved]);

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSaved(nextPage);
  };

  const handlePostClick = (post) => {
    if (post?._id) {
      recordPostView(post._id).catch(() => {});
    }
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  const handleSaveChange = (postId, isSaved) => {
    if (isSaved) return;

    setPosts((prev) => prev.filter((post) => String(post?._id) !== String(postId)));

    if (String(selectedPost?._id) === String(postId)) {
      setSelectedPost(null);
    }
  };

  const resultsLabel = useMemo(() => {
    if (loading && posts.length === 0) return "Loading...";
    return `${posts.length} saved post${posts.length === 1 ? "" : "s"}`;
  }, [loading, posts.length]);

  if (!user) {
    return <div className="text-white text-center py-20">Loading...</div>;
  }

  return (
    <div className="w-full min-h-screen text-white px-4 md:px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="use-font text-3xl md:text-5xl">Saved</h1>
          <p className="text-sm text-white/60">
            Your bookmarked shots, ready whenever inspiration hits.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-4 py-2 border-2 transition-all duration-200 ${
                  category === cat.value
                    ? "bg-transparent text-white border-white font-semibold shadow-[4px_4px_0_white]"
                    : "border-white text-white hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_white]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-white/40">{resultsLabel}</div>
        </div>

        {loading && posts.length === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className="h-48 sm:h-56 md:h-64 border border-white/15 bg-white/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-20 border border-white/15 rounded-2xl bg-black/30">
            <p className="text-lg font-semibold">No saved posts yet</p>
            <p className="text-white/50 text-sm mt-1">
              Save posts you love and they will appear here.
            </p>
          </div>
        )}

        {posts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
            {posts.map((post) => (
              <GalleryPostCard key={post._id} post={post} onClick={handlePostClick} />
            ))}
          </div>
        )}

        {hasMore && posts.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-xs uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>

      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={handleCloseModal}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300 transition-colors z-10"
            >
              x
            </button>
            <PostCard
              post={selectedPost}
              onLikeChange={() => {}}
              onCommentChange={() => {}}
              onSaveChange={handleSaveChange}
              trackImpression={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Saved;
