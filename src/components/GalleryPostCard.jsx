import React, { useEffect, useRef } from 'react';
import { recordPostView } from '../api/api.js';

const GalleryPostCard = ({ post, onClick, trackImpression = true }) => {
  if (!post) return null;

  const cardRef = useRef(null);
  const impressionTrackedRef = useRef(false);

  useEffect(() => {
    if (!trackImpression || !post?._id) return;
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
  }, [trackImpression, post?._id]);

  return (
    <div
      ref={cardRef}
      className="relative group overflow-hidden border-2 border-white cursor-pointer"
      onClick={() => onClick(post)}
    >
      {/* 📸 Post Image */}
      <img
        src={post.image || 'https://via.placeholder.com/400'}
        alt={post.caption || 'Gallery post'}
        className="w-full h-48 sm:h-56 md:h-64 object-cover transition-all duration-300 group-hover:scale-105 group-hover:opacity-30"
        loading="lazy"
      />

      {/* 🌑 Dark Overlay */}
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-all duration-300"></div>

      {/* ❤️ Stats Overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-white">
        <div className="flex items-center gap-6 text-lg font-bold">

          {/* ❤️ Likes */}
          <div className="flex items-center gap-1">
            <lord-icon
              src="https://cdn.lordicon.com/yucrjnnl.json"
              trigger="hover"
              stroke="bold"
              colors="primary:#fff"
              style={{ width: '30px', height: '30px' }}
            ></lord-icon>
            <span>{post.likes?.length || 0}</span>
          </div>

          {/* 💬 Comments */}
          <div className="flex items-center gap-1">
            <lord-icon
              src="https://cdn.lordicon.com/wwsllqpi.json"
              trigger="hover"
              colors="primary:#ffffff"
              style={{ width: '30px', height: '30px' }}
            ></lord-icon>
            <span>{post.comments?.length || 0}</span>
          </div>

        </div>
      </div>

      {/* 🏷️ Category Badge (bottom-left, always visible) */}
      {post.category && post.category !== 'other' && (
        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider border border-white/30">
          {post.category}
        </div>
      )}    
    </div>
  );
};

export default GalleryPostCard;
