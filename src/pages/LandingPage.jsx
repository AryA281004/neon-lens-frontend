import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SmoothScrollWrapper from '../utils/LenisSetup'
import NavbarInLandingPage from '../components/NavbarInLandingPage'

const LandingPage = () => {
  const navigate = useNavigate()

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6 }
    })
  }

  const handleGetstarted = () => {
    navigate('/account')
  }

  const handleLearnMore = () => {
    navigate('/learn-more')
  }


  return (
    <SmoothScrollWrapper>
      <div className="relative no-scrollbar  w-full min-h-screen text-white pt-20">
        <div className="absolute inset-0 -z-10 ">
        <div className="absolute top-20 left-10 w-72 h-72 bg-fuchsia-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/20 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 w-[28rem] h-[28rem] bg-white/5 blur-[180px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>
        <div className='flex flex-col justify-center items-center'>
      <NavbarInLandingPage />
      </div>
      <div className="max-w-6xl mx-auto px-6 py-16">
        

        {/* 🔥 HERO */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="text-center mb-28"
        >
          <motion.div variants={fadeUp} className='w-full -mt-30 h-screen text-[200px] flex items-center justify-center text-white font-extralight '>
              <div className=''>
                <h1 className='p1 '>Neon</h1>
                <h1 className='p2' data-text="Lens">Lens</h1>
              </div>

            </motion.div>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-xl text-slate-300 max-w-2xl mx-auto mb-6"
          >
            Showcase, protect, and elevate your creative vision — all in one platform.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          >
            <button
              onClick={handleGetstarted}
              className="use-font px-10 py-4 bg-transparent text-white border-4 tracking-widest font-semibold hover:-translate-y-1 hover:scale-[1.02]
    hover:shadow-[6px_6px_0_white] hover:scale-105 transition"
            >
              Get Started
            </button>

            <button
              onClick={handleLearnMore}
              className="use-font px-10 py-4  backdrop-blur-lg rounded-xl hover:bg-white/10 transition"
            >
              Learn More
            </button>
          </motion.div>
        </motion.div>

        {/* ✨ FEATURES */}
        <div className="grid md:grid-cols-3 gap-8 mb-28">
          {[
            {
              icon: "🚀",
              title: "Fast Performance",
              desc: "Real-time interactions with optimized media delivery."
            },
            {
              icon: "🔒",
              title: "Secure Platform",
              desc: "Advanced protection for your visual content."
            },
            {
              icon: "🎨",
              title: "Modern Design",
              desc: "Clean, intuitive, and built for creators."
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
              whileHover={{ y: -6 }}
              className="p-8 rounded-2xl border border-white/10 bg-white/5 hover:border-cyan-400/40 transition"
            >
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* 📊 STATS */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex justify-center gap-12 text-center mb-28"
        >
          {[
            { value: "10K+", label: "Users" },
            { value: "500K+", label: "Images" },
            { value: "99.9%", label: "Uptime" }
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ⚡ CTA */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-center border border-white/10 rounded-2xl p-12"
        >
          <h2 className="text-3xl font-semibold mb-4">
            Build Your Creative Presence
          </h2>
          <p className="text-slate-400 mb-8">
            Join creators who are shaping the future of visual storytelling.
          </p>

          <button
            onClick={() => navigate('/account')}
            className="use-font px-12 py-4 bg-transparent text-white border-4 tracking-widest font-semibold hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[6px_6px_0_white] hover:scale-105 transition"
          >
            Join Community
          </button>
        </motion.div>

        {/* 🧾 FOOTER */}
        <div className="text-center mt-16 text-xs text-slate-600">
          © {new Date().getFullYear()} NeonLens • All rights reserved
        </div>
      </div>
    </div>
    </SmoothScrollWrapper>
  )
}

export default LandingPage