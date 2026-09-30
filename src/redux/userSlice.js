import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: "user",
    initialState: {
        user: null,
        isLoading: true, // ✅ Track if we're still loading user from localStorage
    },
    reducers: {
        setUserData: (state, action) => {
            state.user = action.payload;
            state.isLoading = false; // ✅ Mark as loaded
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        }
    }
});

export const { setUserData, setLoading } = userSlice.actions;

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDM4ODNmYjFiYWU0M2I3YjZjMDg4NiIsInJvbGUiOiJwaG90b2dyYXBoZXIiLCJpYXQiOjE3NzU2MzA4MjUsImV4cCI6MTc3NTYzMTcyNSwiaXNzIjoibmVvbi1sZW5zIn0.Zy1OYIyYXmkLWNM_9KdcZ811Rhsm7dpexAXegw8f82M