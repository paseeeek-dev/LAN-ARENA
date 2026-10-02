'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

type Member = { id:string; userId:string; position:string; user:{username:string}; isCaptain:boolean }
type Team = { id:string; name:string; tag:string; game:string; country:string; description:string; captainUserId:string; members:Member[] }
type Invite = { id:string; teamId:string; position:string; team?:{id:string;name:string;tag:string} }

type Data = { teams:Team[]; myMembership:{teamId:string}|null; invites:Invite[] }

const posLabel:Record<string,string> = { '1':'Carry','2':'Mid','3':'Offlane','4':'Soft Support','5':'Hard Support','SUB':'Запасной' }

export default function TeamsPage(){
  const [data,setData]=useState<Data>({teams:[],myMembership:null,invites:[]})
  const [open,setOpen]=useState(false)
  const [error,setError]=useState('')
  const [notice,setNotice]=useState('')
  const [loading,setLoading]=useState(true)

  async function load(){
    setLoading(true)
    try{ setData(await apiFetch<Data>('/api/teams')) } catch{} finally{ setLoading(false) }
  }
  useEffect(()=>{load()},[])

  async function createTeam(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setError(''); setNotice('')
    const fd=new FormData(e.currentTarget)
    try{
      const result=await apiFetch<{team:Team}>('/api/teams',{method:'POST',body:JSON.stringify({name:fd.get('name'),tag:fd.get('tag'),country:fd.get('country'),description:fd.get('description'),position:fd.get('position')})})
      setNotice(`Команда ${result.team.name} создана.`); setOpen(false); await load()
    }catch(err){setError(err instanceof Error?err.message:'Ошибка')}
  }

  async function inviteAnswer(invite:Invite,accept:boolean){
    setError('');
    try{ await apiFetch(`/api/teams/${invite.teamId}/manage`,{method:'POST',body:JSON.stringify({action:'respondInvite',inviteId:invite.id,accept})}); await load() }
    catch(err){setError(err instanceof Error?err.message:'Ошибка')}
  }

  const myTeam = data.myMembership ? data.teams.find((team)=>team.id===data.myMembership?.teamId) : null

  return <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div><div className="text-xs font-bold uppercase tracking-[.2em] text-[#ff7b5d]">Dota 2 roster system</div><h1 className="mt-2 text-4xl font-black">Команды</h1><p className="mt-3 max-w-2xl text-white/45">Создавай состав, занимай одну из пяти позиций, приглашай игроков и принимай заявки.</p></div>
      {!data.myMembership && <button onClick={()=>setOpen(!open)} className="rounded-xl bg-[#d94a2c] px-5 py-3 font-bold transition hover:bg-[#ef5a3c]">{open?'Закрыть':'Создать команду'}</button>}
    </div>

    {error&&<div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
    {notice&&<div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</div>}

    {data.invites.length>0&&<section className="mt-8"><h2 className="text-xl font-black">Приглашения</h2><div className="mt-4 grid gap-3">{data.invites.map(invite=><div key={invite.id} className="card flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-bold">{invite.team?.name || 'Команда'} <span className="text-white/35">[{invite.team?.tag}]</span></div><div className="mt-1 text-sm text-white/45">Тебя зовут на позицию {invite.position} · {posLabel[invite.position]}</div></div><div className="flex gap-2"><button onClick={()=>inviteAnswer(invite,false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5">Отклонить</button><button onClick={()=>inviteAnswer(invite,true)} className="rounded-xl bg-[#d94a2c] px-4 py-2 text-sm font-bold">Принять</button></div></div>)}</div></section>}

    {myTeam&&<Link href={`/teams/${myTeam.id}`} className="card lift mt-8 block rounded-2xl border-[#d94a2c]/20 p-6"><div className="text-xs font-bold uppercase tracking-[.18em] text-[#ff7b5d]">Моя команда</div><div className="mt-2 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-[#d94a2c]/15 font-black text-[#ff7b5d]">{myTeam.tag.slice(0,2)}</div><div><div className="text-xl font-black">{myTeam.name}</div><div className="text-sm text-white/40">{myTeam.members.length} участников · открыть управление →</div></div></div></Link>}

    {open&&<form onSubmit={createTeam} className="card mt-8 grid gap-4 rounded-2xl p-6 md:grid-cols-2"><div className="md:col-span-2"><h2 className="text-xl font-black">Новая команда</h2><p className="mt-1 text-sm text-white/40">Создатель автоматически становится капитаном.</p></div><label><span className="mb-2 block text-sm text-white/55">Название</span><input required name="name" className="field" placeholder="Night Raiders"/></label><label><span className="mb-2 block text-sm text-white/55">Тег</span><input required maxLength={8} name="tag" className="field" placeholder="NR"/></label><label><span className="mb-2 block text-sm text-white/55">Страна</span><input name="country" className="field" defaultValue="Россия"/></label><label><span className="mb-2 block text-sm text-white/55">Твоя позиция</span><select name="position" className="field"><option value="1">1 — Carry</option><option value="2">2 — Mid</option><option value="3">3 — Offlane</option><option value="4">4 — Soft Support</option><option value="5">5 — Hard Support</option><option value="SUB">Запасной</option></select></label><label className="md:col-span-2"><span className="mb-2 block text-sm text-white/55">Описание</span><textarea name="description" className="field min-h-24 resize-none" placeholder="О команде, цели, город, LAN-опыт..."/></label><button className="rounded-xl bg-[#d94a2c] px-5 py-3 font-bold md:col-span-2">Создать команду</button></form>}

    <section className="mt-10"><div className="flex items-center justify-between"><h2 className="text-xl font-black">Все команды</h2><span className="text-sm text-white/35">{data.teams.length} команд</span></div>{loading?<div className="mt-6 text-white/40">Загрузка...</div>:data.teams.length===0?<div className="card mt-6 rounded-2xl p-8 text-center text-white/40">Пока нет ни одной пользовательской команды. Создай первую.</div>:<div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{data.teams.map(team=><Link href={`/teams/${team.id}`} key={team.id} className="card lift rounded-2xl p-6"><div className="flex items-start justify-between"><div className="grid h-14 w-14 place-items-center rounded-xl bg-[#d94a2c]/12 text-lg font-black text-[#ff7b5d]">{team.tag.slice(0,2)}</div><span className="rounded-lg border border-white/8 bg-white/[.025] px-2.5 py-1 text-xs text-white/45">{team.members.length}/5+</span></div><h3 className="mt-5 text-xl font-black">{team.name}</h3><div className="mt-1 text-sm text-white/40">[{team.tag}] · {team.game} · {team.country}</div><div className="mt-5 flex gap-1.5">{['1','2','3','4','5'].map(pos=><div key={pos} title={posLabel[pos]} className={`grid h-8 w-8 place-items-center rounded-lg border text-xs font-black ${team.members.some(m=>m.position===pos)?'border-[#d94a2c]/25 bg-[#d94a2c]/10 text-[#ff7b5d]':'border-white/8 bg-white/[.02] text-white/20'}`}>{pos}</div>)}</div></Link>)}</div>}</section>
  </main>
}
