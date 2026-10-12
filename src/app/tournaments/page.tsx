'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

type Reg={status:string;checkIn:string}|null
type Tournament={id:string;name:string;game:string;city:string;venue:string;startAt:number;registrationDeadline:number;teamLimit:number;format:string;prizePool:string;status:string;description:string;registrationCount:number;approvedCount:number;spotsLeft:number;myRegistration:Reg}

const fmt=(ts:number)=>new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(ts))
const statusLabel:Record<string,string>={REGISTRATION:'Регистрация открыта',UPCOMING:'Скоро',LIVE:'LIVE',FINISHED:'Завершён'}

export default function TournamentsPage(){
  const [items,setItems]=useState<Tournament[]>([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{apiFetch<{tournaments:Tournament[]}>('/api/tournaments').then(x=>setItems(x.tournaments)).finally(()=>setLoading(false))},[])
  return <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="text-xs font-bold uppercase tracking-[.2em] text-[#ff7b5d]">LAN circuit</div><h1 className="mt-2 text-4xl font-black md:text-5xl">Турниры</h1><p className="mt-3 max-w-2xl text-white/45">Регистрируй команду, проходи check-in и следи за списком участников.</p></div><div className="rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-sm text-white/45">Dota 2 + другие дисциплины</div></div>
    {loading?<div className="mt-10 text-white/40">Загрузка...</div>:<div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map(t=><Link key={t.id} href={`/tournaments/${t.id}`} className="card lift rounded-3xl p-6"><div className="flex items-start justify-between gap-3"><div className="rounded-lg bg-[#d94a2c]/10 px-3 py-1 text-xs font-bold text-[#ff7b5d]">{t.game}</div><div className={`text-xs font-bold ${t.status==='LIVE'?'text-red-300':'text-white/40'}`}>{statusLabel[t.status]||t.status}</div></div><h2 className="mt-5 text-2xl font-black">{t.name}</h2><div className="mt-2 text-sm text-white/40">{t.city} · {t.venue}</div><p className="mt-4 line-clamp-2 text-sm leading-6 text-white/45">{t.description}</p><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl border border-white/8 bg-white/[.025] p-3"><div className="text-white/30">Старт</div><div className="mt-1 font-bold">{fmt(t.startAt)}</div></div><div className="rounded-xl border border-white/8 bg-white/[.025] p-3"><div className="text-white/30">Призовой</div><div className="mt-1 font-bold">{t.prizePool}</div></div></div><div className="mt-5 flex items-center justify-between text-sm"><span className="text-white/40">{t.approvedCount}/{t.teamLimit} команд</span><span className="font-bold text-[#ff7b5d]">{t.format}</span></div>{t.myRegistration&&<div className="mt-4 rounded-xl border border-[#d94a2c]/15 bg-[#d94a2c]/8 px-3 py-2 text-xs text-[#ffb7a8]">Твоя заявка: {t.myRegistration.status}</div>}</Link>)}</div>}
  </main>
}
