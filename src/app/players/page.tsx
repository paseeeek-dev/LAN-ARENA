'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '@/lib/api'

type Player={id:string;username:string;points:number;position:string;mmr:number;winrate:number;matches:number;team:{id:string;name:string;tag:string}|null;lookingForTeam:boolean;real:boolean}
type Team={id:string;name:string;tag:string}
type Data={players:Player[];myTeam:Team|null;isCaptain:boolean}

const positionOptions=['Все роли','Carry','Mid','Offlane','Soft Support','Hard Support']

export default function PlayersPage(){
  const [data,setData]=useState<Data>({players:[],myTeam:null,isCaptain:false})
  const [query,setQuery]=useState(''),[position,setPosition]=useState('Все роли'),[onlyLft,setOnlyLft]=useState(false),[sort,setSort]=useState<'MMR'|'WINRATE'|'MATCHES'>('MMR'),[notice,setNotice]=useState('')
  async function load(){try{setData(await apiFetch<Data>('/api/players'))}catch{}}
  useEffect(()=>{load()},[])
  const filtered=useMemo(()=>data.players.filter(p=>{
    if(query&&!p.username.toLowerCase().includes(query.toLowerCase())&&!p.team?.name.toLowerCase().includes(query.toLowerCase()))return false
    if(position!=='Все роли'&&p.position!==position)return false
    if(onlyLft&&!p.lookingForTeam)return false
    return true
  }).sort((a,b)=>sort==='MMR'?b.mmr-a.mmr:sort==='WINRATE'?b.winrate-a.winrate:b.matches-a.matches),[data.players,query,position,onlyLft,sort])
  async function invite(player:Player){
    if(!data.myTeam||!data.isCaptain||!player.real)return
    const map:Record<string,string>={Carry:'1',Mid:'2',Offlane:'3','Soft Support':'4','Hard Support':'5'}
    try{await apiFetch(`/api/teams/${data.myTeam.id}/invite`,{method:'POST',body:JSON.stringify({player:player.username,position:map[player.position]||'SUB'})});setNotice(`Приглашение для ${player.username} отправлено.`)}catch(e){setNotice(e instanceof Error?e.message:'Не удалось отправить приглашение.')}
    setTimeout(()=>setNotice(''),2800)
  }
  const top=data.players.slice().sort((a,b)=>b.mmr-a.mmr)[0]
  return <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#ff8064]">Player hub</div><h1 className="mt-2 text-3xl font-black sm:text-4xl md:text-5xl">Игроки</h1><p className="mt-3 max-w-2xl text-white/45">Ищи тиммейтов, сравнивай MMR и статистику, находи свободных игроков и приглашай их в команду.</p></div><div className="grid grid-cols-3 gap-3"><Stat label="Игроков" value={String(data.players.length)}/><Stat label="Ищут команду" value={String(data.players.filter(p=>p.lookingForTeam).length)}/><Stat label="Топ MMR" value={top?String(top.mmr):'—'}/></div></div>
    {notice&&<div className="mt-5 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/65">{notice}</div>}
    <section className="card mt-8 rounded-3xl p-5"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_.8fr_.8fr_auto]"><input className="field" placeholder="Игрок или команда..." value={query} onChange={e=>setQuery(e.target.value)}/><select className="field" value={position} onChange={e=>setPosition(e.target.value)}>{positionOptions.map(x=><option key={x}>{x}</option>)}</select><select className="field" value={sort} onChange={e=>setSort(e.target.value as any)}><option value="MMR">Сначала по MMR</option><option value="WINRATE">Сначала по winrate</option><option value="MATCHES">Сначала по матчам</option></select><label className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/60"><input type="checkbox" checked={onlyLft} onChange={e=>setOnlyLft(e.target.checked)}/> Только LFT</label></div></section>
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((p,index)=><article key={p.id} className="card lift relative overflow-hidden rounded-3xl p-5"><div className="absolute right-4 top-4 text-5xl font-black text-white/[.035]">#{index+1}</div><div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#d94a2c] to-[#6f1f16] text-xl font-black">{p.username.slice(0,2).toUpperCase()}</div><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate text-xl font-black">{p.username}</h2>{p.lookingForTeam&&<span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-2 py-1 text-[10px] font-black uppercase tracking-[.12em] text-emerald-300">LFT</span>}</div><div className="mt-1 text-sm text-white/40">{p.position} · {p.team?`${p.team.name} [${p.team.tag}]`:'без команды'}</div></div></div><div className="mt-5 grid grid-cols-3 gap-1.5 sm:gap-2"><Mini label="MMR" value={String(p.mmr)}/><Mini label="WR" value={`${p.winrate}%`}/><Mini label="Матчи" value={String(p.matches)}/></div><div className="mt-5 grid gap-2 sm:flex">{p.real?<Link href={`/players/${p.id}`} className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-bold transition hover:bg-white/5">Профиль</Link>:<div className="flex-1 rounded-xl border border-white/8 px-4 py-3 text-center text-sm text-white/25">Демо-профиль</div>}{data.isCaptain&&p.real&&p.lookingForTeam&&<button onClick={()=>invite(p)} className="rounded-xl bg-[#d94a2c] px-4 py-3 text-sm font-black">Пригласить</button>}</div></article>)}</div>
    {filtered.length===0&&<div className="mt-10 rounded-3xl border border-dashed border-white/10 p-12 text-center text-white/35">По этим фильтрам никого не нашли.</div>}
  </main>
}
function Stat({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-white/10 bg-white/[.025] px-4 py-3"><div className="text-[10px] uppercase tracking-[.13em] text-white/30">{label}</div><div className="mt-1 text-xl font-black">{value}</div></div>}
function Mini({label,value}:{label:string;value:string}){return <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-3"><div className="text-[10px] text-white/30">{label}</div><div className="mt-1 font-black">{value}</div></div>}
