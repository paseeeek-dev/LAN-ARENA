'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { apiFetch } from '@/lib/api'

type User = { id:string; username:string; email:string; role:string; points:number }

const links = [
  ['Турниры','/tournaments'], ['Матчи','/matches'], ['Команды','/teams'], ['Игроки','/players'],
  ['Прогнозы','/predictions'], ['The International','/international'],
]

export default function Navbar(){
  const pathname = usePathname()
  const router = useRouter()
  const [user,setUser] = useState<User | null>(null)
  const [portalReady,setPortalReady] = useState(false)
  const [menuMounted,setMenuMounted] = useState(false)
  const [menuVisible,setMenuVisible] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function syncUser(){
    try { const data = await apiFetch<{user:User|null}>('/api/auth/me'); setUser(data.user) }
    catch { setUser(null) }
  }

  useEffect(()=>{
    setPortalReady(true)
    return ()=>{
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  },[])

  useEffect(()=>{
    syncUser()
    const id = setInterval(syncUser, 4000)
    window.addEventListener('lan-user-changed', syncUser)
    return ()=>{ clearInterval(id); window.removeEventListener('lan-user-changed', syncUser) }
  },[pathname])

  useEffect(()=>{
    setMenuVisible(false)
    setMenuMounted(false)
  },[pathname])

  useEffect(()=>{
    if (!menuMounted) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }

    document.documentElement.classList.add('lan-menu-open')
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return ()=>{
      document.documentElement.classList.remove('lan-menu-open')
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[menuMounted])

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ORGANIZER'
  const navClass=(href:string)=>`nav-link ${pathname===href?'nav-link-active':''}`

  function openMenu(){
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setMenuMounted(true)
    setMenuVisible(false)

    // Two frames guarantee the drawer exists in its hidden state before the slide-in class is applied.
    window.requestAnimationFrame(()=>{
      window.requestAnimationFrame(()=>setMenuVisible(true))
    })
  }

  function closeMenu(afterClose?: ()=>void){
    if (!menuMounted) return
    setMenuVisible(false)

    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(()=>{
      setMenuMounted(false)
      closeTimer.current = null
      afterClose?.()
    }, 320)
  }

  function toggleMenu(){
    if (menuMounted) closeMenu()
    else openMenu()
  }

  function goTo(href:string){
    if (pathname === href) {
      closeMenu()
      return
    }
    closeMenu(()=>router.push(href))
  }

  const mobileMenu = portalReady && menuMounted ? createPortal(
    <div
      className={`lan-overlay-root lan-mobile-menu-v17 ${menuVisible?'lan-mobile-menu-v17--visible':''}`}
      style={{ position:'fixed', top:64, right:0, bottom:0, left:0, zIndex:2147483600, pointerEvents:'auto', isolation:'isolate' }}
    >
      <button
        type="button"
        className="lan-mobile-menu-v17__backdrop"
        onClick={()=>closeMenu()}
        aria-label="Закрыть меню"
      />

      <aside className="lan-mobile-menu-v17__panel" aria-label="Мобильная навигация">
        <div className="lan-mobile-menu-v17__head">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.28em] text-white/35">Навигация</div>
            <div className="mt-1 text-lg font-black tracking-tight">LAN ARENA</div>
          </div>
          <div className="lan-mobile-menu-v17__badge">MENU</div>
        </div>

        <nav className="lan-mobile-menu-v17__nav">
          {links.map(([label,href],index)=><button
            type="button"
            onClick={()=>goTo(href)}
            key={href}
            style={{transitionDelay: menuVisible ? `${70 + index * 34}ms` : '0ms'}}
            className={`lan-mobile-menu-v17__link ${pathname===href?'lan-mobile-menu-v17__link--active':''}`}
          >
            <span>{label}</span>
            <span className="lan-mobile-menu-v17__arrow">→</span>
          </button>)}

          {isAdmin&&<button
            type="button"
            onClick={()=>goTo('/organizer')}
            style={{transitionDelay: menuVisible ? `${70 + links.length * 34}ms` : '0ms'}}
            className={`lan-mobile-menu-v17__link lan-mobile-menu-v17__link--organizer ${pathname==='/organizer'?'lan-mobile-menu-v17__link--active':''}`}
          >
            <span>Организатор</span><span className="lan-mobile-menu-v17__arrow">→</span>
          </button>}
        </nav>

        <div className="lan-mobile-menu-v17__account">
          {user?<button type="button" onClick={()=>goTo('/profile')} className="lan-mobile-menu-v17__profile">
            <div className="min-w-0 text-left">
              <div className="text-[10px] uppercase tracking-[.2em] text-white/35">Профиль</div>
              <div className="mt-1 truncate font-bold">{user.username}</div>
            </div>
            <span className="shrink-0 rounded-lg bg-[#d94a2c]/15 px-3 py-2 text-xs font-black text-[#ff7b5d]">{user.points} LP</span>
          </button>:<div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={()=>goTo('/login')} className="rounded-xl border border-white/10 bg-[#151820] px-4 py-3 text-center font-bold active:scale-[.98]">Войти</button>
            <button type="button" onClick={()=>goTo('/register')} className="rounded-xl bg-[#d94a2c] px-4 py-3 text-center font-bold active:scale-[.98]">Регистрация</button>
          </div>}
        </div>
      </aside>
    </div>,
    document.body
  ) : null

  return <>
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090b0f]/94 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-auto md:px-6 md:py-4">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5 md:gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#d94a2c] text-sm font-black shadow-[0_0_30px_rgba(217,74,44,.18)] transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">LA</div>
          <div className="min-w-0">
            <div className="truncate text-sm font-black tracking-[.14em] sm:text-base sm:tracking-[.18em]">LAN ARENA</div>
            <div className="hidden text-[10px] uppercase tracking-[.3em] text-white/40 sm:block">Esports LAN platform</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(([label,href])=><Link key={href} href={href} className={navClass(href)}>{label}</Link>)}
          {isAdmin && <Link href="/organizer" className={navClass('/organizer')}>Организатор</Link>}
          <div className="ml-2 h-6 w-px bg-white/10" />
          {user?<Link href="/profile" className={`ml-2 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${pathname==='/profile'?'border-[#ff7b5d]/25 bg-[#d94a2c]/8 text-white':'border-white/10 text-white/85 hover:bg-white/5'}`}><span className="max-w-24 truncate">{user.username}</span><span className="rounded-md bg-[#d94a2c]/15 px-2 py-1 text-[11px] font-black text-[#ff7b5d]">{user.points} LP</span></Link>:<><Link href="/login" className="ml-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/85 transition hover:bg-white/5">Войти</Link><Link href="/register" className="rounded-xl bg-[#d94a2c] px-4 py-2 text-sm font-bold transition hover:bg-[#ef5a3c]">Регистрация</Link></>}
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          {user && <button type="button" onClick={()=>router.push('/profile')} className="max-w-[116px] truncate rounded-lg border border-white/10 bg-white/[.025] px-2.5 py-2 text-xs font-bold text-[#ff8a70]">{user.points} LP</button>}
          <button
            type="button"
            onClick={toggleMenu}
            className={`mobile-menu-button grid h-10 w-10 place-items-center rounded-xl border transition ${menuMounted?'border-[#ff7b5d]/40 bg-[#d94a2c]/15 text-white':'border-white/10 bg-white/[.035] text-white/90'}`}
            aria-label={menuMounted?'Закрыть меню':'Открыть меню'}
            aria-expanded={menuMounted}
          >
            <span className="relative grid h-6 w-6 place-items-center">
              <Bars3Icon className={`absolute h-6 w-6 transition-all duration-300 ${menuMounted?'scale-75 rotate-90 opacity-0':'scale-100 rotate-0 opacity-100'}`}/>
              <XMarkIcon className={`absolute h-6 w-6 transition-all duration-300 ${menuMounted?'scale-100 rotate-0 opacity-100':'scale-75 -rotate-90 opacity-0'}`}/>
            </span>
          </button>
        </div>
      </div>
    </header>
    {mobileMenu}
  </>
}
