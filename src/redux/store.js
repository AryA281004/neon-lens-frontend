import { configureStore } from '@reduxjs/toolkit'
import { userSlice } from './userSlice'
import { activitySlice } from './activitySlice'
import { notificationSlice } from './notificationSlice'

export default configureStore({
  reducer: {
    user: userSlice.reducer,
    activity: activitySlice.reducer,
    notification: notificationSlice.reducer,
  },
})
