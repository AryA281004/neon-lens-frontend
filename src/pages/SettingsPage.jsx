import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getMyUserDetails,
  editFirstName,
  editLastName,
  editUserName,
  editBio,
  editProfilePic,
} from "../api/api.js";
import SettingsSidebar from "../components/SettingsSidebar.jsx";
import { setUserData } from "../redux/userSlice";

const mapUserToForm = (user) => ({
  firstName: user?.firstName || "",
  lastName: user?.lastName || "",
  username: user?.username || "",
  mobilenumber: user?.mobilenumber || "",
  bio: user?.bio || "",
  profilePic: user?.profilePic || "",
});

const SettingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const isLoadingUser = useSelector((state) => state.user.isLoading);

  const [formData, setFormData] = useState(mapUserToForm(user));
  const [initialData, setInitialData] = useState(mapUserToForm(user));
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicInputKey, setProfilePicInputKey] = useState(0);
  const [profilePicPreview, setProfilePicPreview] = useState("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!isLoadingUser && !user) {
      navigate("/account");
    }
  }, [isLoadingUser, user, navigate]);

  useEffect(() => {
    if (isLoadingUser || !user) return;

    let isMounted = true;

    const loadMyProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const response = await getMyUserDetails();
        const profileData = response?.user || user;
        const mapped = mapUserToForm(profileData);

        if (!isMounted) return;

        setFormData(mapped);
        setInitialData(mapped);
        setProfilePicFile(null);
        setProfilePicInputKey((prev) => prev + 1);
      } catch (error) {
        if (!isMounted) return;

        const fallback = mapUserToForm(user);
        setFormData(fallback);
        setInitialData(fallback);
        setProfilePicFile(null);
        setProfilePicInputKey((prev) => prev + 1);

        toast.error(
          error?.message || "Could not fetch latest profile details",
        );
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    loadMyProfile();

    return () => {
      isMounted = false;
    };
  }, [isLoadingUser, user]);

  useEffect(() => {
    if (profilePicFile) {
      const previewUrl = URL.createObjectURL(profilePicFile);
      setProfilePicPreview(previewUrl);

      return () => {
        URL.revokeObjectURL(previewUrl);
      };
    }

    setProfilePicPreview(initialData.profilePic || "");
  }, [profilePicFile, initialData.profilePic]);

  const hasTextChanges = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(initialData),
    [formData, initialData],
  );
  const hasProfilePicChange = Boolean(profilePicFile);
  const hasChanges = hasTextChanges || hasProfilePicChange;

  const rawUsername = String(formData.username || "");
  const normalizedUsername = rawUsername
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
  const initialUsername = String(initialData.username || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
  const isUsernameValid =
    normalizedUsername !== "" && /^[a-z0-9_]+$/.test(normalizedUsername);

  const isMobileEditable = false;
  const mobileNumber = String(formData.mobilenumber || "").trim();
  const isMobileValid =
    !isMobileEditable || mobileNumber === "" || /^[0-9]{10}$/.test(mobileNumber);
  const mobileInputClassName = isMobileEditable
    ? `bg-transparent border px-3 py-2 outline-none ${
        isMobileValid ? "border-white/30 focus:border-white" : "border-red-400"
      }`
    : "bg-white/5 border border-white/20 px-3 py-2 text-gray-400 cursor-not-allowed";

  const usernameInputClassName = `bg-transparent border px-3 py-2 outline-none ${
    isUsernameValid ? "border-white/30 focus:border-white" : "border-red-400"
  }`;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData(initialData);
    setProfilePicFile(null);
    setDragActive(false);
    setProfilePicInputKey((prev) => prev + 1);
  };

  const processProfilePicFile = (file) => {
    if (!file) {
      setProfilePicFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      setProfilePicInputKey((prev) => prev + 1);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      setProfilePicInputKey((prev) => prev + 1);
      return;
    }

    setProfilePicFile(file);
  };

  const handleProfilePicChange = (event) => {
    const file = event.target.files?.[0] || null;
    processProfilePicFile(file);
  };

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const files = event.dataTransfer.files;
    if (files && files[0]) {
      processProfilePicFile(files[0]);
    }
  };

  const handleUsernameChange = (event) => {
    const nextValue = event.target.value
      .replace(/^@+/, "")
      .replace(/\s+/g, "")
      .toLowerCase();
    setFormData((prev) => ({
      ...prev,
      username: nextValue,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!isUsernameValid) {
      toast.error("Username can only include letters, numbers, and underscores");
      return;
    }

    if (!hasChanges) {
      toast("No changes to save", { icon: "ℹ️" });
      return;
    }

    try {
      setIsSaving(true);
      const trimmedFirstName = formData.firstName.trim();
      const trimmedLastName = formData.lastName.trim();
      const trimmedBio = formData.bio.trim();

      const updateRequests = [];

      if (trimmedFirstName !== initialData.firstName) {
        updateRequests.push(editFirstName(trimmedFirstName));
      }

      if (trimmedLastName !== initialData.lastName) {
        updateRequests.push(editLastName(trimmedLastName));
      }

      if (normalizedUsername !== initialUsername) {
        updateRequests.push(editUserName(normalizedUsername));
      }

      if (trimmedBio !== initialData.bio) {
        updateRequests.push(editBio(trimmedBio));
      }

      if (profilePicFile) {
        updateRequests.push(editProfilePic(profilePicFile));
      }

      if (updateRequests.length === 0) {
        toast("No changes to save", { icon: "ℹ️" });
        return;
      }

      const results = await Promise.allSettled(updateRequests);
      const fulfilled = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);
      const rejected = results.filter((result) => result.status === "rejected");
      const updatedUser = fulfilled[fulfilled.length - 1];

      if (updatedUser) {
        const mergedUser = {
          ...user,
          ...updatedUser,
        };

        dispatch(setUserData(mergedUser));
        localStorage.setItem("user", JSON.stringify(mergedUser));

        const refreshed = mapUserToForm(mergedUser);
        setFormData(refreshed);
        setInitialData(refreshed);
        setProfilePicFile(null);
        setDragActive(false);
        setProfilePicInputKey((prev) => prev + 1);
      }

      if (rejected.length > 0) {
        const message =
          rejected[0]?.reason?.message || "Some profile updates failed";
        toast.error(message);
      } else {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingUser || isLoadingProfile) {
    return <div className="text-white text-center py-20">Loading settings...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full min-h-screen text-white px-4 md:px-8 py-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
        

        <div className="border-2 border-white bg-black shadow-[6px_6px_0_white] p-5 md:p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-wide">Edit Profile</h1>
              <p className="text-sm text-gray-400 mt-1">
                Keep your account details up to date.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/profile/me")}
              className="px-3 py-2 border border-white/30 text-sm hover:bg-white/10 transition"
            >
              Back to Profile
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className=" flex flex-row  gap-5 md:gap-7">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-white/80 uppercase flex items-center tracking-widest">
                
                Profile Picture
              </label>

              <label
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  w-70 h-70 flex flex-col items-center justify-center
                  border-2 border-dashed rounded-full cursor-pointer
                  transition-all duration-300 group
                  ${dragActive
                    ? "border-cyan-400/60 bg-cyan-500/10 scale-105"
                    : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40"
                  }
                `}
              >
                {profilePicPreview ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={profilePicPreview}
                      alt="Profile preview"
                      className="h-full w-full object-cover rounded-full border-4 border-white"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-full flex items-center justify-center">
                      <span className="text-white/0 group-hover:text-white/70 text-sm font-semibold transition-all">
                        Change Image
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <lord-icon
                      src="https://cdn.lordicon.com/wsaaegar.json"
                      trigger="hover"
                      delay="1500"
                      state="reveal"
                      colors="primary:#ffffff,secondary:#ffffff"
                      style={{ width: "150px", height: "150px" }}
                    ></lord-icon>
                    <span className="text-white/60 text-sm text-center font-medium">
                      Drag image here or click to upload
                    </span>
                    <span className="text-white/40 text-xs mt-1">
                      PNG, JPG up to 5MB
                    </span>
                  </>
                )}

                <input
                  type="file"
                  key={profilePicInputKey}
                  name="profilePic"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
              </label>
            </div>
              
                          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


              
              <label className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-white/80 uppercase flex items-center tracking-widest">First Name</span>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="bg-transparent border border-white/30 px-3 py-2 outline-none focus:border-white"
                  required
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-white/80 uppercase flex items-center tracking-widest">Last Name</span>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="bg-transparent border border-white/30 px-3 py-2 outline-none focus:border-white"
                  required
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-white/80 uppercase flex items-center tracking-widest">Username</span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  className={usernameInputClassName}
                />
                {!isUsernameValid && (
                  <span className="text-xs text-red-300">
                    Use only lowercase letters, numbers, and underscores.
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-white/80 uppercase flex items-center tracking-widest">Email</span>
                <input
                  type="email"
                  value={user?.email || ""}
                  className="bg-white/5 border border-white/20 px-3 py-2 text-gray-400 cursor-not-allowed"
                  disabled
                />
              </label>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-white/80 uppercase flex items-center tracking-widest">Mobile Number</span>
              <input
                type="text"
                name="mobilenumber"
                maxLength={10}
                value={formData.mobilenumber}
                disabled={!isMobileEditable}
                className={mobileInputClassName}
                placeholder="10-digit mobile number"
              />
              {!isMobileEditable && (
                <span className="text-xs text-gray-500">
                  Mobile number changes are disabled.
                </span>
              )}
            </label>


            <label className="flex flex-col gap-1 ">
              <span className="text-sm font-semibold text-white/80 uppercase flex items-center tracking-widest">Bio</span>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                maxLength={500}
                rows={5}
                className="bg-transparent border border-white/30 px-3 py-2 h-70 outline-none focus:border-white resize-y"
                placeholder="Tell others about your work..."
              />
              <span className="text-xs text-gray-500 text-right">
                {formData.bio.length}/500
              </span>
            </label>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={!hasChanges || isSaving}
                className="px-4 py-2 border border-white/30 text-sm hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={isSaving || !hasChanges}
                className="px-5 py-2 bg-white text-black font-medium text-sm hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;