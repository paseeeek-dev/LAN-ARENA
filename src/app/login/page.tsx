'use client'
import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

export default function LoginPage(){
  const router=useRouter(); const [error,setError]=useState(''); const [loading,setLoading]=useState(false)
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setError(''); setLoading(true)
    const fd=new FormData(e.currentTarget)
    try { const data=await apiFetch<{user:{role:string}}>('/api/auth/login',{method:'POST',body:JSON.stringify({login:String(fd.get('login')||''),password:String(fd.get('password')||'')})}); window.dispatchEvent(new Event('lan-user-changed')); router.push(data.user.role==='ADMIN'||data.user.role==='ORGANIZER'?'/organizer':'/profile'); router.refresh() }
    catch(err){ setError(err instanceof Error?err.message:'Ошибка входа') } finally { setLoading(false) }
  }
  return <main className="grid-noise min-h-[calc(100vh-74px)] px-4 py-16"><div className="mx-auto max-w-md"><div className="mb-8"><div className="text-xs uppercase tracking-[.2em] text-white/35">Аккаунт</div><h1 className="mt-2 text-4xl font-black">Вход</h1><p className="mt-3 text-white/45">Теперь авторизация работает через серверную сессию.</p></div><form onSubmit={submit} className="card space-y-5 rounded-2xl p-6"><label className="block"><span className="mb-2 block text-sm text-white/60">Email или username</span><input name="login" className="field" placeholder="player01" autoComplete="username"/></label><label className="block"><span className="mb-2 block text-sm text-white/60">Пароль</span><input name="password" type="password" className="field" placeholder="••••••••" autoComplete="current-password"/></label>{error&&<div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}<button disabled={loading} className="w-full rounded-xl bg-[#d94a2c] px-4 py-3 font-bold transition hover:-translate-y-0.5 hover:bg-[#ef5a3c] disabled:opacity-50">{loading?'Входим...':'Войти'}</button><p className="text-center text-sm text-white/40">Нет аккаунта? <Link className="text-[#ff7b5d]" href="/register">Регистрация</Link></p></form></div></main>
}
