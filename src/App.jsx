import React, { useEffect } from 'react'
import './index.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData, setLoading } from './redux/userSlice'
import { startAutoRefreshToken, stopAutoRefreshToken, issueSwitchToken } from './api/api.js'
import { addSavedAccount, getSavedAccounts } from './utils/accountSwitch.js'
import SmoothScrollWrapper from './utils/LenisSetup'
import MainLayout from './layouts/MainLayout'
import LandingLayout from './layouts/LandingLayout'



const LandingPage = React.lazy(() => import('./pages/LandingPage'))
const AuthPage = React.lazy(() => import('./pages/AuthPage'))
const About = React.lazy(() => import('./pages/pagebeforeauth/About'))
const FAQ = React.lazy(() => import('./pages/pagebeforeauth/FAQ'))
const Contact = React.lazy(() => import('./pages/pagebeforeauth/Contact'))
const Blog = React.lazy(() => import('./pages/pagebeforeauth/Blog'))

const HomePage = React.lazy(() => import('./pages/HomePage'))
const GalleryPage = React.lazy(() => import('./pages/GalleryPage'))
const MessagePage = React.lazy(() => import('./pages/MessagePage'))
const SearchPage = React.lazy(() => import('./pages/SearchPage'))
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'))
const CreatePage = React.lazy(() => import('./pages/CreatePage'))
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'))
const ActivityPage = React.lazy(() => import('./pages/Activity'))
const SavedPage = React.lazy(() => import('./pages/Saved'))
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'))
const ReportPage = React.lazy(() => import('./pages/ReportPage'))

const App = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.user)

  // Load user from localStorage on app startup
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        dispatch(setUserData(user))
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error)
        localStorage.removeItem('user')
        dispatch(setLoading(false)) // ✅ Mark loading complete even if parse fails
      }
    } else {
      dispatch(setLoading(false)) // ✅ Mark loading complete (no user)
    }
  }, [dispatch])

  // Start/stop auto-refresh based on user login state
  useEffect(() => {
    if (user) {
      startAutoRefreshToken(); // ✅ User logged in - start refreshing
      console.log('🕐 Auto-refresh started');
    } else {
      stopAutoRefreshToken(); // ✅ User logged out - stop refreshing
      console.log('⏸️ Auto-refresh stopped');
    }

    return () => {
      stopAutoRefreshToken(); // Cleanup on unmount
    };
  }, [user])

  // Ensure the logged-in account is also saved for quick switching
  useEffect(() => {
    const syncSwitchToken = async () => {
      if (!user) return;
      const saved = getSavedAccounts();
      const alreadySaved = saved.some((account) => account.id === user.id);

      if (!alreadySaved) {
        try {
          const data = await issueSwitchToken();
          if (data?.switchToken) {
            addSavedAccount({
              id: user.id,
              username: user.username,
              email: user.email,
              switchToken: data.switchToken,
            });
          }
        } catch (error) {
          console.warn('Could not issue switch token for current user:', error?.message || error);
        }
      }
    };

    syncSwitchToken();
  }, [user]);

  return (
    <SmoothScrollWrapper>
      <div>
        <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 8000,
          style: {
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "12px",
            padding: "12px 16px",
          },
        }}
      />

        
        <Routes>
          {/* Public Routes (without sidebar) */}
          <Route path="/account" element={<AuthPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<LandingLayout><About /></LandingLayout>} />
          <Route path="/blog" element={<LandingLayout><Blog /></LandingLayout>} />
          <Route path="/contact" element={<LandingLayout><Contact /></LandingLayout>} />
          <Route path="/faq" element={<LandingLayout><FAQ /></LandingLayout>} />

          {/* Protected Routes (with MainLayout sidebar) */}
          <Route path="/home" element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="/create" element={<MainLayout><CreatePage /></MainLayout>} />
          <Route path="/gallery" element={<MainLayout><GalleryPage /></MainLayout>} />
          <Route path="/messages" element={<MainLayout><MessagePage /></MainLayout>} />
          <Route path="/search" element={<MainLayout><SearchPage /></MainLayout>} />
          <Route path="/activity" element={<MainLayout><ActivityPage /></MainLayout>} />
          <Route path="/saved" element={<MainLayout><SavedPage /></MainLayout>} />
          <Route path="/notifications" element={<MainLayout><NotificationsPage /></MainLayout>} />
          <Route path="/report" element={<MainLayout><ReportPage /></MainLayout>} />
          <Route path="/profile" element={<Navigate to="/profile/me" replace />} />
          <Route path="/profile/me" element={<MainLayout><ProfilePage /></MainLayout>} />
          <Route path="/profile/edit" element={<Navigate to="/settings/edit" replace />} />
          <Route path="/profile/:username" element={<MainLayout><ProfilePage /></MainLayout>} />
          <Route path="/settings/edit" element={<MainLayout><SettingsPage /></MainLayout>} />

        </Routes>
      </div>
    </SmoothScrollWrapper>
  )
}

export default App