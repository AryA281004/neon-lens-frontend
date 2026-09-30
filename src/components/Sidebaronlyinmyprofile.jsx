import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

// This sidebar is intended for profile-owned pages and is fixed on the right side.
const menuItems = [
  { icon: 'https://cdn.lordicon.com/kthelypq.json', label: 'Profile', tab: 'profile' },
  { icon: 'https://cdn.lordicon.com/lbcxnxti.json', label: 'Dashboard', tab: 'dashboard' },
  { icon: 'https://cdn.lordicon.com/tsrgicte.json', label: 'Projects', tab: 'projects' },
  { icon: 'https://cdn.lordicon.com/fwkrbvja.json', label: 'Equipments', tab: 'equipment' },
  { icon: 'https://cdn.lordicon.com/wjyqkiew.json', label: 'Inspiration', tab: 'inspiration' },
]

const Sidebaronlyinmyprofile = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://cdn.lordicon.com/lordicon.js"]')
    if (existingScript) return

    const script = document.createElement('script')
    script.src = 'https://cdn.lordicon.com/lordicon.js'
    document.body.appendChild(script)
  }, [])

  const activeTab = String(new URLSearchParams(location.search).get('tab') || 'profile')
    .trim()
    .toLowerCase()

  const isActive = (tab) => activeTab === tab

  const getTabLink = (tab) => ({
    pathname: '/profile/me',
    search: tab === 'profile' ? '' : `?tab=${tab}`,
  })

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        className='fixed right-0 top-0 h-screen pb-4 z-40 hidden lg:flex flex-col justify-between px-4 py-8'
        style={{ width: isExpanded ? '250px' : '102px' }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        transition={{ duration: 0.4, type: 'spring', stiffness: 150, damping: 25 }}
      >
        {/* Logo */}
        

        {/* Menu Items */}
        <motion.nav 
        initial={{ x: 10 }}
                animate={{ opacity: isExpanded ? 1 : 1,  x: isExpanded ? 0 : 10 }}
                
                style={{ pointerEvents: isExpanded ? 'auto' : 'none' }}
        className='flex-1 flex flex-col gap-3 justify-center items-end'>
          {menuItems.map((item) => (
            <Link
              key={item.tab}
              to={getTabLink(item.tab)}
              className={`flex flex-row-reverse items-center justify-end gap-2 px-4 py-2 rounded-lg transition-all relative w-full ${
                isActive(item.tab)
                 
  ? 'bg-white/10 backdrop-blur-md border-1.2 border-white/20'
  : 'hover:bg-white/15 hover:backdrop-blur-2xl hover:border-1.2 hover:border-white/20'
              }`}
              title={!isExpanded ? item.label : ''}
            >
              <motion.span
              initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : 10 }}
                transition={{ duration: 0.2 }}
                style={{ pointerEvents: isExpanded ? 'auto' : 'none' }}
                
                className='use-font tracking-wider text-white text-base font-medium whitespace-nowrap text-right'
              >
                {item.label}
              </motion.span>

              <lord-icon
                src={item.icon}
                trigger="loop"
                stroke="bold"
                state="loop-cycle"
                
                delay="2000"
                colors="primary:#ffffff,secondary:#ffffff"
                style={{ width: '30px', height: '30px', flexShrink: 0 }}
              ></lord-icon>
            </Link>
          ))}
        </motion.nav>
      </motion.div>

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
            className='fixed right-0 top-0 h-screen w-64 bg-black flex flex-col px-4 py-8 border-l border-white/10'
            onClick={(e) => e.stopPropagation()}
            initial={{ x: 256 }}
            animate={{ x: 0 }}
          >
            {/* Logo */}
            <div className='flex items-center justify-end cursor-pointer mb-8'>
              <div className='flex flex-col text-right'>
                <h1 className='logo-p1 text-3xl text-white'>Neon</h1>
                <h1 className='logo-p2 text-2xl text-white'>Lens</h1>
              </div>
            </div>

            {/* Menu Items */}
            <nav className='flex-1 flex flex-col gap-2'>
              {menuItems.map((item) => (
                <Link
                  key={item.tab}
                  to={getTabLink(item.tab)}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-end gap-4 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.tab)
                      ? 'bg-white/10 border border-white/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className='use-font tracking-wider text-white text-base font-medium text-right'>
                    {item.label}
                  </span>
                  <lord-icon
                    src={item.icon}
                    trigger='loop'
                    delay='4500'
                    colors='primary:#ffffff'
                    style={{ width: '28px', height: '28px' }}
                  ></lord-icon>
                </Link>
              ))}
            </nav>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

export default Sidebaronlyinmyprofile