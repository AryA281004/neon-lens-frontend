import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PillNav from './PillNav'
import '../styles/navbarLanding.css'


const NavbarInLandingPage = () => {
  const navigate = useNavigate()
  const [searchFocus, setSearchFocus] = useState(false)

  const handleSignupAndSignin = () => {
    navigate('/account')
  }

  return (
    <motion.nav 
      className='fixed top-0 left-1/2 mt-4 -translate-x-1/2 h-20 w-[90vw] border border-white/20 bg-white/10 backdrop-blur-lg rounded-full  flex items-center  justify-between px-10 z-50 shadow-lg'
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo Section */}
      <div className='flex items-center gap-2.5 cursor-pointer'>
        <motion.div 
          className='flex flex-col'
          whileHover={{ scale: 1.05 }}
        >
          <h1 className='logo-p1 text-3xl'>Neon</h1>
          <h1 className='logo-p2 text-2xl'>Lens</h1>
        </motion.div>
      </div>

{/* Navigation Pills */}
<div className='flex-1 flex items-center justify-center'>
      <PillNav
        items={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
          
          { label: 'Blog', href: '/blog' },
          { label: 'FAQ', href: '/faq' }
        ]}
        activeHref="/"
        className="custom-nav"
        ease="power2.easeOut"
        baseColor="#000000"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#000000"
        initialLoadAnimation
      />
</div>
      

      {/* Actions Section */}
      <div className='flex items-center gap-4'>
        <motion.button
          onClick={handleSignupAndSignin}
          className='btn-login'
          
          whileTap={{ scale: 0.95 }}
        >
          Login
        </motion.button>
        <motion.button
          onClick={handleSignupAndSignin}
          className='btn-signup'
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign Up
        </motion.button>
      </div>
    </motion.nav>
  )
}

export default NavbarInLandingPage