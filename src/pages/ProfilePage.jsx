import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getFollowersCount,
  getFollowingCount,
  getOverallAccountDashboard,
  getMyUserDetails,
  getUserDetailsByUsername,
  getUserPostsCount,
} from "../api/api.js";
import Sidebaronlyinmyprofile from "../components/Sidebaronlyinmyprofile.jsx";
import ProfileDashboardMicroPage from "./micropages/ProfileDashboardMicroPage.jsx";
import ProfileEquipmentMicroPage from "./micropages/ProfileEquipmentMicroPage.jsx";
import ProfileInspirationMicroPage from "./micropages/ProfileInspirationMicroPage.jsx";
import ProfileOverviewMicroPage from "./micropages/ProfileOverviewMicroPage.jsx";
import ProfileProjectsMicroPage from "./micropages/ProfileProjectsMicroPage.jsx";


const OWN_PROFILE_TABS = [
  "profile",
  "dashboard",
  "projects",
  "equipment",
  "inspiration",
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { username: routeUsername } = useParams();
  const user = useSelector((state) => state.user.user);
  const isLoadingUser = useSelector((state) => state.user.isLoading);
  const normalizedRouteUsername = String(routeUsername || "")
    .trim()
    .toLowerCase();
  const currentUserId = String(user?.id || user?._id || "");
  const isOwnProfileRoute =
    !routeUsername || normalizedRouteUsername === "me";
  const shouldShowMyProfileSidebar = isOwnProfileRoute;
  const rawTab = String(searchParams.get("tab") || "profile")
    .trim()
    .toLowerCase();
  const activeProfileTab =
    isOwnProfileRoute && OWN_PROFILE_TABS.includes(rawTab) ? rawTab : "profile";

  const [profile, setProfile] = useState(user || null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState("");
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState("followers");
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    // Load Lord Icon from CDN
    const script = document.createElement("script");
    script.src = "https://cdn.lordicon.com/lordicon.js";
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isLoadingUser && !user) {
      navigate("/account");
    }
  }, [isLoadingUser, user, navigate]);

  useEffect(() => {
    if (isLoadingUser || !user) return;
    if (!isOwnProfileRoute && !normalizedRouteUsername) return;

    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        setError("");

        if (!isOwnProfileRoute && !normalizedRouteUsername) {
          throw new Error("Username is required");
        }

        const response = isOwnProfileRoute
          ? await getMyUserDetails()
          : await getUserDetailsByUsername(normalizedRouteUsername);
        const userData = response?.user || null;

        if (!userData) {
          throw new Error("User not found");
        }

        const targetUserId = userData?.id || userData?._id;

        if (!targetUserId) {
          throw new Error("Invalid profile data");
        }

        let postsCountValue = Number(userData?.postsCount || 0);
        let followersCountValue = Number(userData?.followersCount || 0);
        let followingCountValue = Number(userData?.followingCount || 0);

        if (targetUserId) {
          const [postsResponse, followersCountResponse, followingCountResponse] = await Promise.all([
            getUserPostsCount(targetUserId),
            getFollowersCount(targetUserId),
            getFollowingCount(targetUserId),
          ]);

          postsCountValue = Number(
            postsResponse?.postsCount || postsCountValue,
          );
          followersCountValue = Number(
            followersCountResponse?.followersCount || followersCountValue,
          );
          followingCountValue = Number(
            followingCountResponse?.followingCount || followingCountValue,
          );
        }

        const profileData = {
          ...userData,
          postsCount: postsCountValue,
          followersCount: followersCountValue,
          followingCount: followingCountValue,
        };

        if (!isMounted) return;

        setProfile(profileData);
      } catch (err) {
        if (!isMounted) return;
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch profile details";
        setError(message);
        setProfile(isOwnProfileRoute ? user : null);
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user, isLoadingUser, isOwnProfileRoute, normalizedRouteUsername]);

  useEffect(() => {
    if (isLoadingUser || !user) return;
    if (!isOwnProfileRoute || activeProfileTab !== "dashboard") return;

    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoadingDashboard(true);
        setDashboardError("");
        const response = await getOverallAccountDashboard(60);

        if (!isMounted) return;

        setDashboardData(response?.dashboard || null);
      } catch (err) {
        if (!isMounted) return;

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch dashboard data";

        setDashboardError(message);
        setDashboardData(null);
      } finally {
        if (isMounted) {
          setLoadingDashboard(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [isLoadingUser, user, isOwnProfileRoute, activeProfileTab]);

  if (isLoadingUser && !user) {
    return (
      <div className="text-white text-center py-20">Loading profile...</div>
    );
  }

  if (!user) {
    return null;
  }

  const profileUserId = String(profile?.id || profile?._id || "");
  const normalizedProfileUsername = String(profile?.username || "")
    .trim()
    .toLowerCase();

  const data = isOwnProfileRoute
    ? (profileUserId && currentUserId && profileUserId === currentUserId
        ? profile
        : user)
    : (normalizedProfileUsername === normalizedRouteUsername ? profile : null);

  if (loadingProfile && !data) {
    return (
      <div className="text-white text-center py-20">Loading profile...</div>
    );
  }

  if (!data) {
    return (
      <div className="text-white text-center py-20">
        {error || "Profile not found."}
      </div>
    );
  }

  const followersCount = Number(data?.followersCount || 0);
  const followingCount = Number(data?.followingCount || 0);
  const postsCount = Number(data?.postsCount || 0);

  const handleEditProfile = () => {
    navigate("/settings/edit");
  };

  const handleSettings = () => {
    // settings modal logic build here
    alert("Settings coming soon!");
  };

  const handleModalOpen = (type) => {
    setFollowModalType(type);
    setIsFollowModalOpen(true);
  };

  const handleModalClose = () => {
    setIsFollowModalOpen(false);
  };

  const modalTargetUserId = String(
    data?.id || data?._id || (isOwnProfileRoute ? user?.id || user?._id : "") || "",
  );

  const dashboardOverview = dashboardData?.overview || {};
  const dashboardDerived = dashboardData?.derived || {};
  const dashboardAccount = dashboardData?.account || {};
  const dashboardTrends = dashboardData?.trends || {};
  const dashboardTopPosts = dashboardData?.topPosts || [];
  const dashboardBestConnections = dashboardData?.bestConnections || [];
  const dashboardOpportunitySignals = dashboardData?.opportunitySignals || {};

  return (
    <div
      className={`w-full min-h-screen text-white px-4 md:px-8 py-6 ${shouldShowMyProfileSidebar ? "lg:pr-30" : ""}`}
    >
      {activeProfileTab === "dashboard" && isOwnProfileRoute
        ? (
          <ProfileDashboardMicroPage
            loadingDashboard={loadingDashboard}
            dashboardError={dashboardError}
            dashboardOverview={dashboardOverview}
            dashboardDerived={dashboardDerived}
            dashboardAccount={dashboardAccount}
            dashboardTrends={dashboardTrends}
            dashboardTopPosts={dashboardTopPosts}
            dashboardBestConnections={dashboardBestConnections}
            dashboardOpportunitySignals={dashboardOpportunitySignals}
          />
        )
        : activeProfileTab === "projects" && isOwnProfileRoute
          ? <ProfileProjectsMicroPage />
          : activeProfileTab === "equipment" && isOwnProfileRoute
            ? <ProfileEquipmentMicroPage />
            : activeProfileTab === "inspiration" && isOwnProfileRoute
              ? <ProfileInspirationMicroPage />
          : (
            <ProfileOverviewMicroPage
              data={data}
              isOwnProfileRoute={isOwnProfileRoute}
              error={error}
              postsCount={postsCount}
              followersCount={followersCount}
              followingCount={followingCount}
              modalTargetUserId={modalTargetUserId}
              isFollowModalOpen={isFollowModalOpen}
              followModalType={followModalType}
              onEditProfile={handleEditProfile}
              onSettings={handleSettings}
              onOpenFollowModal={handleModalOpen}
              onCloseFollowModal={handleModalClose}
            />
          )}

      {shouldShowMyProfileSidebar && <Sidebaronlyinmyprofile />}
    </div>
  );
};

export default ProfilePage;
