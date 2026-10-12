'use client'

import { useEffect } from 'react'

export default function MotionEffects(){
  useEffect(()=>{
    let timer: ReturnType<typeof setTimeout> | undefined
    let raf = 0
    let lastY = window.scrollY
    let lastTime = performance.now()

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const now = performance.now()
        const y = window.scrollY
        const delta = y - lastY
        const dt = Math.max(now - lastTime, 16)
        const velocity = Math.min(Math.abs(delta) / dt, 2.5)
        const blur = Math.min(0.55 + velocity * 1.55, 2.2)
        const shift = Math.max(-2.2, Math.min(2.2, delta * 0.025))

        document.documentElement.style.setProperty('--scroll-blur', `${blur.toFixed(2)}px`)
        document.documentElement.style.setProperty('--scroll-shift', `${shift.toFixed(2)}px`)
        document.documentElement.classList.add('lan-scrolling')

        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          document.documentElement.classList.remove('lan-scrolling')
          document.documentElement.style.setProperty('--scroll-blur', '0px')
          document.documentElement.style.setProperty('--scroll-shift', '0px')
        }, 125)

        lastY = y
        lastTime = now
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      if (timer) clearTimeout(timer)
      document.documentElement.classList.remove('lan-scrolling')
    }
  },[])

  return null
}
