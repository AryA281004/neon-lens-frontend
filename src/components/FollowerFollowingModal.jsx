import React, { useEffect, useMemo, useState } from "react";
import {
  getFollowers,
  getFollowing,
  getFollowersCount,
  getFollowingCount,
} from "../api/api.js";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 40 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.85, y: 40 },
};

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const FollowerFollowingModal = ({ userId, type, onClose }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentUser = useSelector((state) => state.user.user);
  const currentUserId = String(currentUser?.id || currentUser?._id || "");
  const currentUsername = String(currentUser?.username || "")
    .trim()
    .toLowerCase();

  const title = useMemo(
    () => (type === "followers" ? "Followers" : "Following"),
    [type],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!userId || !type) return;

      try {
        setLoading(true);
        setError("");

        if (type === "followers") {
          const [listResponse, countResponse] = await Promise.all([
            getFollowers(userId, 1, 100),
            getFollowersCount(userId),
          ]);

          if (!isMounted) return;

          const resolvedUsers = listResponse?.followers || [];
          setUsers(resolvedUsers);
          setCount(countResponse?.followersCount ?? resolvedUsers.length);
          return;
        }

        const [listResponse, countResponse] = await Promise.all([
          getFollowing(userId, 1, 100),
          getFollowingCount(userId),
        ]);

        if (!isMounted) return;

        const resolvedUsers = listResponse?.following || [];
        setUsers(resolvedUsers);
        setCount(countResponse?.followingCount ?? resolvedUsers.length);
      } catch (err) {
        if (!isMounted) return;
        setUsers([]);
        setCount(0);
        setError(err?.message || "Failed to fetch list");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [type, userId]);

  const getUserKey = (entry, index) =>
    String(entry?._id || entry?.id || entry?.username || `user-${index}`);

  const getUserId = (entry) => String(entry?._id || entry?.id || "");

  const handleViewProfile = (entry) => {
    const normalizedUsername = String(entry?.username || "")
      .trim()
      .toLowerCase();

    if (!normalizedUsername) return;

    if (normalizedUsername === currentUsername) {
      navigate("/profile/me");
    } else {
      navigate(`/profile/${normalizedUsername}`);
    }

    onClose?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="bg-black border-2 border-white shadow-[6px_6px_0_white] w-full max-w-md min-h-[80vh] overflow-y-auto p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              {title} ({count})
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl leading-none"
              aria-label="Close modal"
            >
              {" "}
              <lord-icon
                src="https://cdn.lordicon.com/ebyacdql.json"
                trigger="hover"
                state="hover-cross-2"
                colors="primary:#ffffff"
                style={{ width: "32px", height: "32px" }}
              >
                {" "}
              </lord-icon>{" "}
            </button>
          </div>

          {/* States */}
          {loading && <p className="text-sm text-cyan-300">Loading...</p>}
          {!loading && error && <p className="text-red-300">⚠️ {error}</p>}
          {!loading && !error && users.length === 0 && (
            <p className="text-gray-400">No users found.</p>
          )}

          {/* List */}
          {!loading && !error && users.length > 0 && (
            <motion.ul
              className="space-y-3"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {users.map((entry, index) => {
                const resolvedUserId = getUserId(entry);
                const isCurrentUser = resolvedUserId === currentUserId;

                return (
                  <motion.li
                    key={getUserKey(entry, index)}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 border border-white p-4 hover:shadow-[3px_3px_0_white] transition-all duration-300 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleViewProfile(entry)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleViewProfile(entry);
                      }
                    }}
                  >
                    {entry?.profilePic ? (
                      <img
                        src={entry.profilePic}
                        alt={entry.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border flex items-center justify-center text-white">
                        {(entry?.username?.[0] || "U").toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-white truncate">@{entry.username}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {entry.firstName} {entry.lastName}
                      </p>
                      {isCurrentUser && (
                        <span className="text-xs text-gray-400">(You)</span>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FollowerFollowingModal;
