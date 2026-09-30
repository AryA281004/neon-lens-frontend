import React from "react";
import { motion } from "framer-motion";

/**
 * Reusable ComingSoon / Blackhole Section
 *
 * Usage:
 * <ComingSoonBlackhole />
 *
 * Custom:
 * <ComingSoonBlackhole
 *   title="COMING SOON"
 *   subtitle="BLACKHOLE"
 *   height="100vh"
 * />
 */

const ComingSoonBlackhole = ({
  title = "COMING SOON",
  subtitle = "BLACKHOLE",
  height = "100vh",
}) => {
  return (
    <section
      className="relative w-full overflow-hidden bg-black flex items-center justify-center"
      style={{ minHeight: height }}
    >
      {/* Background atmosphere */}
      <div className="absolute bg-black" />

      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2  h-[220px] bg-indigo-700/20 blur-3xl rounded-full" />

      {/* Main blackhole glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer glow */}
        <motion.div
          className="absolute w-[520px] h-[520px] rounded-full bg-indigo-700/20 blur-3xl"
          animate={{
            scale: [1, 1.06, 1],
            opacity: [0.45, 0.7, 0.45],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Middle glow */}
        <motion.div
          className="absolute w-[420px] h-[420px] rounded-full bg-indigo-500/20 blur-2xl"
          animate={{
            scale: [1, 1.04, 1],
            opacity: [0.35, 0.55, 0.35],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Blackhole core */}
        <motion.div
          className="absolute w-[380px] h-[380px] rounded-full bg-black shadow-[0_0_120px_rgba(79,70,229,0.25)]"
          animate={{
            scale: [1, 1.015, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-white text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.55em] uppercase"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: "easeOut" }}
          className="mt-6 text-indigo-400/70 text-xs sm:text-sm tracking-[0.6em] uppercase"
        >
          {subtitle}
        </motion.p>
      </div>
  
      {/* Film grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0.6px, transparent 0.7px),
            radial-gradient(circle at 80% 40%, rgba(255,255,255,0.08) 0.6px, transparent 0.7px),
            radial-gradient(circle at 40% 80%, rgba(255,255,255,0.08) 0.6px, transparent 0.7px)
          `,
          backgroundSize: "12px 12px",
        }}
      />

      {/* Bottom vignette */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent" />
    </section>
  );
};

export default ComingSoonBlackhole; 