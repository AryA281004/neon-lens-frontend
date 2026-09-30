import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { logoutUser, stopAutoRefreshToken } from '../api/api'
import { setUserData } from '../redux/userSlice'
import MoreMenu from './MoreMenu'
import { useMessageStore } from '../store/messageStore'
import { lockScroll, unlockScroll } from '../utils/scrollLock'

import NotificationsPanel from './NotificationsPanel'
import SwitchAccountsModal from './SwitchAccountsModal'

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false) // ✅ Hover state for desktop
  const [isMenuOpen, setIsMenuOpen] = useState(false) // ✅ Track if MoreMenu is open
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [isSwitchAccountsOpen, setIsSwitchAccountsOpen] = useState(false);
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.user)
  const messageUnreadCount = useSelector(
    (state) => state.notification?.messageUnreadCount || 0,
  );
  const notificationUnreadCount = useSelector(
    (state) => state.notification?.notificationUnreadCount || 0,
  );
  const conversationUnreadCount = useMessageStore((state) => {
    const currentUserId = state.currentUserId;
    return state.conversations.reduce((sum, conversation) => {
      return sum + (Number(conversation?.unreadCount?.[currentUserId] || 0));
    }, 0);
  });
  const messageBadgeCount = Math.max(messageUnreadCount, conversationUnreadCount);



  useEffect(() => {
    // Load Lord Icon from CDN
    const script = document.createElement('script')
    script.src = 'https://cdn.lordicon.com/lordicon.js'
    document.body.appendChild(script)
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUser()
      stopAutoRefreshToken()
      dispatch(setUserData(null))
      localStorage.removeItem('user')
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  

  const menuItems = [
    { icon: 'https://cdn.lordicon.com/oeotfwsx.json', label: 'Home', path: '/home' },
    { icon: 'https://cdn.lordicon.com/fvgfpgpu.json', label: 'Gallery', path: '/gallery' },
    { icon: 'https://cdn.lordicon.com/bpptgtfr.json', label: 'Messages', path: '/messages', badge: 'message' },
    { icon: 'https://cdn.lordicon.com/xaekjsls.json', label: 'Search', path: '/search' },
              { icon: 'https://cdn.lordicon.com/ahxaipjb.json', label: 'Notifications', path: null},

    { icon: 'https://cdn.lordicon.com/gzqofmcx.json', label: 'Create', path: '/create' },
    { icon: 'https://cdn.lordicon.com/kthelypq.json', label: 'Profile', path: '/profile/me' },
  ]

  const handleNotificationsClick = () => {
    setIsNotifPanelOpen(true);
  };

  const closeNotifPanel = () => {
    setIsNotifPanelOpen(false);
    if (location.pathname === '/notifications') {
      navigate('/home');
    }
  };

  useEffect(() => {
    if (location.pathname === '/notifications') {
      setIsNotifPanelOpen(true);
    }
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    if (!isNotifPanelOpen) return undefined

    lockScroll()
    return () => {
      unlockScroll()
    }
  }, [isNotifPanelOpen])

  const handleNeonLensClick = () => {
      navigate('/home')
  };

  return (
    <>
      {/* Desktop Sidebar - Fixed Width, Text on Hover */}
      
      <motion.div
        className='fixed left-0 top-0 h-screen   pb-4 z-40 hidden lg:flex flex-col justify-between  px-4 py-8'
        style={{ width: isExpanded ? '250px' : '102px' }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          // Don't collapse if menu is open
          if (!isMenuOpen) {
            setIsExpanded(false)
          }
        }}
        transition={{ duration: 0.3 ,type: 'spring', stiffness: 50 , damping:25 }}
      >
        {/* Logo */}
        <div className='flex items-center gap-2  mb-8'>
          <div className='flex items-center gap-2 cursor-pointer'>
            <div
              onClick={handleNeonLensClick} 
              className='flex flex-col'>
              <h1 className='logo-p1 text-3xl'>Neon</h1>
              <h1 className='logo-p2 text-2xl'>Lens</h1>
            </div>
            <motion.div
              animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
              transition={{ duration: 0.2 }}
              style={{ pointerEvents: isExpanded ? 'auto' : 'none' }}
            >
            </motion.div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className='flex-1 flex flex-col gap-3  justify-center '>
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.path ? (
                    <Link
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all  relative ${
                    isActive(item.path)
                      ? 'bg-white/15 backdrop-blur-2xl '
                      : 'hover:bg-white/15 hover:backdrop-blur-2xl hover:border-1.2 hover:border-white/20'
                  }`}
                      title={!isExpanded ? item.label : ''}
                    >

                  {/* red badge for notifications */}
                  {item.badge === 'message' && (notificationUnreadCount > 0 || messageBadgeCount > 0) && (
                    <span className="absolute -top-0 -right-0 min-h-[18px] min-w-[18px] rounded-full bg-white px-1.5 text-[10px] font-semibold text-white flex items-center justify-center border border-white/30">
                      {notificationUnreadCount > 0 ? notificationUnreadCount : messageBadgeCount}
                    </span>
                  )}
                  
                  <lord-icon

                    src={item.icon}
                    trigger="hover"
                    colors="primary:#ffffff"
                    style={{ width: '28px', height: '28px', flexShrink: 0 }}>
                  </lord-icon>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
                    transition={{ duration: 0.2 }}
                    style={{ pointerEvents: isExpanded ? 'auto' : 'none' }}
                    className='use-font tracking-wider text-white text-base font-medium whitespace-nowrap'>
                    {item.label}
                  </motion.span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleNotificationsClick}
                  className={`flex w-full items-center gap-2 px-4 py-2 rounded-lg transition-all relative ${
                    isNotifPanelOpen
                      ? 'bg-white/15 backdrop-blur-2xl'
                      : 'hover:bg-white/15 hover:backdrop-blur-2xl hover:border-1.2 hover:border-white/20'
                  }`}
                  title={!isExpanded ? item.label : ''}
                >
                  <div className='relative'>
                    <lord-icon
                      src={item.icon}
                      trigger="hover"
                      colors="primary:#ffffff"
                      style={{ width: '28px', height: '28px', flexShrink: 0 }}>
                    </lord-icon>
                    {item.badge === 'message' && (notificationUnreadCount > 0 || messageBadgeCount > 0) && (
                      <span className="absolute -top-0 -right-0 min-h-[18px] min-w-[18px] rounded-full bg-white px-1.5 text-[10px] font-semibold text-black flex items-center justify-center border border-white/30">
                        {notificationUnreadCount > 0 ? notificationUnreadCount : messageBadgeCount}
                      </span>
                    )}
                  </div>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
                    transition={{ duration: 0.2 }}
                    style={{ pointerEvents: isExpanded ? 'auto' : 'none' }}
                    className='use-font tracking-wider text-white text-base font-medium whitespace-nowrap'>
                    {item.label}
                  </motion.span>
                </button>
              )}
            </div>
          ))}
        </nav>


        {/* more Button */}
        <div>
          <MoreMenu 
            onMenuOpenChange={setIsMenuOpen}
            onMenuClose={() => setIsExpanded(false)}
            onSwitchAccounts={() => setIsSwitchAccountsOpen(true)}
          />
        </div>
      </motion.div>

      {/* Notification right slide panel */}
      <AnimatePresence>
        {isNotifPanelOpen && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60"
              onClick={closeNotifPanel}
            />
            <motion.div
              data-lenis-prevent
              className="absolute right-0 top-0 h-full overflow-hidden touch-pan-y"
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
            >
              <div className="h-full w-[320px] flex flex-col touch-pan-y">
                <div className="flex items-center justify-between p-3 border-b border-white/10 bg-gray-900/70 backdrop-blur">
                  <div className="text-white font-semibold">Notifications</div>
                  <button
                    type="button"
                    onClick={closeNotifPanel}
                    className="text-white/80 hover:text-white bg-white/10 border border-white/20 rounded-full h-8 w-8 flex items-center justify-center"
                    aria-label="Close notifications"
                  >
                    <lord-icon
    src="https://cdn.lordicon.com/ebyacdql.json"
    trigger="hover"
    state="hover-cross-2"
    colors="primary:#ffffff"
    style={{ width: '40px', height: '40px' }}>
</lord-icon>
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <NotificationsPanel />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Toggle */}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className='fixed bottom-6 right-6 lg:hidden z-40 bg-white/10 border border-white/20 rounded-full p-4 text-white text-2xl'
      >
        ☰
      </button>

      {/* Mobile Sidebar */}
      {isOpen && (
        <motion.div
          className='fixed inset-0 bg-black/80 lg:hidden z-30'
          onClick={() => setIsOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className='fixed left-0 top-0 h-screen w-64 bg-black flex flex-col px-4 py-8 border-r border-white/10'
            onClick={(e) => e.stopPropagation()}
            initial={{ x: -256 }}
            animate={{ x: 0 }}
          >

            {/* Logo */}
            <div className='flex items-center gap-2.5 cursor-pointer'>
                  <motion.div 
                    className='flex flex-col'
                    
                  >
                    <h1 className='logo-p1 text-3xl text-white'>Neon</h1>
                    <h1 className='logo-p2 text-2xl text-white'>Lens</h1>
                  </motion.div>
                </div>

            {/* Menu Items */}
            <nav className='flex-1 flex flex-col gap-2'>
              {menuItems.map((item) => (
                <div key={item.label}>
                  {item.path ? (
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                        isActive(item.path)
                          ? 'bg-white/10 border border-white/20'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <lord-icon
                        src={item.icon}
                        trigger='loop'
                        delay="4500"
                        colors="primary:#ffffff"
                        style={{ width: '28px', height: '28px' }}
                      ></lord-icon>
                      <span className='use-font tracking-wider text-white text-base font-medium'>
                        {item.label}
                      </span>
                    </Link>
                  ) : (
                    <button
                      type='button'
                      onClick={() => {
                        setIsNotifPanelOpen(true);
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                        isNotifPanelOpen
                          ? 'bg-white/15 backdrop-blur-2xl'
                          : 'hover:bg-white/15 hover:border-1.2 hover:border-white/20'
                      }`}
                    >
                      <div className='relative'>
                        <lord-icon
                          src={item.icon}
                          trigger='loop'
                          delay="4500"
                          colors="primary:#ffffff"
                          style={{ width: '28px', height: '28px' }}
                        ></lord-icon>
                        {item.badge === 'message' && (notificationUnreadCount > 0 || messageBadgeCount > 0) && (
                          <span className="absolute -top-0 -right-0 min-h-[18px] min-w-[18px] rounded-full bg-white px-1.5 text-[10px] font-semibold text-black flex items-center justify-center border border-white/30">
                            {notificationUnreadCount > 0 ? notificationUnreadCount : messageBadgeCount}
                          </span>
                        )}
                      </div>
                      <span className='use-font tracking-wider text-white text-base font-medium'>
                        {item.label}
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </nav>


            {/*More Button */}
            <div className='p-4'>
              <MoreMenu 
                onMenuOpenChange={setIsMenuOpen}
                onMenuClose={() => setIsExpanded(false)}
                onSwitchAccounts={() => setIsSwitchAccountsOpen(true)}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
      <SwitchAccountsModal
        isOpen={isSwitchAccountsOpen}
        onClose={() => setIsSwitchAccountsOpen(false)}
      />
    </>
  )
}

export default SideBar