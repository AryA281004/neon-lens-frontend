import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  isLoading: false,
  error: "",
  page: 1,
  limit: 20,
  total: 0,
  hasNextPage: false,
  lastFetchedAt: null,
};

const mergeUnique = (current, incoming) => {
  const merged = [...current];
  const seen = new Set(current.map((item) => item?.id));

  for (const item of incoming) {
    if (!item?.id || seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }

  return merged;
};

export const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    setActivityLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setActivityError: (state, action) => {
      state.error = action.payload || "";
    },
    setActivityItems: (state, action) => {
      const { items = [], pagination = {} } = action.payload || {};
      state.items = Array.isArray(items) ? items : [];
      state.page = Number(pagination.page || 1);
      state.limit = Number(pagination.limit || state.limit);
      state.total = Number(pagination.total || state.items.length);
      state.hasNextPage = Boolean(pagination.hasNextPage);
      state.lastFetchedAt = new Date().toISOString();
    },
    appendActivityItems: (state, action) => {
      const { items = [], pagination = {} } = action.payload || {};
      const incoming = Array.isArray(items) ? items : [];
      state.items = mergeUnique(state.items, incoming);
      state.page = Number(pagination.page || state.page);
      state.limit = Number(pagination.limit || state.limit);
      state.total = Number(pagination.total || state.total || state.items.length);
      state.hasNextPage = Boolean(pagination.hasNextPage);
      state.lastFetchedAt = new Date().toISOString();
    },
    resetActivity: () => ({ ...initialState }),
  },
});

export const {
  setActivityLoading,
  setActivityError,
  setActivityItems,
  appendActivityItems,
  resetActivity,
} = activitySlice.actions;
