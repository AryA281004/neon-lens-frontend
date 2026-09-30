import React, { useState, useEffect, useCallback, useRef } from 'react';
import { likePost, addComment, savePost, recordPostView } from '../api/api.js';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import OnCommentButtonClickModal from './OnCommentButtonClickModal.jsx';
import SharePostModal from './SharePostModal.jsx';
import { getSocket } from '../utils/socket.js';

const getEntityId = (entity) => {
  if (!entity) return '';

  if (typeof entity === 'string') return entity;
  if (typeof entity === 'number') return String(entity);

  if (typeof entity === 'object') {
    return entity._id || entity.id || entity.toString?.() || '';
  }

  return String(entity);
};

const hasUserInCollection = (collection, userId) => {
  if (!Array.isArray(collection) || !userId) return false;

  return collection.some((item) => {
    if (!item) return false;

    // NEW SCHEMA SUPPORT
    if (item.userId) {
      return String(getEntityId(item.userId)) === String(userId);
    }

    // fallback support
    return String(getEntityId(item)) === String(userId);
  });
};

const normalizeComment = (incomingComment, currentUser) => {
  const baseComment = incomingComment || {};

  if (baseComment?.commenterId) {
    return baseComment;
  }

  return {
    ...baseComment,
    text: baseComment?.text || '',
    createdAt: baseComment?.createdAt || new Date().toISOString(),
    commenterId: {
      _id: currentUser?._id || currentUser?.id,
      username: currentUser?.username || 'you',
      profilePic: currentUser?.profilePic || '',
    },
  };
};

