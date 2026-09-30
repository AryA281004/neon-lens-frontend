import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Topfollowerbar from '../components/Topfollowerbar.jsx';
import PostCard from '../components/PostCard.jsx';
import { getAllPosts, getFollowing, getTrendingTopics } from '../api/api.js';

const HomePage = () => {
  const user = useSelector((state) => state.user.user);
  const isLoading = useSelector((state) => state.user.isLoading);
  const navigate = useNavigate();
  
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState({ tags: [], categories: [] });
  const [activeFilter, setActiveFilter] = useState({ type: 'category', value: 'all' });
  const [currentFilterLabel, setCurrentFilterLabel] = useState('All posts');
  const observerTarget = useRef(null);
  const [page, setPage] = useState(1);

  // ✅ Check authentication
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/account');
    }
  }, [user, isLoading, navigate]);

  // 🔀 Sort posts: followers first, then global
  const sortPostsByFollowing = useCallback((posts) => {
    if (!Array.isArray(posts) || posts.length === 0) return posts;
    if (!followingUsers.length) return posts;
    
    const followingIds = new Set(
      followingUsers
        .map((entry) => String(entry?._id || entry?.id || ''))
        .filter(Boolean)
    );

    return [...posts].sort((a, b) => {
      const aAuthorId = typeof a.author === 'string' ? a.author : a.author?._id;
      const bAuthorId = typeof b.author === 'string' ? b.author : b.author?._id;
      
      const aIsFollowing = followingIds.has(String(aAuthorId || '')) ? 1 : 0;
      const bIsFollowing = followingIds.has(String(bAuthorId || '')) ? 1 : 0;

      return bIsFollowing - aIsFollowing;
    });
  }, [followingUsers]);

  const fetchTrendingTopics = useCallback(async () => {
    try {
      setIsLoadingTrends(true);
      const response = await getTrendingTopics();
      setTrendingTopics(response?.trending || { tags: [], categories: [] });
    } catch (error) {
      console.error('❌ Error fetching trending topics:', error);
      setTrendingTopics({ tags: [], categories: [] });
    } finally {
      setIsLoadingTrends(false);
    }
  }, []);

  const fetchFollowingUsers = useCallback(async () => {
    const currentUserId = user?.id || user?._id;
    if (!currentUserId) {
      setFollowingUsers([]);
      return;
    }

    try {
      setIsLoadingFollowing(true);
      const response = await getFollowing(currentUserId, 1, 100);
      const list = Array.isArray(response?.following) ? response.following : [];
      setFollowingUsers(list);
    } catch (error) {
      console.error('❌ Error fetching following list:', error);
      setFollowingUsers([]);
    } finally {
      setIsLoadingFollowing(false);
    }
  }, [user]);

  // 📖 Fetch posts
  const fetchPosts = useCallback(async (pageNum, filter = activeFilter) => {
    try {
      setIsLoadingPosts(true);
      const category = filter.type === 'category' ? filter.value : 'all';
      const tag = filter.type === 'tag' ? filter.value : '';
      const response = await getAllPosts(pageNum, 10, category, tag);
      
      if (!response.posts || response.posts.length === 0) {
        setHasMore(false);
        if (pageNum === 1) setFilteredPosts([]);
        return;
      }

      const sortedPosts = sortPostsByFollowing(response.posts);

      if (pageNum === 1) {
        setFilteredPosts(sortedPosts);
      } else {
        setFilteredPosts((prev) => [...prev, ...sortedPosts]);
      }

      setHasMore(response.posts.length === 10);
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [activeFilter, sortPostsByFollowing]);

  // 📖 Initial fetch
  useEffect(() => {
    if (user) {
      setPage(1);
      setCurrentFilterLabel(
        activeFilter.type === 'tag'
          ? `#${activeFilter.value}`
          : activeFilter.value === 'all'
            ? 'All posts'
            : activeFilter.value,
      );
      fetchPosts(1, activeFilter);
    }
  }, [user, activeFilter, fetchPosts]);

  useEffect(() => {
    if (user) {
      fetchFollowingUsers();
    } else {
      setFollowingUsers([]);
    }
  }, [fetchFollowingUsers, user]);

  useEffect(() => {
    fetchTrendingTopics();
  }, [fetchTrendingTopics]);

  useEffect(() => {
    if (!filteredPosts.length) return;
    setFilteredPosts((prev) => sortPostsByFollowing(prev));
  }, [followingUsers, sortPostsByFollowing]);

  // 🔄 Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingPosts) {
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
  }, [hasMore, isLoadingPosts, fetchPosts]);

  if (!user) {
    return <div className='text-white text-center py-20'>Loading...</div>;
  }

  return (
    <div className='w-full min-h-screen  text-white'>
      {/* Stories Bar */}
      
      <div className=' top-0 z-10 flex items-center mr-29 py-px 2xl:py-4'>
        <div className=' mx-auto px-4'>
          <Topfollowerbar followingUsers={followingUsers} isLoading={isLoadingFollowing} />
        </div>
      </div>

      <div className=' flex flex-col gap-6 px-4 py-4 xl:flex-row xl:items-start xl:px-6'>
        <main className='order-1 xl:order-1 flex-1'>
          <div className='mx-auto px-4 py-6'>
            {isLoadingPosts && filteredPosts.length === 0 && (
              <div className='flex justify-center py-20'>
                <p className='text-gray-400'>⏳ Loading posts...</p>
              </div>
            )}

            {!isLoadingPosts && filteredPosts.length === 0 && (
              <div className='flex flex-col items-center justify-center py-20'>
                <h2 className='text-2xl font-bold mb-2'>No posts yet</h2>
                <p className='text-gray-400'>Follow photographers to see posts</p>
              </div>
            )}

            {filteredPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}

            <div ref={observerTarget} className='py-4 flex justify-center'>
              {isLoadingPosts && filteredPosts.length > 0 && (
                <p className='text-gray-400'>⏳ Loading more...</p>
              )}
              {!hasMore && filteredPosts.length > 0 && (
                <p className='text-gray-500 text-sm'>✅ No more posts</p>
              )}
            </div>
          </div>
        </main>

        <aside className='order-2 xl:order-2 xl:min-w-[320px] xl:max-w-[360px] xl:sticky xl:top-24'>
          <div className='rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg p-4 shadow-lg shadow-black/20'>
            <div className='flex flex-col gap-4'>
              <div>
                <p className='text-xs uppercase tracking-[0.25em] text-cyan-300'>Trending themes</p>
                <h2 className='text-xl font-semibold text-white mt-2'>Create for what the community is already searching for.</h2>
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300'>Showing: {currentFilterLabel}</span>
                {activeFilter.value !== 'all' && (
                  <button
                    type='button'
                    onClick={() => setActiveFilter({ type: 'category', value: 'all' })}
                    className='rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200 hover:bg-cyan-500/20'
                  >
                    Clear filter
                  </button>
                )}
              </div>

              <div className='rounded-2xl border border-white/10 bg-white/5 p-3'>
                <p className='text-[11px] uppercase tracking-[0.22em] text-gray-400'>Top categories</p>
                <div className='mt-3 flex flex-wrap gap-2'>
                  {isLoadingTrends ? (
                    <span className='text-xs text-gray-400'>Loading...</span>
                  ) : trendingTopics.categories.length > 0 ? (
                    trendingTopics.categories.map((item) => (
                      <button
                        key={item.category}
                        type='button'
                        onClick={() => setActiveFilter({ type: 'category', value: item.category })}
                        className='rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-cyan-400/10'
                      >
                        {item.category} ({item.count})
                      </button>
                    ))
                  ) : (
                    <span className='text-xs text-gray-400'>No category signals yet.</span>
                  )}
                </div>
              </div>

              <div className='rounded-2xl border border-white/10 bg-white/5 p-3'>
                <p className='text-[11px] uppercase tracking-[0.22em] text-gray-400'>Top tags</p>
                <div className='mt-3 flex flex-wrap gap-2'>
                  {isLoadingTrends ? (
                    <span className='text-xs text-gray-400'>Loading...</span>
                  ) : trendingTopics.tags.length > 0 ? (
                    trendingTopics.tags.map((item) => (
                      <button
                        key={item.tag}
                        type='button'
                        onClick={() => setActiveFilter({ type: 'tag', value: item.tag })}
                        className='rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-cyan-400/10'
                      >
                        #{item.tag} ({item.count})
                      </button>
                    ))
                  ) : (
                    <span className='text-xs text-gray-400'>No tag signals yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
