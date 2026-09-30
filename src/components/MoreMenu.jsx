import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logoutUser, stopAutoRefreshToken } from '../api/api'
import { setUserData } from '../redux/userSlice'

const MoreMenu = ({ onMenuOpenChange, onSwitchAccounts }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const user = useSelector((state) => state.user.user)

  // Notify parent when menu opens/closes
  useEffect(() => {
    onMenuOpenChange?.(isOpen)
  }, [isOpen, onMenuOpenChange])

  const moreMenuItems = [
    { icon: 'https://cdn.lordicon.com/asyunleq.json', label: 'Settings', path: '/settings/edit' },
    { icon: 'https://cdn.lordicon.com/atzcyedn.json', label: 'Your activity', path: '/activity' },
    { icon: 'https://cdn.lordicon.com/olmrexol.json', label: 'Saved', path: '/saved' },
    { icon: 'https://cdn.lordicon.com/mudwpdhy.json', label: 'Switch appearance', action: 'toggle-theme' },
    { icon: 'https://cdn.lordicon.com/fedbzost.json', label: 'Report a problem', path: '/report' },
  ]

  const accountMenuItems = [
    { icon: 'https://cdn.lordicon.com/meaqueth.json', label: 'Switch accounts', action: 'switch' },
  ]

  const handleLogout = async () => {
    try {
      await logoutUser()
      stopAutoRefreshToken()
      dispatch(setUserData(null))
      localStorage.removeItem('user')
      navigate('/')
      setIsOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMenuItemClick = (item) => {
    if (item.path) {
      navigate(item.path)
      setIsOpen(false)
    } else if (item.action === 'toggle-theme') {
      // Add your theme toggle logic here
      console.log('Toggle theme')
      setIsOpen(false)
    } else if (item.action === 'switch') {
      onSwitchAccounts?.()
      setIsOpen(false)
    }
  }

  return (
    <div ref={menuRef} className='relative w-full'>
      {/* More Button - Your Custom Design */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full text-white py-2 rounded-lg font-medium transition flex gap-2'
      >
        <lord-icon
          src="https://cdn.lordicon.com/tewlfgbl.json"
          trigger="hover"
          colors="primary:#ffffff"
          style={{ width: '28px', height: '28px' }}>
        </lord-icon>
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          style={{ pointerEvents: 'auto' }}
          className='use-font tracking-wider text-white text-base font-medium whitespace-nowrap'>
          More
        </motion.span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='absolute right-0 mt-2 w-56 bg-white/15 backdrop-blur-sm border border-white/20 rounded-[40px] shadow-xl z-50 overflow-hidden '
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: -400, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {/* Main Menu Items */}
            <div className='py-2'>
              {moreMenuItems.map((item) => (
                <motion.button
                  key={item.label}
                  onClick={() => handleMenuItemClick(item)}
                  className='w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors text-left'
                  whileHover={{ x: 4 }}
                >
                  <lord-icon
                    src={item.icon}
                    trigger="hover"
                    colors="primary:#ffffff"
                    style={{ width: '28px', height: '28px' }}>
                  </lord-icon>
                  <span className='use-font tracking-wider text-sm font-medium'>{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Divider */}
            <div className='h-px bg-linear-to-r from-transparent via-white/50 to-transparent'></div>

            {/* Account Section */}
            <div className='py-2'>
              {accountMenuItems.map((item) => (
                <motion.button
                  key={item.label}
                  onClick={() => handleMenuItemClick(item)}
                  className='w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors text-left'
                  whileHover={{ x: 4 }}
                >
                  <lord-icon
                    src={item.icon}
                    trigger="hover"
                    colors="primary:#ffffff"
                    style={{ width: '20px', height: '20px' }}>
                  </lord-icon>
                  <span className='use-font tracking-wider text-sm font-medium'>{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Divider */}
              <div className='h-px bg-linear-to-r from-transparent via-white/50 to-transparent'></div>

            {/* Logout */}
            <div className='py-2'>
              <motion.button
                onClick={handleLogout}
                className='w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-left'
                whileHover={{ x: 4 }}
              >
                <lord-icon
                  src="https://cdn.lordicon.com/fdxqndij.json"
                  trigger="hover"
                  colors="primary:#ff6b6b"
                  style={{ width: '20px', height: '20px' }}>
                </lord-icon>
                <span className='text-sm font-medium'>Log out</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MoreMenu
