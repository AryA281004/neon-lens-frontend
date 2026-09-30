import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Load LordIcon library
if (typeof window !== 'undefined' && !window.lordIconLoaded) {
  const script = document.createElement('script')
  script.src = 'https://cdn.lordicon.com/lordicon.js'
  script.async = true
  document.body.appendChild(script)
  window.lordIconLoaded = true
}

const Topfollowerbar = ({ followingUsers = [], isLoading = false }) => {
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.user.user)
  const currentUsername = String(currentUser?.username || '').trim().toLowerCase()
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsToShow = 6

  useEffect(() => {
    if (currentIndex >= followingUsers.length) {
      setCurrentIndex(0)
    }
  }, [currentIndex, followingUsers.length])

  const handleNext = () => {
    if (currentIndex + itemsToShow < followingUsers.length) {
      setCurrentIndex(currentIndex + itemsToShow)
    }
  }

  const handlePrev = () => {
    if (currentIndex - itemsToShow >= 0) {
      setCurrentIndex(currentIndex - itemsToShow)
    }
  }

  const visibleFollowers = followingUsers.slice(currentIndex, currentIndex + itemsToShow)

  const handleViewProfile = (username) => {
    const normalizedUsername = String(username || '').trim().toLowerCase()
    if (!normalizedUsername) return

    if (normalizedUsername === currentUsername) {
      navigate('/profile/me')
      return
    }

    navigate(`/profile/${normalizedUsername}`)
  }

  return (
    <div className='w-[40vw] px-4'>
      {/* Follower Carousel - Like your image design */}
      <div className='relative flex items-center justify-center gap-8'>
        {/* Previous Button */}
        <motion.button
          onClick={handlePrev}
          disabled={currentIndex === 0 || followingUsers.length <= itemsToShow}
          className='absolute left-0 z-10 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full w-8 h-8 flex items-center justify-center transition text-lg'
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          ‹
        </motion.button>

        {/* Followers Container */}
        <div className='flex gap-6 justify-center px-16 min-h-24 items-center'>
          {isLoading && (
            <p className='text-xs text-cyan-300'>Loading following...</p>
          )}

          {!isLoading && followingUsers.length === 0 && (
            <p className='text-xs text-gray-400'>Follow creators to see them here.</p>
          )}

          <AnimatePresence mode='wait'>
            {visibleFollowers.map((follower, idx) => (
              <motion.div
                key={follower?._id || follower?.id || follower?.username}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className='flex flex-col items-center cursor-pointer group'
                role='button'
                tabIndex={0}
                onClick={() => handleViewProfile(follower?.username)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleViewProfile(follower?.username)
                  }
                }}
              >
                {/* Profile Picture with Gradient Border - Like your image */}
                <div className='relative w-20 h-20 mb-1 group-hover:scale-110 transition-transform duration-200'>
                  {/* Outer gradient border */}
                  <div 
                    className='absolute inset-0 rounded-full'
                    
                  >
                    {/* Inner background */}
                    <div className='w-full h-full rounded-full bg-transparent flex items-center justify-center'>
                      {/* Profile image */}
                      {follower?.profilePic ? (
                        <img
                          src={follower.profilePic}
                          alt={follower?.username || 'following-user'}
                          className='w-full h-full rounded-full object-cover p-0.5'
                        />
                      ) : (
                        <lord-icon
                          src='https://cdn.lordicon.com/spzqjmbt.json'
                          trigger='in'
                         
                          delay="500"
                          
                          state="in-reveal"
                          colors="primary:#ffffff"
                          style={{ width: '100%', height: '100%', borderRadius: '100%'}}
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Username */}
                <p className='text-white text-xs text-center truncate w-20'>
                  {follower?.username || 'user'}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Next Button */}
        <motion.button
          onClick={handleNext}
          disabled={currentIndex >= followingUsers.length - itemsToShow || followingUsers.length <= itemsToShow}
          className='absolute right-0 z-10 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full w-8 h-8 flex items-center justify-center transition text-lg'
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          ›
        </motion.button>
      </div>
    </div>
  )
}

export default Topfollowerbar