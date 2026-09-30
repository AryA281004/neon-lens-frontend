import React, { useEffect, useState } from "react";
import { getUserPosts } from "../api/api.js";

const ProfilePostSection = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError("");

        const response = await getUserPosts(userId);
        setPosts(Array.isArray(response?.posts) ? response.posts : []);
      } catch (err) {
        setError("Failed to load posts. Please try again later.");
        console.error("Error fetching user posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (posts.length === 0) return <p>No posts to display.</p>;

  return (
    <div className="grid grid-cols-3 xl:grid-cols-5 gap-2">
      {posts.map((post) => (
        <div key={post._id} className="relative group overflow-hidden border-2 border-white">
          
          {/* 📸 Image */}
          <img
            src={post.image}
            alt={post.caption || "User post"}
            className="w-full h-48 object-cover  
                       transition-all duration-300 
                       group-hover:scale-105 group-hover:opacity-30"
          />

          {/* 🌑 Dark Overlay */}
          <div
            className="absolute inset-0 bg-black opacity-0 
                       group-hover:opacity-20 
                       transition-all duration-300"
          ></div>

          {/* ❤️ Stats Overlay */}
          <div
            className="absolute inset-0 opacity-0 
                       group-hover:opacity-100 
                       transition-all duration-300 
                       flex items-center justify-center text-white"
          >
            <div className="flex items-center gap-6 text-lg font-bold">

              {/* ❤️ Likes */}
              <div className="flex items-center gap-1">
                <lord-icon
                  src="https://cdn.lordicon.com/yucrjnnl.json"
                  trigger="hover"
                  stroke="bold"
                  colors="primary:#fff"
                  style={{ width: "30px", height: "30px" }}
                ></lord-icon>
                <span>{post.likes?.length || 0}</span>
              </div>

              {/* 💬 Comments */}
              <div className="flex items-center gap-1">
                <lord-icon
                  src="https://cdn.lordicon.com/wwsllqpi.json"
                  trigger="hover"
                  colors="primary:#ffffff"
                  style={{ width: "30px", height: "30px" }}
                ></lord-icon>
                <span>{post.comments?.length || 0}</span>
              </div>

            </div>
          </div>

        </div>
      ))}
    </div>
  );
};

export default ProfilePostSection;