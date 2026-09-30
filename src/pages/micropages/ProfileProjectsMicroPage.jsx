import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getUserPosts } from "../../api/api.js";
import GalleryPostCard from "../../components/GalleryPostCard.jsx";
import PostCard from "../../components/PostCard.jsx";

const FILTERS = [
  { value: "all", label: "All posts" },
  { value: "projects", label: "Project tagged" },
];

const ProfileProjectsMicroPage = () => {
  const user = useSelector((state) => state.user.user);
  const userId = String(user?.id || user?._id || "");
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getUserPosts(userId);
        if (!mounted) return;
        setPosts(Array.isArray(response?.posts) ? response.posts : []);
      } catch (err) {
        if (!mounted) return;
        setError("Failed to load posts.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPosts();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const isProjectPost = (post) => {
    const tags = Array.isArray(post?.tags) ? post.tags : [];
    const tagMatch = tags.some((tag) =>
      String(tag).toLowerCase().includes("project"),
    );
    const captionMatch = String(post?.caption || "")
      .toLowerCase()
      .includes("project");
    return tagMatch || captionMatch;
  };

  const projectPosts = useMemo(
    () => posts.filter(isProjectPost),
    [posts],
  );

  const filteredPosts = filter === "projects" ? projectPosts : posts;

  const resultsLabel = useMemo(() => {
    if (loading && filteredPosts.length === 0) return "Loading...";
    return `${filteredPosts.length} post${filteredPosts.length === 1 ? "" : "s"}`;
  }, [loading, filteredPosts.length]);

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-wide">Projects</h1>
        <p className="text-sm text-gray-400">
          Curate project-focused posts and keep your portfolio organized.
        </p>
      </div>

      {error && (
        <div className="border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`px-4 py-2 border-2 transition-all duration-200 ${
                filter === item.value
                  ? "bg-transparent text-white border-white font-semibold shadow-[4px_4px_0_white]"
                  : "border-white text-white hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_white]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-white/40">{resultsLabel}</div>
      </div>

      {loading && filteredPosts.length === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="h-48 sm:h-56 md:h-64 border border-white/15 bg-white/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && filteredPosts.length === 0 && filter === "projects" && (
        <div className="text-center py-16 border border-white/15 rounded-2xl bg-black/30">
          <p className="text-lg font-semibold">No project-tagged posts yet</p>
          <p className="text-white/50 text-sm mt-1">
            Add the tag project to your post captions or tags to surface them here.
          </p>
        </div>
      )}

      {!loading && filteredPosts.length === 0 && filter === "all" && (
        <div className="text-center py-16 border border-white/15 rounded-2xl bg-black/30">
          <p className="text-lg font-semibold">No posts yet</p>
          <p className="text-white/50 text-sm mt-1">
            Publish posts to start building your portfolio.
          </p>
        </div>
      )}

      {filteredPosts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
          {filteredPosts.map((post) => (
            <GalleryPostCard
              key={post._id}
              post={post}
              onClick={handlePostClick}
            />
          ))}
        </div>
      )}

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
              onSaveChange={() => {}}
              trackImpression={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileProjectsMicroPage;
