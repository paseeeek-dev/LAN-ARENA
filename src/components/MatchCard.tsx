type Props = { teamA:string; teamB:string; score:string; status:string; event:string; format:string; live?:boolean }
export default function MatchCard({teamA,teamB,score,status,event,format,live}:Props){
  return <div className="card rounded-2xl p-5 transition hover:-translate-y-1 hover:border-white/15">
    <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[.14em] text-white/45">
      <span>{event}</span>
      <span className={live?'rounded-full bg-red-500/15 px-2.5 py-1 text-red-400':'text-white/50'}>{status}</span>
    </div>
    <div className="space-y-3">
      <div className="flex items-center justify-between"><span className="font-semibold">{teamA}</span><span className="text-xl font-black">{score.split(':')[0]}</span></div>
      <div className="flex items-center justify-between"><span className="font-semibold">{teamB}</span><span className="text-xl font-black">{score.split(':')[1]}</span></div>
    </div>
    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-white/45">
      <span>{format}</span><span>Dota 2</span>
    </div>
  </div>
}
