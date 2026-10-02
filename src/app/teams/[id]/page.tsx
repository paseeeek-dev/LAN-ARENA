'use client'

import Link from 'next/link'
import { FormEvent, use, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '@/lib/api'

type UserMini={id:string;username:string;email?:string}
type Member={id:string;userId:string;position:string;isCaptain:boolean;user:UserMini}
type Team={id:string;name:string;tag:string;game:string;country:string;description:string;captainUserId:string;members:Member[]}
type JoinRequest={id:string;position:string;message:string;user:UserMini|null}
type TeamData={team:Team;isCaptain:boolean;myMembership:{teamId:string;position:string}|null;myRequest:{id:string}|null;requests:JoinRequest[]}

const labels:Record<string,string>={'1':'Carry','2':'Mid','3':'Offlane','4':'Soft Support','5':'Hard Support','SUB':'Запасной'}
const positions=['1','2','3','4','5']

export default function TeamPage({params}:{params:Promise<{id:string}>}){
  const {id}=use(params)
  const [data,setData]=useState<TeamData|null>(null)
  const [error,setError]=useState('')
  const [notice,setNotice]=useState('')
  const [loading,setLoading]=useState(true)

  async function load(){setLoading(true);try{setData(await apiFetch<TeamData>(`/api/teams/${id}`))}catch(err){setError(err instanceof Error?err.message:'Ошибка')}finally{setLoading(false)}}
  useEffect(()=>{load()},[id])

  const slots=useMemo(()=>{const map:Record<string,Member|undefined>={};data?.team.members.forEach(m=>{if(m.position!=='SUB')map[m.position]=m});return map},[data])
  const subs=data?.team.members.filter(m=>m.position==='SUB')||[]

  async function invite(e:FormEvent<HTMLFormElement>){e.preventDefault();setError('');setNotice('');const fd=new FormData(e.currentTarget);try{const r=await apiFetch<{player:{username:string}}>(`/api/teams/${id}/invite`,{method:'POST',body:JSON.stringify({player:fd.get('player'),position:fd.get('position')})});setNotice(`Приглашение для ${r.player.username} отправлено.`);e.currentTarget.reset()}catch(err){setError(err instanceof Error?err.message:'Ошибка')}}
  async function apply(e:FormEvent<HTMLFormElement>){e.preventDefault();setError('');const fd=new FormData(e.currentTarget);try{await apiFetch(`/api/teams/${id}/apply`,{method:'POST',body:JSON.stringify({position:fd.get('position'),message:fd.get('message')})});setNotice('Заявка отправлена капитану.');await load()}catch(err){setError(err instanceof Error?err.message:'Ошибка')}}
  async function manage(body:Record<string,unknown>){setError('');try{await apiFetch(`/api/teams/${id}/manage`,{method:'POST',body:JSON.stringify(body)});await load()}catch(err){setError(err instanceof Error?err.message:'Ошибка')}}

  if(loading)return <main className="mx-auto max-w-7xl px-4 py-14 md:px-6"><div className="text-white/40">Загрузка команды...</div></main>
  if(!data)return <main className="mx-auto max-w-7xl px-4 py-14 md:px-6"><div className="text-red-200">{error||'Команда не найдена.'}</div></main>
  const {team}=data

  return <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
    <Link href="/teams" className="text-sm text-white/40 transition hover:text-white">← Все команды</Link>
    <section className="mt-5 flex flex-col gap-6 border-b border-white/8 pb-8 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-5"><div className="grid h-20 w-20 place-items-center rounded-2xl border border-[#d94a2c]/20 bg-[#d94a2c]/12 text-2xl font-black text-[#ff7b5d]">{team.tag.slice(0,2)}</div><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-4xl font-black">{team.name}</h1><span className="rounded-lg bg-white/5 px-2 py-1 text-xs text-white/45">[{team.tag}]</span></div><div className="mt-2 text-sm text-white/40">{team.game} · {team.country} · {team.members.length} участников</div></div></div>{data.isCaptain&&<span className="w-fit rounded-xl border border-[#d94a2c]/25 bg-[#d94a2c]/10 px-4 py-2 text-sm font-bold text-[#ff7b5d]">Ты капитан</span>}</section>

    {team.description&&<p className="mt-7 max-w-3xl leading-7 text-white/55">{team.description}</p>}
    {error&&<div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
    {notice&&<div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</div>}

    <section className="mt-10"><div className="flex items-center justify-between"><div><div className="text-xs font-bold uppercase tracking-[.18em] text-[#ff7b5d]">Starting five</div><h2 className="mt-1 text-2xl font-black">Основной состав</h2></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{positions.map(pos=>{const member=slots[pos];return <div key={pos} className="card min-h-44 rounded-2xl p-5"><div className="flex items-center justify-between"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#d94a2c]/12 text-sm font-black text-[#ff7b5d]">{pos}</span><span className="text-[11px] uppercase tracking-[.12em] text-white/30">{labels[pos]}</span></div>{member?<><div className="mt-6 font-black">{member.user.username}</div><div className="mt-1 text-xs text-white/35">{member.isCaptain?'Капитан команды':'Игрок'}</div>{data.isCaptain&&<div className="mt-5 flex gap-2"><select value={member.position} onChange={e=>manage({action:'changePosition',userId:member.userId,position:e.target.value})} className="field !p-2 text-xs">{positions.map(p=><option key={p} value={p}>{p}</option>)}<option value="SUB">SUB</option></select>{!member.isCaptain&&<button onClick={()=>manage({action:'removeMember',userId:member.userId})} className="rounded-lg border border-red-500/15 px-2 text-xs text-red-300">×</button>}</div>}</>:<div className="mt-8 text-sm text-white/25">Позиция свободна</div>}</div>})}</div>
      {subs.length>0&&<div className="mt-5"><h3 className="text-sm font-bold uppercase tracking-[.15em] text-white/35">Запасные</h3><div className="mt-3 flex flex-wrap gap-3">{subs.map(member=><div key={member.id} className="card flex items-center gap-3 rounded-xl px-4 py-3"><div><div className="font-bold">{member.user.username}</div><div className="text-xs text-white/35">SUB</div></div>{data.isCaptain&&<button onClick={()=>manage({action:'removeMember',userId:member.userId})} className="ml-2 text-xs text-red-300">Удалить</button>}</div>)}</div></div>}
    </section>

    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      {data.isCaptain&&<section className="card rounded-2xl p-6"><h2 className="text-xl font-black">Пригласить игрока</h2><p className="mt-1 text-sm text-white/40">Найди зарегистрированного пользователя по username или email.</p><form onSubmit={invite} className="mt-5 grid gap-3 sm:grid-cols-[1fr_180px_auto]"><input name="player" required className="field" placeholder="username или email"/><select name="position" className="field"><option value="1">1 Carry</option><option value="2">2 Mid</option><option value="3">3 Offlane</option><option value="4">4 Soft Support</option><option value="5">5 Hard Support</option><option value="SUB">Запасной</option></select><button className="rounded-xl bg-[#d94a2c] px-4 py-3 font-bold">Пригласить</button></form></section>}

      {!data.isCaptain&&!data.myMembership&&<section className="card rounded-2xl p-6"><h2 className="text-xl font-black">Подать заявку</h2>{data.myRequest?<p className="mt-3 text-sm text-[#ffb7a8]">Твоя заявка уже ожидает решения капитана.</p>:<form onSubmit={apply} className="mt-5 grid gap-3"><select name="position" className="field"><option value="1">1 — Carry</option><option value="2">2 — Mid</option><option value="3">3 — Offlane</option><option value="4">4 — Soft Support</option><option value="5">5 — Hard Support</option><option value="SUB">Запасной</option></select><textarea name="message" maxLength={240} className="field min-h-20 resize-none" placeholder="Коротко о себе, MMR, опыт LAN..."/><button className="rounded-xl bg-[#d94a2c] px-4 py-3 font-bold">Отправить заявку</button></form>}</section>}
    </div>

    {data.isCaptain&&<section className="mt-10"><div className="flex items-center justify-between"><h2 className="text-2xl font-black">Заявки в команду</h2><span className="text-sm text-white/35">{data.requests.length}</span></div>{data.requests.length===0?<div className="card mt-4 rounded-2xl p-6 text-sm text-white/35">Новых заявок пока нет.</div>:<div className="mt-4 grid gap-3">{data.requests.map(req=><div key={req.id} className="card flex flex-col gap-4 rounded-2xl p-5 md:flex-row md:items-center md:justify-between"><div><div className="font-black">{req.user?.username||'Игрок'} <span className="ml-2 text-sm font-normal text-[#ff7b5d]">позиция {req.position} · {labels[req.position]}</span></div>{req.message&&<p className="mt-2 text-sm text-white/45">{req.message}</p>}</div><div className="flex gap-2"><button onClick={()=>manage({action:'respondRequest',requestId:req.id,accept:false})} className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5">Отклонить</button><button onClick={()=>manage({action:'respondRequest',requestId:req.id,accept:true})} className="rounded-xl bg-[#d94a2c] px-4 py-2 text-sm font-bold">Принять</button></div></div>)}</div>}</section>}
  </main>
}
