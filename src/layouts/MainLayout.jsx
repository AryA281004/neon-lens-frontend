import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import SideBar from '../components/SideBar.jsx'
import { connectSocket, getSocket } from '../utils/socket.js'
import { incrementNotificationUnread } from '../redux/notificationSlice.js'

const MainLayout = ({ children }) => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.user)

  useEffect(() => {
    if (!user) return;

    connectSocket();
    const socket = getSocket();

    const handleNotification = () => {
      dispatch(incrementNotificationUnread())
    }

    socket.on('notification:new', handleNotification)

    return () => {
      socket.off('notification:new', handleNotification)
    }
  }, [user, dispatch])

  return (
    <div className='w-full min-h-screen text-white flex items-center justify-between gap-8'>
      {/* Sidebar - renders ONCE for all pages */}
      <SideBar />
      
      {/* Main content area - pages render here */}
      <div className='flex-1 p-6'>
        {children}
      </div>
    </div>
  )
}

export default MainLayout
