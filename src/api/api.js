import axios from "axios";

const API_BASE_URL = process.env.BACKEND_URL || "https://api.aryandudhat.qd.je/api"; // Default to localhost if not set

// 🔐 Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true // ✅ Automatically send cookies (access token + refresh token)
});

// 🔄 Response interceptor - handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint - cookies sent automatically with withCredentials
        // Server will set new accessToken cookie automatically
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
          withCredentials: true
        });

        // Retry original request (new accessToken now in cookie)
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('user');
        window.location.href = '/account';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


// 🔐 AUTH API FUNCTIONS
export const loginUser = async (identifier, password) => {
  try {
    const response = await apiClient.post('/auth/login', { identifier, password });
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "Network error";
    throw new Error(message);
  }
};

export const registerUser = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/register', { email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const requestOtp = async (email) => {
  try {
    const response = await apiClient.post('/auth/register-otp', { email });
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "Network error";
    throw new Error(message);
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await apiClient.post('/auth/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "Network error";
    throw new Error(message);
  }
};

export const completeRegistration = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "Network error";
    throw error;
  }
};

export const checkUsernameAvailability = async (username) => {
  try {
    const response = await apiClient.post('/auth/check-username', { username });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "Network error";
    throw new Error(message);
  }
};

export const issueSwitchToken = async () => {
  try {
    const response = await apiClient.post('/auth/issue-switch-token');
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "Network error";
    throw new Error(message);
  }
};

export const switchAccount = async (switchToken) => {
  try {
    const response = await apiClient.post('/auth/switch-account', { switchToken });
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "Network error";
    throw new Error(message);
  }
};