const PostCard = ({
  post,
  onLikeChange,
  onCommentChange,
  onSaveChange,
  trackImpression = true,
}) => {
    const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.user);
  const currentUserId = getEntityId(currentUser);

  const cardRef = useRef(null);
  const impressionTrackedRef = useRef(false);

  const [isLiked, setIsLiked] = useState(
    hasUserInCollection(post.likes, currentUserId)
  );

  const [isSaved, setIsSaved] = useState(
    hasUserInCollection(post.savedBy, currentUserId)
  );

  const [comments, setComments] = useState(
    Array.isArray(post.comments) ? post.comments : []
  );

  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareCount, setShareCount] = useState(
    Array.isArray(post.shares) ? post.shares.length : 0
  );

  const [likeCount, setLikeCount] = useState(
    Array.isArray(post.likes) ? post.likes.length : 0
  );

  // ❤️ LIKE / UNLIKE
  const handleLike = async () => {
    if (!currentUserId || isLiking) return;

    const previousLiked = isLiked;
    const previousLikeCount = likeCount;
    const nextLiked = !previousLiked;

    setIsLiking(true);

    // OPTIMISTIC UI
    setIsLiked(nextLiked);
    setLikeCount((prev) =>
      Math.max(0, prev + (nextLiked ? 1 : -1))
    );

    try {
      const response = await likePost(post._id);

      if (typeof response?.liked === 'boolean') {
        setIsLiked(response.liked);
      }

      if (typeof response?.likes === 'number') {
        setLikeCount(response.likes);
      }

      if (onLikeChange) onLikeChange(post._id);
    } catch (error) {
      // rollback
      setIsLiked(previousLiked);
      setLikeCount(previousLikeCount);
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // 🔖 SAVE / UNSAVE
  const handleSave = async () => {
    if (!currentUserId || isSaving) return;

    const previousSaved = isSaved;
    const nextSaved = !previousSaved;

    setIsSaved(nextSaved);
    setIsSaving(true);

    try {
      const response = await savePost(post._id);
      const nextState =
        typeof response?.saved === 'boolean' ? response.saved : nextSaved;

      if (typeof response?.saved === 'boolean') {
        setIsSaved(response.saved);
      }

      if (onSaveChange) {
        onSaveChange(post._id, nextState);
      }
    } catch (error) {
      setIsSaved(previousSaved);
      console.error('Error saving post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 💬 COMMENT
  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
      setIsCommenting(true);

      const response = await addComment(
        post._id,
        commentText.trim()
      );

      const normalizedComment = appendCommentIfMissing(
        response?.comment || response
      );

      setCommentText('');

      if (onCommentChange) {
        onCommentChange(post._id, normalizedComment);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  useEffect(() => {
    const scriptSrc = 'https://cdn.lordicon.com/lordicon.js';

    if (document.querySelector(`script[src="${scriptSrc}"]`)) return;

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!trackImpression || !post?._id || !currentUserId) return;
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || impressionTrackedRef.current) return;
        impressionTrackedRef.current = true;
        recordPostView(post._id).catch(() => {});
        observer.disconnect();
      },
      { threshold: 0.5 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [trackImpression, post?._id, currentUserId]);

  // 🔄 sync from props
  useEffect(() => {
    const normalizedLikes = Array.isArray(post.likes)
      ? post.likes
      : [];

    const normalizedSaved = Array.isArray(post.savedBy)
      ? post.savedBy
      : [];

    setIsLiked(
      hasUserInCollection(normalizedLikes, currentUserId)
    );

    setIsSaved(
      hasUserInCollection(normalizedSaved, currentUserId)
    );

    setLikeCount(normalizedLikes.length);
    setShareCount(Array.isArray(post.shares) ? post.shares.length : 0);
  }, [post.likes, post.savedBy, post.shares, currentUserId]);

  useEffect(() => {
    setComments(Array.isArray(post.comments) ? post.comments : []);
  }, [post._id, post.comments]);

  const appendCommentIfMissing = useCallback(
    (incomingComment) => {
      const normalizedComment = normalizeComment(
        incomingComment,
        currentUser
      );

      const incomingCommentId = normalizedComment?._id
        ? String(normalizedComment._id)
        : '';

      setComments((prev) => {
        if (incomingCommentId) {
          const exists = prev.some(
            (item) =>
              String(item?._id || '') === incomingCommentId
          );

          if (exists) return prev;
        }

        return [...prev, normalizedComment];
      });

      return normalizedComment;
    },
    [currentUser]
  );

  useEffect(() => {
    if (!post?._id) return;

    const socket = getSocket();

    const handleRealtimeComment = (payload) => {
      const incomingPostId = payload?.postId;
      const incomingComment = payload?.comment;

      if (
        !incomingPostId ||
        String(incomingPostId) !== String(post._id) ||
        !incomingComment
      ) {
        return;
      }

      const normalizedComment =
        appendCommentIfMissing(incomingComment);

      if (onCommentChange) {
        onCommentChange(post._id, normalizedComment, {
          fromSocket: true,
        });
      }
    };

    socket.emit('join-post', post._id);
    socket.on('comment:created', handleRealtimeComment);

    return () => {
      socket.off('comment:created', handleRealtimeComment);
      socket.emit('leave-post', post._id);
    };
  }, [post?._id, appendCommentIfMissing, onCommentChange]);

  const handleCommentButtonClick = () => {
    if (!currentUser) {
      navigate('/account');
      return;
    }

    setIsCommentModalOpen(true);
  };

  const handleShareButtonClick = () => {
    if (!currentUser) {
      navigate('/account');
      return;
    }

    setIsShareModalOpen(true);
  };

  const handleShareSuccess = (response) => {
    if (typeof response?.shares === 'number') {
      setShareCount(response.shares);
    } else {
      setShareCount((prev) => prev + 1);
    }
  };

  const handleCommentAddedFromModal = (
    newComment,
    meta = {}
  ) => {
    const normalizedComment =
      appendCommentIfMissing(newComment);

    if (onCommentChange) {
      onCommentChange(post._id, normalizedComment, meta);
    }
  };

  return (
    <div
      ref={cardRef}
      className='w-full max-w-2xl mx-auto bg-white/15 backdrop-blur-lg rounded-[40px] overflow-hidden mb-6 border border-white/20'
    >
      
      {/* 👤 Post Header */}
      <div className='flex items-center justify-between p-4 border-b border-gray-800'>
        <div className='flex items-center gap-3'>
          <img 
            src={post.author?.profilePic || 'https://via.placeholder.com/40'} 
            alt={post.author?.username}
            className='w-10 h-10 rounded-full object-cover'
          />
          <div>
            <p className='text-white font-semibold text-sm'>{post.author?.username}</p>
            <p className='text-gray-500 text-xs'>
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {post.location && (
          <p className='text-gray-400 text-xs'>{post.location}</p>
        )}
      </div>

      {/* 📸 Post Image */}
      <div className='w-full aspect-square bg-black overflow-hidden'>
        <img 
          src={post.image} 
          alt='post'
          className='w-full h-full object-cover'
        />
      </div>

      {/* ❤️ Actions Bar */}
      <div className='flex items-center gap-4 p-4 border-b border-gray-800'>
        <button 
          onClick={handleLike}
          className='text-2xl hover:scale-110 transition-transform'
        >
         <lord-icon
    src={isLiked ? "https://cdn.lordicon.com/yucrjnnl.json" : "https://cdn.lordicon.com/hsabxdnr.json"}
    trigger="hover"
    stroke="bold"
    colors={isLiked ? "primary:#ee6d66" : "primary:#fff"}
    style={{ width: '28px', height: '28px' }}>
</lord-icon>



        </button>
        <button
        onClick={handleCommentButtonClick}
         className='text-2xl hover:scale-110 transition-transform cursor-pointer'><lord-icon
    src="https://cdn.lordicon.com/wwsllqpi.json"
    trigger="hover"
    colors="primary:#ffffff"
    style={{ width: '28px', height: '28px' }}>
</lord-icon></button>
        <button
          type='button'
          onClick={handleShareButtonClick}
          className='text-2xl hover:scale-110 transition-transform cursor-pointer'
          aria-label='Share post'
        >
          <lord-icon
            src="https://cdn.lordicon.com/fhlrrido.json"
            trigger="hover"
            colors="primary:#ffffff"
            style={{ width: '28px', height: '28px' }}>
          </lord-icon>
        </button>

        
        <button
          onClick={handleSave}
          disabled={isSaving || !currentUserId}
          aria-label={isSaved ? 'Unsave post' : 'Save post'}
          className={`text-2xl hover:scale-110 transition-transform cursor-pointer ml-auto ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <lord-icon
            src={isSaved ? "https://cdn.lordicon.com/qvlwoymy.json" : "https://cdn.lordicon.com/olmrexol.json"}
      trigger={isSaved ? 'in' : 'hover'}
      stroke="bold"
      colors="primary:#ffffff"
    style={{ width: '28px', height: '28px' }}>
</lord-icon>
        </button>


      </div>

      {/* ❤️ Like Count & Caption */}
      <div className='px-4 py-3'>
        <p className='text-white font-semibold text-sm mb-2'>
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </p>
         
        {post.caption && (
          <p className='text-white text-sm mb-3'>
            <span className='font-semibold'>{post.author?.username}</span> {post.caption}
          </p>
        )}

        {post.category && (
          <p className='text-gray-400 text-xs mb-3'>
            📷 <span className='capitalize'>{post.category}</span>
          </p>
        )}

        <p className='text-white/70 text-xs mb-3'>
          🔁 {shareCount} {shareCount === 1 ? 'share' : 'shares'}
        </p>

        {/* 💬 Comments Preview */}
        {comments?.length > 0 && (
          <div className='mb-3 max-h-24 overflow-y-auto'>
            {comments.slice(-2).map((comment, idx) => (
              <p key={idx} className='text-white text-xs mb-1'>
                <span className='font-semibold'>{comment.commenterId?.username}</span> {comment.text}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* 💬 Comment Input */}
      {currentUser && (
        <div className='border-t border-gray-800 p-4 flex gap-2'>
          <input
            type='text'
            placeholder='Add a comment...'
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleComment()}
            disabled={isCommenting}
            className='flex-1 bg-black/20 backdrop-blur-20 text-white text-sm rounded-full px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600'
          />
          <button
            onClick={handleComment}
            disabled={isCommenting || !commentText.trim()}
            className='text-white border-2 border-white rounded-4xl px-3 py-2 hover:text-blue-400 disabled:text-white/70 text-sm font-semibold transition-colors'
          >
            Post
          </button>
        </div>
      )}

      {isCommentModalOpen && (
        <OnCommentButtonClickModal
          post={{ ...post, comments }}
          onCommentAdded={handleCommentAddedFromModal}
          onClose={() => setIsCommentModalOpen(false)}
        />
      )}

      {isShareModalOpen && (
        <SharePostModal
          post={post}
          onClose={() => setIsShareModalOpen(false)}
          onShared={handleShareSuccess}
        />
      )}
    </div>
  );
};

export default PostCard;
