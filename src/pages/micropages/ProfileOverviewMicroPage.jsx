import React from "react";
import FollowerFollowingModal from "../../components/FollowerFollowingModal.jsx";
import ProfilePostSection from "../../components/ProfilePostSection.jsx";

const formatCount = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return "0";
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
};

const getInitials = (user) => {
  const first = user?.firstName?.[0] || "";
  const last = user?.lastName?.[0] || "";

  if (first || last) return `${first}${last}`.toUpperCase();

  return (user?.username?.[0] || "U").toUpperCase();
};

const buildDisplayName = (user) => {
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  return fullName || user?.username || "Unknown user";
};

const ProfileOverviewMicroPage = ({
  data,
  isOwnProfileRoute,
  error,
  postsCount,
  followersCount,
  followingCount,
  modalTargetUserId,
  isFollowModalOpen,
  followModalType,
  onEditProfile,
  onSettings,
  onOpenFollowModal,
  onCloseFollowModal,
}) => {
  return (
    <>
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-wide">Portfolio</h1>
          <p className="text-sm text-gray-400">
            {isOwnProfileRoute
              ? "Your account overview and creator stats."
              : "Creator profile and stats."}
          </p>
        </div>

        {error && (
          <div className="border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-3 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        <div className="border-2 border-white bg-black shadow-[6px_6px_0_white] hover:-translate-y-1 hover:shadow-[10px_10px_0_white] transition duration-300 p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            {data?.profilePic ? (
              <img
                src={data.profilePic}
                alt={data.username}
                className="w-24 h-24 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center text-2xl font-bold">
                {getInitials(data)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold truncate">
                  {buildDisplayName(data)}
                </h2>
                {data?.role && (
                  <span className="text-[11px] px-2 py-0.5 border border-white/40 rounded-full capitalize">
                    {data.role}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-400 truncate mt-1">@{data?.username}</p>
            </div>

            {isOwnProfileRoute && (
              <div className="flex gap-3 ml-auto">
                <button type="button" onClick={onEditProfile} className="">
                  <lord-icon
                    src="https://cdn.lordicon.com/exymduqj.json"
                    trigger="loop"
                    delay="1500"
                    stroke="bold"
                    state="in-dynamic"
                    colors="primary:#ffffff,secondary:#ffffff"
                    style={{ width: "30px", height: "30px" }}
                  ></lord-icon>
                </button>

                <button type="button" onClick={onSettings} className="">
                  <lord-icon
                    src="https://cdn.lordicon.com/asyunleq.json"
                    trigger="loop"
                    state="loop-cog"
                    colors="primary:#ffffff"
                    style={{ width: "30px", height: "30px" }}
                  ></lord-icon>
                </button>
              </div>
            )}
          </div>

          {data?.bio && (
            <p className="text-sm text-gray-300 mt-5 border border-white/10 rounded-xl p-3 bg-white/5">
              {data.bio}
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            <div className="border-2 border-white hover:shadow-[4px_4px_0_white] p-3 bg-white/5 transition-all duration-300">
              <p className="text-xs text-gray-400">NL Score</p>
              <p className="text-lg text-white/50">Coming Soon</p>
            </div>

            <div className="border-2 border-white hover:shadow-[4px_4px_0_white] p-3 bg-white/5 transition-all duration-300">
              <p className="text-xs text-gray-400">Posts</p>
              <p className="text-lg font-semibold">{formatCount(postsCount)}</p>
            </div>

            <div
              onClick={() => onOpenFollowModal("followers")}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpenFollowModal("followers");
                }
              }}
              className="border-2 border-white hover:shadow-[4px_4px_0_white] p-3 bg-white/5 transition-all duration-300 cursor-pointer"
            >
              <p className="text-xs text-gray-400">Followers</p>
              <p className="text-lg font-semibold">{formatCount(followersCount)}</p>
            </div>

            <div
              onClick={() => onOpenFollowModal("following")}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpenFollowModal("following");
                }
              }}
              className="border-2 border-white hover:shadow-[4px_4px_0_white] p-3 bg-white/5 transition-all duration-300 cursor-pointer"
            >
              <p className="text-xs text-gray-400">Following</p>
              <p className="text-lg font-semibold">{formatCount(followingCount)}</p>
            </div>
          </div>
        </div>

        {data?.equipment && Object.keys(data.equipment).length > 0 && (
          <div className="border-2 border-white bg-black shadow-[6px_6px_0_white] p-5 md:p-6 mt-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-semibold">Equipment Kit</h3>
                <p className="text-sm text-gray-400">
                  {isOwnProfileRoute ? "Your saved gear" : "This creator's saved gear"}
                </p>
              </div>
              <span className="text-sm text-gray-400">{Object.values(data.equipment).filter((value) => value && value !== "none").length} items</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(data.equipment)
                .filter(([, value]) => value && value !== "none")
                .map(([section, value]) => (
                  <div key={section} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-gray-400">{section}</p>
                    <p className="mt-3 text-sm font-semibold text-white">
                      {value === "half" ? "50/50" : value}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {isFollowModalOpen && modalTargetUserId && (
          <FollowerFollowingModal
            userId={modalTargetUserId}
            type={followModalType}
            onClose={onCloseFollowModal}
          />
        )}
      </div>

      <div className="w-full flex justify-center mt-10">
        <div className="w-[75vw] transition duration-300 p-5 md:p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isOwnProfileRoute ? "Your Posts" : `${data?.username || "User"}'s Posts`}
          </h2>
          {modalTargetUserId ? (
            <ProfilePostSection userId={modalTargetUserId} />
          ) : (
            <p className="text-sm text-gray-400">Unable to load posts for this profile.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileOverviewMicroPage;