// 📸 POST API FUNCTIONS
export const createPost = async (postData) => {
  try {
    const formData = new FormData();
    formData.append('image', postData.image);
    formData.append('caption', postData.caption);
    formData.append('category', postData.category);
    formData.append('location', postData.location || '');
    formData.append('tags', JSON.stringify(postData.tags));

    const response = await apiClient.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllPosts = async (page = 1, limit = 10, category = null) => {
  try {
    let url = `/posts?page=${page}&limit=${limit}`;
    if (category && category !== 'all') {
      url += `&category=${category}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserPosts = async (userId, page = 1, limit = 10) => {
  try {
    const response = await apiClient.get(`/posts/user/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSavedPosts = async (page = 1, limit = 12, category = null, query = "") => {
  try {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));

    if (category && category !== "all") {
      params.set("category", category);
    }

    if (query && String(query).trim()) {
      params.set("q", String(query).trim());
    }

    const response = await apiClient.get(`/posts/saved?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPostById = async (postId) => {
  try {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePost = async (postId, postData) => {
  try {
    const response = await apiClient.put(`/posts/${postId}`, postData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const recordPostView = async (postId) => {
  try {
    const response = await apiClient.post(`/posts/${postId}/view`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const likePost = async (postId) => {
  try {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const savePost = async (postId) => {
  try {
    const response = await apiClient.post(`/posts/${postId}/save`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sharePost = async (postId, recipientIds = []) => {
  try {
    const response = await apiClient.post(`/posts/${postId}/share`, {
      recipientIds,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addComment = async (postId, text) => {
  try {
    const response = await apiClient.post(`/posts/${postId}/comment`, { text });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteComment = async (postId, commentId) => {
  try {
    const response = await apiClient.delete(`/posts/${postId}/comment/${commentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchPosts = async (query, page = 1, limit = 10, category = null) => {
  try {
    let url = `/posts/search?q=${query}&page=${page}&limit=${limit}`;
    if (category && category !== 'all') {
      url += `&category=${category}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchUsers = async (query = "", options = {}) => {
  try {
    const {
      page = 1,
      limit = 12,
      role,
    } = options;

    const params = new URLSearchParams();

    if (query?.trim()) params.set("q", query.trim());
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    if (role) params.set("role", String(role));

    const queryString = params.toString();
    const url = queryString ? `/search/users?${queryString}` : "/search/users";
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};


//User API functions
export const getMyUserDetails = async () => {
  try {
    const response = await apiClient.get('/users/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateMyUserDetails = async (userData) => {
  try {
    const response = await apiClient.put('/users/me', userData);
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "Network error";
    throw new Error(message);
  }
};

export const getUserDetailsById = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserDetailsByUsername = async (username) => {
  try {
    const normalizedUsername = String(username || "")
      .trim()
      .replace(/^@+/, "")
      .toLowerCase();

    if (!normalizedUsername) {
      throw new Error("Username is required");
    }

    const response = await apiClient.get(
      `/users/username/${encodeURIComponent(normalizedUsername)}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserPostsCount = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User id is required for posts count")
    }

    const response = await apiClient.get(`/users/${userId}/posts/count`);
    return response.data;
  } catch (error) {
    throw error;
  }
};



//Follow API functions
export const followUser = async (userId) => {
  try {
    const response = await apiClient.post(`/follow/follow/${userId}`);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const unfollowUser = async (userId) => {
  try {
    const response = await apiClient.post(`/follow/unfollow/${userId}`);
    return response.data;
  }
  catch (error) {
    throw error;
    }
};

export const getFollowers = async (userId, page = 1, limit = 12) => {
  try {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    const response = await apiClient.get(`/follow/followers/${userId}?${params.toString()}`);
    return response.data;
  }
  catch (error) {
    throw error;
  }
}

export const getFollowing = async (userId, page = 1, limit = 12) => {
  try {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    const response = await apiClient.get(`/follow/following/${userId}?${params.toString()}`);
    return response.data;
  }
  catch (error) {
    throw error;
  }
}

export const getFollowersCount = async (userId) => {
  try {
    const response = await apiClient.get(`/follow/followers/${userId}/count`);
    return response.data;
  }
  catch (error) {
    throw error;
  }
}

export const getFollowingCount = async (userId) => {
  try {
    const response = await apiClient.get(`/follow/following/${userId}/count`);
    return response.data;
  }
  catch (error) {
    throw error;
  }
}

// Activity API functions
export const getMyActivity = async ({ page = 1, limit = 20, types } = {}) => {
  try {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (Array.isArray(types) && types.length > 0) {
      params.set('types', types.join(','));
    }

    const queryString = params.toString();
    const url = queryString ? `/activity?${queryString}` : '/activity';
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const getMyNotifications = async ({ page = 1, limit = 20, types } = {}) => {
  try {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (Array.isArray(types) && types.length > 0) {
      params.set('types', types.join(','));
    }

    const queryString = params.toString();
    const url = queryString ? `/notifications?${queryString}` : '/notifications';
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const markAllNotificationsRead = async () => {
  try {
    const response = await apiClient.patch('/notifications/mark-all-read');
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Dashboard API functions
export const getOverallAccountDashboard = async (days = 60) => {
  try {
    const safeDays = Math.min(Math.max(Number(days) || 60, 7), 90);
    const response = await apiClient.get(`/dashboard/overall-account?days=${safeDays}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const getTrendingTopics = async () => {
  try {
    const response = await apiClient.get('/posts/trending');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDashboard = async (days = 14) => {
  const res = await axios.get(`/api/dashboard?days=${days}`, {
    withCredentials: true,
  });
  return res.data.dashboard;
};

export const checkIfFollowing = async (userId) => {
  try {
    const response = await apiClient.get(`/follow/check-following/${userId}`);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};



//Edit Profile API functions
export const editUserName = async (newUsername) => {
  try {
    const response = await apiClient.put('/settings/edit/username', { username: newUsername });
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "Network error";
    throw new Error(message);
  }
};

export const editFirstName = async (newFirstName) => {
  try {
    const response = await apiClient.put('/settings/edit/firstName', { firstName: newFirstName });
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "Network error";
    throw new Error(message);
  }
};

export const editLastName = async (newLastName) => {
  try {
    const response = await apiClient.put('/settings/edit/lastName', { lastName: newLastName });
    return response.data;
  }
 catch (error) {
    const message = error?.response?.data?.message || error?.message || "Network error";
    throw new Error(message);
  }
};

export const editBio = async (newBio) => {
  try {
    const response = await apiClient.put('/settings/edit/bio', { bio: newBio });
    return response.data;
  }
  catch (error) {
    const message = error?.response?.data?.message || error?.message || "Network error";
    throw new Error(message);
  }
};

export const editProfilePic = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profilePic', imageFile);

    const response = await apiClient.put('/settings/edit/profilePic', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "Network error";
    throw new Error(message);
  }
};

export const editEquipment = async (equipment) => {
  try {
    const response = await apiClient.put('/settings/edit/equipment', { equipment });
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "Network error";
    throw new Error(message);
  }
};

// Contact API functions
export const sendContactMessage = async (name, email, subject, message) => {
  try {
    const response = await apiClient.post('/contact/send-message', { name, email, subject, message });
    return response.data.message;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || "Network error";
    throw new Error(message);
  }
};




// 🔄 Proactively refresh access token (long-lived tokens - 1 year)
export const refreshAccessToken = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    // If refresh fails, logout user
    localStorage.removeItem('user');
    window.location.href = '/account';
    throw error;
  }
};

// 🕐 Start auto-refresh interval (refresh every 3 days - token lasts 7 days)
let refreshInterval = null;

export const startAutoRefreshToken = () => {
  if (refreshInterval) return; // Already running
  
  refreshInterval = setInterval(async () => {
    try {
      await refreshAccessToken();
      console.log('✅ Access token refreshed');
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      clearAutoRefreshToken();
    }
  }, 3 * 24 * 60 * 60 * 1000); // Refresh every 3 days
};

export const stopAutoRefreshToken = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

export const clearAutoRefreshToken = () => {
  stopAutoRefreshToken();
};

export default apiClient;


