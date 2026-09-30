import { useEffect } from "react"
import Lenis from "@studio-freight/lenis"

const SmoothScrollWrapper = ({ children }) => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4, // ✅ not too slow, not too fast
      easing: (t) => 1 - Math.pow(1 - t, 4), // 🔥 smoother than cubic
      smooth: true,
      lerp: 0.06, // 🔥 ULTRA SMOOTH (main factor)
      wheelMultiplier: 0.6, // softer input = luxury feel
      touchMultiplier: 0.6  , // ✅ keep natural on touch
      infinite: false,
    })

    window.__lenis = lenis

    const isMessageRoute = () => window.location.pathname.startsWith("/messages")

    const updateLenis = () => {
      if (!lenis) return
      if (isMessageRoute()) {
        lenis.stop()
      } else {
        lenis.start()
      }
    }

    const handleModalScrollLock = (event) => {
      const shouldLock = Boolean(event?.detail?.locked)

      if (shouldLock) {
        lenis.stop()
      } else {
        lenis.start()
      }
    }

    const handleLocationChange = () => {
      updateLenis()
    }

    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function (...args) {
      const result = originalPushState.apply(this, args)
      window.dispatchEvent(new Event("locationchange"))
      return result
    }

    window.history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args)
      window.dispatchEvent(new Event("locationchange"))
      return result
    }

    window.addEventListener("modal-scroll-lock", handleModalScrollLock)
    window.addEventListener("popstate", handleLocationChange)
    window.addEventListener("locationchange", handleLocationChange)

    updateLenis()

    let rafId

    const raf = (time) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("modal-scroll-lock", handleModalScrollLock)
      window.removeEventListener("popstate", handleLocationChange)
      window.removeEventListener("locationchange", handleLocationChange)
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      lenis.destroy()

      if (window.__lenis === lenis) {
        delete window.__lenis
      }
    }
  }, [])

  return children
}

export default SmoothScrollWrapper