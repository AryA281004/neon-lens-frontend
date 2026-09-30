import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from '../components/Login'
import Register from '../components/Register'
import BackgroundBeams from '../components/BackgroundBeams'

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login')
  const user = useSelector((state) => state.user.user)
  const isLoading = useSelector((state) => state.user.isLoading)
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const isAddAccountMode = searchParams.get('add') === 'true'

  // ✅ Redirect to home if already logged in, unless we are adding another account
  useEffect(() => {
    if (!isLoading && user && !isAddAccountMode) {
      navigate('/home')
    }
  }, [user, isLoading, navigate, isAddAccountMode])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { duration: 0.7, type: 'spring', stiffness: 100 }
    }
  }

  const tabVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  }

  return (
    <motion.div 
      className="w-full relative min-h-screen flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background */}
      <BackgroundBeams className="opacity-80" />

      {/* Subtle radial depth (instead of orbs) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />

      <motion.div 
        className="relative z-10 w-full max-w-sm px-5 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div 
          className="text-center"
          variants={logoVariants}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            
            <h1 className="text-5xl text-white tracking-wider">
              NeonLens
            </h1>
          </div>

          <motion.p 
            className="text-sm text-slate-400 tracking-widest uppercase font-semibold"
            variants={itemVariants}
          >
            Your Vision, Your Lens
          </motion.p>

          <motion.div
            className="h-0.5 w-16 mx-auto mt-3 bg-linear-to-r from-transparent via-white/50 to-transparent rounded-full"
            variants={itemVariants}
          />
        </motion.div>

        {/* Tabs */}
        <motion.div 
          className="
            bg-black
            border-4 border-white
            shadow-[10px_10px_0_rgb(255,255,255)]
            flex
            relative
            p-1
          "
          variants={itemVariants}
        >
          {/* Sliding background */}
          <motion.div
            className="
              absolute
              top-1
              bottom-1
              w-[calc(50%-4px)]
              bg-white
              
            "
            animate={{ left: activeTab === 'login' ? '4px' : '50%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ zIndex: 0 }}
          />

          {/* Sign In */}
          <motion.button
            className={`flex-1 py-2 px-6 text-sm font-bold uppercase tracking-wider relative z-10 transition-all ${
              activeTab === 'login'
                ? 'text-black'
                : 'text-slate-400 hover:text-slate-300'
            }`}
            onClick={() => setActiveTab('login')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign In
          </motion.button>

          {/* Sign Up */}
          <motion.button
            className={`flex-1 py-2 px-6 text-sm font-bold uppercase tracking-wider relative z-10 transition-all ${
              activeTab === 'register'
                ? 'text-black'
                : 'text-slate-400 hover:text-slate-300'
            }`}
            onClick={() => setActiveTab('register')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign Up
          </motion.button>
        </motion.div>

        {/* Form */}
        <motion.div 
          className="
            bg-black
            border-4 border-white
            shadow-[10px_10px_0_rgb(255,255,255)]
            flex flex-col
            relative
          "
          variants={itemVariants}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="p-6"
            >
              {activeTab === 'login' && (
                <Login onSwitchTab={() => setActiveTab('register')} />
              )}
              {activeTab === 'register' && (
                <Register onSwitchTab={() => setActiveTab('login')} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="m-5  text-center"
          variants={itemVariants}
        >
          <p className="text-xs text-slate-500 tracking-widest uppercase">
            Powered by NeonLens • <span className="text-cyan-400">Premium Vision Technology</span>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default AuthPage