'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

type User={id:string;username:string;points:number;role:string}
type Match={id:number;teamA:string;teamB:string;event:string;startAt:number;endAt:number;communityA:number;communityB:number;winner:string|null}
type Prediction={id:string;matchId:number;team:string;placedAt:number;status:'PENDING'|'WON'|'LOST';reward:number;settledAt?:number}
const formatClock=(ts:number)=>new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(ts))
function phase(m:Match,now:number){if(m.winner)return'FINISHED';if(now<m.startAt)return'UPCOMING';if(now<=m.endAt)return'LIVE';return'AWAITING_RESULT'}

export default function PredictionsPage(){
  const [user,setUser]=useState<User|null>(null)
  const [matches,setMatches]=useState<Match[]>([])
  const [predictions,setPredictions]=useState<Prediction[]>([])
  const [now,setNow]=useState(Date.now())
  const [message,setMessage]=useState('')
  const [tab,setTab]=useState<'active'|'history'>('active')

  async function sync(){
    try {
      const [me,m,p]=await Promise.all([
        apiFetch<{user:User|null}>('/api/auth/me'),
        apiFetch<{matches:Match[]}>('/api/matches'),
        apiFetch<{predictions:Prediction[]}>('/api/predictions')
      ])
      setUser(me.user);setMatches(m.matches);setPredictions(p.predictions);setNow(Date.now());window.dispatchEvent(new Event('lan-user-changed'))
    } catch {}
  }
  useEffect(()=>{sync();const id=setInterval(sync,3000);return()=>clearInterval(id)},[])

  const byMatch=useMemo(()=>new Map(predictions.map(p=>[p.matchId,p])),[predictions])
  const matchMap=useMemo(()=>new Map(matches.map(m=>[m.id,m])),[matches])
  const history=useMemo(()=>predictions.filter(p=>p.status!=='PENDING').sort((a,b)=>(b.settledAt||b.placedAt)-(a.settledAt||a.placedAt)),[predictions])
  const pending=predictions.filter(p=>p.status==='PENDING').length

  async function pick(matchId:number,team:string){
    setMessage('')
    try{await apiFetch('/api/predictions',{method:'POST',body:JSON.stringify({matchId,team})});setMessage('Прогноз сохранён на сервере.');await sync()}
    catch(err){setMessage(err instanceof Error?err.message:'Ошибка')}
  }

  return <main className="min-h-[calc(100vh-74px)] px-4 py-12 md:px-6"><div className="mx-auto max-w-7xl">
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="text-xs uppercase tracking-[.2em] text-white/35">Pick’em center</div><h1 className="mt-2 text-4xl font-black md:text-5xl">Прогнозы на матчи</h1><p className="mt-3 max-w-2xl text-white/45">Бесплатный pick’em: выбираешь победителя без покупки или списания баллов. История результатов сохраняется в аккаунте.</p></div>{user?<Link href="/profile" className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold">{user.username} · {user.points} LP</Link>:<Link href="/login" className="rounded-xl bg-[#d94a2c] px-4 py-3 text-sm font-bold">Войти для прогноза</Link>}</div>

    <div className="mb-6 flex flex-wrap gap-2"><button onClick={()=>setTab('active')} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${tab==='active'?'bg-white text-black':'border border-white/10 bg-white/[.025] text-white/65 hover:bg-white/5'}`}>Матчи · {pending} активных</button><button onClick={()=>setTab('history')} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${tab==='history'?'bg-white text-black':'border border-white/10 bg-white/[.025] text-white/65 hover:bg-white/5'}`}>История · {history.length}</button></div>
    {message&&<div className="mb-5 rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-sm text-white/65">{message}</div>}

    {tab==='active'?<div className="grid gap-4 lg:grid-cols-3">{matches.map(m=>{
      const ph=phase(m,now);const prediction=byMatch.get(m.id);const status=ph==='UPCOMING'?`Старт ${formatClock(m.startAt)}`:ph==='LIVE'?'LIVE':ph==='FINISHED'?'Матч завершён':'Ожидаем результат'
      return <article key={m.id} className="card lift rounded-2xl p-5"><div className="flex items-center justify-between gap-3 text-xs"><span className="uppercase tracking-[.16em] text-white/35">{m.event}</span><span className={ph==='LIVE'?'rounded-full bg-red-500/10 px-2.5 py-1 font-black text-red-300':ph==='FINISHED'?'text-emerald-300':'text-[#ff7b5d]'}>{status}</span></div><div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3"><div className="text-lg font-black">{m.teamA}</div><div className="text-xs font-bold text-white/25">VS</div><div className="text-right text-lg font-black">{m.teamB}</div></div><div className="mt-5"><div className="mb-2 flex justify-between text-xs text-white/45"><span>{m.communityA}% выбрали</span><span>{m.communityB}% выбрали</span></div><div className="flex h-2 overflow-hidden rounded-full bg-white/5"><div className="bg-[#d94a2c]" style={{width:`${m.communityA}%`}}/><div className="bg-white/20" style={{width:`${m.communityB}%`}}/></div></div><div className="mt-5 grid grid-cols-2 gap-2"><button disabled={!user||ph!=='UPCOMING'} onClick={()=>pick(m.id,m.teamA)} className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${prediction?.team===m.teamA?'border-[#ff7b5d]/40 bg-[#d94a2c]/15 text-[#ff9a83]':'border-white/10 hover:bg-white/5'} disabled:opacity-40`}>{m.teamA}</button><button disabled={!user||ph!=='UPCOMING'} onClick={()=>pick(m.id,m.teamB)} className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${prediction?.team===m.teamB?'border-[#ff7b5d]/40 bg-[#d94a2c]/15 text-[#ff9a83]':'border-white/10 hover:bg-white/5'} disabled:opacity-40`}>{m.teamB}</button></div>{prediction&&<div className={`mt-3 rounded-xl px-3 py-2 text-xs ${prediction.status==='WON'?'bg-emerald-400/[.08] text-emerald-200':prediction.status==='LOST'?'bg-red-400/[.08] text-red-200':'bg-amber-300/[.06] text-amber-100/70'}`}>{prediction.status==='WON'?`Прогноз точный · +${prediction.reward} LP`:prediction.status==='LOST'?'Прогноз не угадан':`Прогноз сохранён: ${prediction.team}`}</div>}{m.winner&&<div className="mt-3 text-xs font-bold text-white/55">Победитель: <span className="text-emerald-300">{m.winner}</span></div>}</article>
    })}</div>:<section className="card overflow-hidden rounded-2xl">{!user?<div className="p-10 text-center"><div className="text-xl font-black">Войди, чтобы увидеть историю</div><Link href="/login" className="mt-5 inline-flex rounded-xl bg-[#d94a2c] px-5 py-3 text-sm font-bold">Войти</Link></div>:history.length===0?<div className="p-10 text-center text-white/40">Завершённых прогнозов пока нет.</div>:<div className="divide-y divide-white/8">{history.map(p=>{const m=matchMap.get(p.matchId);return <div key={p.id} className="grid gap-3 p-5 md:grid-cols-[1.4fr_.8fr_.7fr_.5fr] md:items-center"><div><div className="text-xs uppercase tracking-[.14em] text-white/25">{m?.event||`Матч #${p.matchId}`}</div><div className="mt-1 font-black">{m?`${m.teamA} — ${m.teamB}`:p.team}</div></div><div><div className="text-xs text-white/30">Твой выбор</div><div className="mt-1 font-semibold">{p.team}</div></div><div><div className="text-xs text-white/30">Результат</div><div className={`mt-1 font-black ${p.status==='WON'?'text-emerald-300':'text-red-300'}`}>{p.status==='WON'?`Точно · +${p.reward} LP`:'Не угадан'}</div></div><div className="text-xs text-white/35 md:text-right">{formatClock(p.settledAt||p.placedAt)}</div></div>})}</div>}</section>}
  </div></main>
}
