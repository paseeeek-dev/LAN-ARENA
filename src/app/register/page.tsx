'use client'
import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

export default function RegisterPage(){
  const router=useRouter(); const [error,setError]=useState(''); const [loading,setLoading]=useState(false)
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setError(''); const fd=new FormData(e.currentTarget)
    const password=String(fd.get('password')||''); const confirm=String(fd.get('confirm')||'')
    if(password!==confirm){setError('Пароли не совпадают.');return}
    setLoading(true)
    try { await apiFetch('/api/auth/register',{method:'POST',body:JSON.stringify({username:String(fd.get('username')||''),email:String(fd.get('email')||''),password,role:String(fd.get('role')||'VIEWER')})}); window.dispatchEvent(new Event('lan-user-changed')); router.push('/profile'); router.refresh() }
    catch(err){setError(err instanceof Error?err.message:'Ошибка регистрации')} finally {setLoading(false)}
  }
  return <main className="grid-noise min-h-[calc(100vh-74px)] px-4 py-16"><div className="mx-auto max-w-xl"><div className="mb-8"><div className="text-xs uppercase tracking-[.2em] text-white/35">Новый аккаунт</div><h1 className="mt-2 text-4xl font-black">Регистрация</h1><p className="mt-3 text-white/45">Аккаунт теперь хранится на сервере проекта, а пароль сохраняется только в виде хеша.</p></div><form onSubmit={submit} className="card grid gap-5 rounded-2xl p-6 sm:grid-cols-2"><label><span className="mb-2 block text-sm text-white/60">Username *</span><input name="username" className="field" placeholder="shadow1337"/></label><label><span className="mb-2 block text-sm text-white/60">Email *</span><input name="email" type="email" className="field" placeholder="mail@example.com"/></label><label><span className="mb-2 block text-sm text-white/60">Пароль *</span><input name="password" type="password" className="field" placeholder="Минимум 6 символов"/></label><label><span className="mb-2 block text-sm text-white/60">Повтори пароль *</span><input name="confirm" type="password" className="field" placeholder="Повтори пароль"/></label><label className="sm:col-span-2"><span className="mb-2 block text-sm text-white/60">Тип аккаунта</span><select name="role" className="field"><option value="VIEWER">Зритель</option><option value="PLAYER">Игрок</option></select></label>{error&&<div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 sm:col-span-2">{error}</div>}<button disabled={loading} className="rounded-xl bg-[#d94a2c] px-4 py-3 font-bold transition hover:bg-[#ef5a3c] disabled:opacity-50 sm:col-span-2">{loading?'Создаём...':'Создать аккаунт'}</button><p className="text-center text-sm text-white/40 sm:col-span-2">Уже есть аккаунт? <Link className="text-[#ff7b5d]" href="/login">Войти</Link></p></form></div></main>
}
