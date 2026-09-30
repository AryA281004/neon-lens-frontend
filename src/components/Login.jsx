import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loginUser, issueSwitchToken } from '../api/api.js'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import { addSavedAccount } from '../utils/accountSwitch.js'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

const itemVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
}

const Login = ({ onSwitchTab }) => {
  const [formData, setFormData]         = useState({ identifier: '', password: '' })
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.identifier.trim())     { setError('Email, username, or mobile number is required'); return false }
    if (!formData.password)              { setError('Password is required'); return false }
    if (formData.password.length < 6)    { setError('Password must be at least 6 characters'); return false }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    try {
      const data = await loginUser(formData.identifier, formData.password)
      toast.success('Login successful!')
      // 🔒 Access token is in httpOnly cookie, no need to store
      // Optional: store user data if returned
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
        dispatch(setUserData(data.user))

        try {
          const tokenData = await issueSwitchToken();
          if (tokenData?.switchToken) {
            addSavedAccount({
              id: data.user.id,
              username: data.user.username,
              email: data.user.email,
              switchToken: tokenData.switchToken,
            });
          }
        } catch (error) {
          console.warn('Switch token issuance failed:', error?.message || error);
        }
      }
      setTimeout(() => navigate('/home'), 1500)
    } catch (err) {
      // Get exact error message from backend
      const errorMsg =  err?.response?.data?.message || err?.message || 'Login failed. Please try again.'
      setError(errorMsg)
      toast.error(errorMsg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
      
  /* ── shared input class — h-12 (48 px), matches Register ──────────────── */
const inputCls = `
    w-full h-12 px-4 text-sm
    bg-black border-2 border-white
    text-white placeholder-gray-500
    outline-none transition-all duration-300
    
    hover:-translate-y-1 hover:scale-[1.02]
    hover:shadow-[6px_6px_0_white]
  `

  return (
    <motion.form
      onSubmit={handleSubmit}
      className='flex flex-col overflow-visible'
      style={{ gap: '20px' }}
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >

      {/* ── Identifier (Email/Username/Mobile) ────────────────────────── */}
      <motion.div className='flex flex-col' style={{ gap: '6px' }} variants={itemVariants}>
        <label htmlFor='identifier' className='text-sm font-bold text-white uppercase tracking-widest'>
          Email, Username, or Mobile
        </label>
        <div className='relative flex justify-center'>
          <input
            id='identifier' type='text' name='identifier'
            value={formData.identifier} onChange={handleChange}
            placeholder='you@example.com or 9876543210' className={inputCls} disabled={loading}
          />
          
        </div>
      </motion.div>

      {/* ── Password ───────────────────────────────────────────────────── */}
      <motion.div className='flex flex-col' style={{ gap: '6px' }} variants={itemVariants}>
        <label htmlFor='password' className='text-sm font-bold text-white uppercase tracking-widest'>
          Password
        </label>
        <div className='relative flex justify-center'>
          <input
            id='password' type={showPassword ? 'text' : 'password'} name='password'
            value={formData.password} onChange={handleChange}
            placeholder='••••••••' className={inputCls} disabled={loading}
          />
          <motion.button
            type='button'
            className='absolute right-3.5 top-1/2 -translate-y-1/2 text-base leading-none disabled:cursor-not-allowed'
            onClick={() => setShowPassword(v => !v)} disabled={loading}
            whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </motion.button>
        </div>
      </motion.div>

      {/* ── Forgot password — sits between fields and bottom row ───────── */}
      <motion.div variants={itemVariants}>
        <a
          href='#'
          className='text-sm text-white/50 hover:text-white transition-colors duration-200'
        >
          Forgot password?
        </a>
      </motion.div>

      {/* ── Error alert ────────────────────────────────────────────────── */}
      <AnimatePresence mode='wait'>
        {error && (
          <motion.p
            key='error'
            className='flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/40 rounded-xl text-red-300 text-sm font-semibold'
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
          >
            ⚠️ {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Bottom row: CTA button + inline secondary link ─────────────── */}
      {/* mirrors screenshot: "Login" button left · "Don't have an account?" right */}
      <motion.div className='flex items-center gap-4' variants={itemVariants}>

        <motion.button
          type='submit'
          disabled={loading}
          className='h-12 px-8 text-sm font-bold text-black bg-white 
            hover:shadow-[4px_4px_0_rgb(255,255,255)] uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden'
          
          whileHover={{ scale: loading ? 1 : 1.03 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
        >
          {loading ? (
            <>
              <motion.span
                className='w-4 h-4 border-2 border-white border-t-transparent rounded-full'
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              Signing In…
            </>
          ) : (
            'Login'
          )}
        </motion.button>

        {/* plain-text secondary action — no border, no background */}
        <button
          type='button'
          onClick={onSwitchTab}
          className='text-sm text-slate-400 hover:text-white transition-colors duration-200 whitespace-nowrap'
        >
          Don't have an account?
        </button>

      </motion.div>

    </motion.form>
  )
}

export default Login