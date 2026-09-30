import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { requestOtp, verifyOtp, completeRegistration, checkUsernameAvailability, issueSwitchToken } from '../api/api.js'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import { addSavedAccount } from '../utils/accountSwitch.js'

const Register = ({ onSwitchTab }) => {
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState(Array(6).fill(''))
  const inputsRef = useRef([])
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    mobilenumber: '',
    role: 'photographer'
  })

  const [passwordStrength, setPasswordStrength] = useState(0)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [shake, setShake] = useState(false)
  const [existingUser, setExistingUser] = useState({
    email: false,
    username: false,
    mobile: false
  })

  // 🔥 SHAKE + TOAST
  const triggerError = (msg) => {
    setShake(true)
    toast.error(msg)
    setTimeout(() => setShake(false), 400)
  }

  // 🔹 INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'password') {
      let s = 0
      if (value.length >= 8) s++
      if (/[A-Z]/.test(value)) s++
      if (/[0-9]/.test(value)) s++
      if (/[^A-Za-z0-9]/.test(value)) s++
      setPasswordStrength(s)
    }
  }

  // 🔹 OTP HANDLING
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').trim()
    if (!/^\d{6}$/.test(paste)) return

    const newOtp = paste.split('')
    setOtp(newOtp)

    newOtp.forEach((d, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i].value = d
      }
    })

    inputsRef.current[5]?.focus()
  }

  const otpValue = otp.join('')

  useEffect(() => {
    if (step === 2) {
      inputsRef.current[0]?.focus()
    }
  }, [step])

  // ===== STEP HANDLERS =====

  const handleSendOTP = async () => {
    const { firstName, lastName, email } = formData

    if (!firstName || !lastName || !email) {
      return triggerError('Fill all fields')
    }

    try {
      await requestOtp(email)
      setExistingUser(prev => ({ ...prev, email: false }))
      toast.success('OTP sent to your email')
      setStep(2)
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to send OTP'
      if (errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('already')) {
        setExistingUser(prev => ({ ...prev, email: true }))
      }
      triggerError(errorMsg)
    }
  }

  const handleVerifyOTP = async () => {
    if (otpValue.length !== 6) {
      return triggerError('Please enter a valid 6-digit OTP')
    }

    try {
      await verifyOtp(formData.email, otpValue)
      toast.success('OTP verified')
      setStep(3)
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Invalid OTP'
      triggerError(errorMsg)
    }
  }

  const handleUsernameNext = async () => {
    if (!formData.username) {
      return triggerError('Username required')
    }

    setLoading(true)
    try {
      await checkUsernameAvailability(formData.username)
      setExistingUser(prev => ({ ...prev, username: false }))
      setStep(4)
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Username check failed'
      if (errorMsg.toLowerCase().includes('username') || errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('taken')) {
        setExistingUser(prev => ({ ...prev, username: true }))
      }
      triggerError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleMobileNext = () => {
    if (!formData.mobilenumber) {
      return triggerError('Mobile number required')
    }
    // Check if mobile might exist (backend will validate fully)
    setExistingUser(prev => ({ ...prev, mobile: false }))
    setStep(5)
  }

  const handlePasswordNext = () => {
    if (formData.password.length < 8) {
      return triggerError('Password must be 8+ chars')
    }
    if (formData.password !== formData.confirmPassword) {
      return triggerError('Passwords do not match')
    }
    setStep(6)
  }

  const dispatch = useDispatch()

  const handleSubmit = async () => {
    if (!acceptedTerms) {
      return triggerError('Accept terms first')
    }

    try {
      const { firstName, lastName, email, username, password, mobilenumber, role } = formData
      const data = await completeRegistration({
        firstName,
        lastName,
        email,
        username,
        password,
        mobilenumber,
        role
      })
      toast.success('Account Created 🚀')
      // Save user to localStorage and Redux
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
      navigate('/home')
      onSwitchTab()
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Registration failed'
      triggerError(errorMsg)
    }
  }

  // 🔹 STYLES
  const inputCls = `
    w-full h-12 px-4 text-sm
    bg-black border-2 border-white
    text-white placeholder-gray-500
    outline-none transition-all duration-300
    hover:-translate-y-1 hover:scale-[1.02]
    hover:shadow-[6px_6px_0_white]
  `

  const otpCls = `
    w-10 h-10 text-center text-lg font-bold
    bg-black border-2 border-white text-white
    focus:bg-white focus:text-black outline-none
    transition-all duration-200
    shadow-[3px_3px_0_white]
  `

  return (
    <motion.div
      animate={shake ? { x: [-6, 6, -4, 4, 0] } : {}}
      className="flex flex-col gap-6"
    >

      {/* Progress */}
      <div className="flex gap-2">
        {[1,2,3,4,5,6].map(s => (
          <div key={s} className={`h-1 flex-1 ${step >= s ? 'bg-white' : 'bg-gray-700'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-1"
        >

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <label className="text-white text-sm font-medium">First Name</label>
              <input name="firstName" placeholder="First Name" className={inputCls} onChange={handleChange} />
              
              <label className="text-white text-sm font-medium">Last Name</label>
              <input name="lastName" placeholder="Last Name" className={inputCls} onChange={handleChange} />
              
              <label className="text-white text-sm font-medium">Email</label>
              <input name="email" placeholder="Email" className={inputCls} onChange={handleChange} />
              
              
              
              <button className="h-12 mt-4 bg-white text-black font-bold cursor-pointer" onClick={handleSendOTP}>
                Send OTP
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputsRef.current[index] = el}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    maxLength={1}
                    className={otpCls}
                  />
                ))}
              </div>

              <button className="h-12 mt-4 bg-white text-black font-bold cursor-pointer" onClick={handleVerifyOTP}>
                Verify OTP
              </button>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <label className="text-white text-sm font-medium">Username</label>
              <input name="username" placeholder="Username" className={inputCls} onChange={handleChange} />
              
              {existingUser.username && (
                <div className="p-3 bg-red-600/20 border border-red-600 text-red-400 text-sm rounded">
                  Username already taken. Choose a different one.
                </div>
              )}
              
              <button className="h-12 mt-4 bg-white text-black font-bold cursor-pointer disabled:opacity-50" disabled={loading} onClick={handleUsernameNext}>
                {loading ? 'Checking...' : 'Next'}
              </button>
            </>
          )}

          {/* STEP 4 - Mobile Number */}
          {step === 4 && (
            <>
              <label className="text-white text-sm font-medium">Mobile Number</label>
              <input name="mobilenumber" placeholder="Mobile Number" className={inputCls} onChange={handleChange} />
              
              {existingUser.mobile && (
                <div className="p-3 bg-red-600/20 border border-red-600 text-red-400 text-sm rounded">
                  Mobile number already registered. Try logging in instead.
                </div>
              )}
              
              <button className="h-12 mt-4 bg-white text-black font-bold cursor-pointer" onClick={handleMobileNext}>
                Next
              </button>
            </>
          )}

          {/* STEP 5 - Password */}
          {step === 5 && (
            <>
              <label className="text-white text-sm font-medium">Password</label>
              <input type="password" name="password" placeholder="Password" className={inputCls} onChange={handleChange} />
              
              <label className="text-white text-sm font-medium">Confirm Password</label>
              <input type="password" name="confirmPassword" placeholder="Confirm Password" className={inputCls} onChange={handleChange} />

              {/* Strength */}
              <div className="flex justify-between text-xs text-gray-400">
                <span>Password strength</span>
                <span className="text-white font-bold">
                  {['Weak', 'Fair', 'Good', 'Strong'][passwordStrength - 1] || 'Too Short'}
                </span>
              </div>

              <div className="flex-1 h-1 bg-gray-700">
                <div
                  className="h-full bg-white transition-all"
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                />
              </div>

              <button className="h-12 bg-white text-black font-bold cursor-pointer" onClick={handlePasswordNext}>
                Next
              </button>
            </>
          )}

          {/* STEP 6 - Terms & Submit */}
          {step === 6 && (
            <>
              <label className="flex items-center gap-2 text-white text-sm">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={() => setAcceptedTerms(!acceptedTerms)}
                />
                I agree to Terms & Conditions
              </label>

              <button
                className="h-12 bg-white text-black font-bold disabled:opacity-50 cursor-pointer"
                disabled={!acceptedTerms}
                onClick={handleSubmit}
              >
                Create Account
              </button>
            </>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Switch */}
      <button
        onClick={onSwitchTab}
        className="text-sm text-gray-400 hover:text-white"
      >
        Already have an account?
      </button>

    </motion.div>
  )
}

export default Register