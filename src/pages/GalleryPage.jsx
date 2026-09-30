import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllPosts, recordPostView, searchPosts } from '../api/api.js';
import GalleryPostCard from '../components/GalleryPostCard.jsx';
import PostCard from '../components/PostCard.jsx';
import { lockScroll, unlockScroll } from '../utils/scrollLock'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'wildlife', label: 'Wildlife' },
  { value: 'street', label: 'Street' },
  { value: 'macro', label: 'Macro' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'other', label: 'Other' },
];

const GalleryPage = () => {
  const user = useSelector((state) => state.user.user);
  const isLoading = useSelector((state) => state.user.isLoading);
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const observerTarget = useRef(null);

  // ✅ Check authentication
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/account');
    }
  }, [user, isLoading, navigate]);

  // 🔍 Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 📖 Fetch posts (all or search)
  const fetchPosts = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      let response;

      if (debouncedSearch) {
        response = await searchPosts(debouncedSearch, pageNum, 12, category);
      } else {
        response = await getAllPosts(pageNum, 12, category);
      }

      const newPosts = response.posts || [];

      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === 12);
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [category, debouncedSearch]);

  // 📖 Initial fetch + refetch on category/search change
  useEffect(() => {
    if (user) {
      setPage(1);
      fetchPosts(1);
    }
  }, [user, category, debouncedSearch, fetchPosts]);

  // 🔄 Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => {
            const nextPage = prev + 1;
            fetchPosts(nextPage);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, fetchPosts]);

  // ⌨️ ESC key to close modal + lock body scroll
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setSelectedPost(null);
      }
    };

    if (!selectedPost) return undefined

    document.addEventListener('keydown', handleEsc);
    lockScroll();

    return () => {
      document.removeEventListener('keydown', handleEsc);
      unlockScroll();
    };
  }, [selectedPost]);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setPage(1);
    setPosts([]);
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

  const handleLikeChange = () => {
    // PostCard handles internal state; gallery grid refreshes on next load
  };

  const handleCommentChange = () => {
    // PostCard handles internal state; gallery grid refreshes on next load
  };

  if (!user) {
    return <div className="text-white text-center py-20">Loading...</div>;
  }

  return (
    <div className="w-full min-h-screen text-white px-4 md:px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 🎨 Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-wide">Gallery</h1>
          <p className="text-sm text-gray-400">Explore stunning photography from our community.</p>
        </div>


        {/* 🏷️ Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-4 py-2 border-2 transition-all duration-200 ${
                category === cat.value
                  ? 'bg-transparent text-white border-white font-semibold shadow-[4px_4px_0_white]'
                  : 'border-white text-white hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_white]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 📊 Results count */}
        <div className="text-xs text-gray-400">
          {loading && posts.length === 0
            ? 'Loading...'
            : `${posts.length} post${posts.length !== 1 ? 's' : ''} found`}
        </div>

        {/* ⏳ Skeleton Loading */}
        {loading && posts.length === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="h-48 sm:h-56 md:h-64 border border-white/15 bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {/* 📭 Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-20 border border-white/15 rounded-2xl bg-black/30">
            <p className="text-lg font-semibold">No posts found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different category or search term.</p>
          </div>
        )}

        {/* 🖼️ Grid */}
        {posts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
            {posts.map((post) => (
              <GalleryPostCard key={post._id} post={post} onClick={handlePostClick} />
            ))}
          </div>
        )}

        {/* 🔄 Infinite scroll target */}
        <div ref={observerTarget} className="py-4 flex justify-center">
          {loading && posts.length > 0 && (
            <p className="text-gray-400">⏳ Loading more...</p>
          )}
          {!hasMore && posts.length > 0 && (
            <p className="text-gray-500 text-sm">✅ No more posts</p>
          )}
        </div>
      </div>

      {/* 🖼️ Post Detail Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={handleCloseModal}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300 transition-colors z-10"
            >
              ✕
            </button>
            <PostCard
              post={selectedPost}
              onLikeChange={handleLikeChange}
              onCommentChange={handleCommentChange}
              trackImpression={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
