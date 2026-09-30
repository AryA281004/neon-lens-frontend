let lockCount = 0
let savedScrollY = 0
let previousStyle = null

const isClient = typeof window !== 'undefined' && typeof document !== 'undefined'

export const lockScroll = () => {
  if (!isClient) return

  lockCount += 1
  if (lockCount !== 1) return

  previousStyle = {
    bodyOverflow: document.body.style.overflow,
    htmlOverflow: document.documentElement.style.overflow,
    bodyPosition: document.body.style.position,
    bodyTop: document.body.style.top,
    bodyLeft: document.body.style.left,
    bodyRight: document.body.style.right,
    bodyWidth: document.body.style.width,
  }
  savedScrollY = window.scrollY || window.pageYOffset || 0

  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${savedScrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'

  window.dispatchEvent(new CustomEvent('modal-scroll-lock', { detail: { locked: true } }))
}

export const unlockScroll = () => {
  if (!isClient) return
  if (lockCount <= 0) return

  lockCount -= 1
  if (lockCount !== 0) return

  if (previousStyle) {
    document.body.style.overflow = previousStyle.bodyOverflow || ''
    document.documentElement.style.overflow = previousStyle.htmlOverflow || ''
    document.body.style.position = previousStyle.bodyPosition || ''
    document.body.style.top = previousStyle.bodyTop || ''
    document.body.style.left = previousStyle.bodyLeft || ''
    document.body.style.right = previousStyle.bodyRight || ''
    document.body.style.width = previousStyle.bodyWidth || ''
  } else {
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
    document.body.style.width = ''
  }

  window.scrollTo(0, savedScrollY)
  window.dispatchEvent(new CustomEvent('modal-scroll-lock', { detail: { locked: false } }))
}
