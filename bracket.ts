import 'server-only'
import { createId, DbShape, TeamRecord, TournamentBracketMatchRecord } from './db'

function nextPowerOfTwo(value:number){
  let n=1
  while(n<value)n*=2
  return n
}

function roundLabel(round:number,totalRounds:number){
  const remaining=totalRounds-round
  if(remaining===0)return 'Финал'
  if(remaining===1)return 'Полуфинал'
  if(remaining===2)return '1/4 финала'
  if(remaining===3)return '1/8 финала'
  return `Раунд ${round}`
}

function byId(db:DbShape,id:string|null){return id?db.tournamentBracketMatches.find(m=>m.id===id)||null:null}

function pushWinner(db:DbShape,match:TournamentBracketMatchRecord){
  if(!match.nextMatchId||!match.nextSlot)return
  const next=byId(db,match.nextMatchId)
  if(!next)return
  if(match.nextSlot==='A')next.teamAId=match.winnerTeamId
  else next.teamBId=match.winnerTeamId
}

export function resolveAutomaticAdvancement(db:DbShape,tournamentId:string){
  const matches=db.tournamentBracketMatches.filter(m=>m.tournamentId===tournamentId).sort((a,b)=>a.round-b.round||a.slot-b.slot)
  for(let pass=0;pass<64;pass++){
    let changed=false
    for(const match of matches){
      if(match.status==='FINISHED')continue
      const sourceA=byId(db,match.sourceAId)
      const sourceB=byId(db,match.sourceBId)
      const aResolved=!match.sourceAId||sourceA?.status==='FINISHED'
      const bResolved=!match.sourceBId||sourceB?.status==='FINISHED'
      if(!aResolved||!bResolved)continue
      if(match.teamAId&&match.teamBId){
        if(match.status!=='READY'){match.status='READY';changed=true}
        continue
      }
      match.status='FINISHED'
      match.winnerTeamId=match.teamAId||match.teamBId||null
      match.scoreA=match.teamAId?1:0
      match.scoreB=match.teamBId?1:0
      pushWinner(db,match)
      changed=true
    }
    if(!changed)break
  }
}

export function generateBracket(db:DbShape,tournamentId:string){
  const tournament=db.tournaments.find(t=>t.id===tournamentId)
  if(!tournament)throw new Error('Турнир не найден.')
  const checkedInIds=db.tournamentRegistrations
    .filter(r=>r.tournamentId===tournamentId&&r.status==='APPROVED'&&r.checkIn==='CHECKED_IN')
    .sort((a,b)=>a.createdAt-b.createdAt)
    .map(r=>r.teamId)
  const teamIds=[...new Set(checkedInIds)]
  if(teamIds.length<2)throw new Error('Для сетки нужны минимум 2 команды с пройденным check-in.')
  db.tournamentBracketMatches=db.tournamentBracketMatches.filter(m=>m.tournamentId!==tournamentId)
  const size=nextPowerOfTwo(teamIds.length)
  const totalRounds=Math.log2(size)
  const createdAt=Date.now()
  const rounds: TournamentBracketMatchRecord[][]=[]
  for(let round=1;round<=totalRounds;round++){
    const count=size/(2**round)
    const list:TournamentBracketMatchRecord[]=[]
    for(let slot=0;slot<count;slot++){
      list.push({id:createId(),tournamentId,round,roundLabel:roundLabel(round,totalRounds),slot,teamAId:null,teamBId:null,scoreA:0,scoreB:0,winnerTeamId:null,sourceAId:null,sourceBId:null,nextMatchId:null,nextSlot:null,status:'WAITING',createdAt})
    }
    rounds.push(list)
  }
  const padded=[...teamIds,...Array(size-teamIds.length).fill(null)] as (string|null)[]
  rounds[0].forEach((match,index)=>{match.teamAId=padded[index*2]||null;match.teamBId=padded[index*2+1]||null})
  for(let r=1;r<rounds.length;r++){
    rounds[r].forEach((match,index)=>{
      const a=rounds[r-1][index*2],b=rounds[r-1][index*2+1]
      match.sourceAId=a.id;match.sourceBId=b.id
      a.nextMatchId=match.id;a.nextSlot='A'
      b.nextMatchId=match.id;b.nextSlot='B'
    })
  }
  db.tournamentBracketMatches.push(...rounds.flat())
  resolveAutomaticAdvancement(db,tournamentId)
  return rounds.flat()
}

export function setBracketResult(db:DbShape,tournamentId:string,matchId:string,scoreA:number,scoreB:number){
  const match=db.tournamentBracketMatches.find(m=>m.id===matchId&&m.tournamentId===tournamentId)
  if(!match)throw new Error('Матч сетки не найден.')
  if(!match.teamAId||!match.teamBId)throw new Error('Обе команды матча ещё не определены.')
  if(scoreA===scoreB)throw new Error('В турнирном матче не может быть ничьей.')
  if(scoreA<0||scoreB<0||scoreA>9||scoreB>9)throw new Error('Некорректный счёт.')
  match.scoreA=scoreA;match.scoreB=scoreB
  match.winnerTeamId=scoreA>scoreB?match.teamAId:match.teamBId
  match.status='FINISHED'
  pushWinner(db,match)
  resolveAutomaticAdvancement(db,tournamentId)
  return match
}

export function resetBracket(db:DbShape,tournamentId:string){
  db.tournamentBracketMatches=db.tournamentBracketMatches.filter(m=>m.tournamentId!==tournamentId)
}

export function bracketView(db:DbShape,tournamentId:string){
  const team=(id:string|null):TeamRecord|null=>id?db.teams.find(t=>t.id===id)||null:null
  const matches=db.tournamentBracketMatches.filter(m=>m.tournamentId===tournamentId).sort((a,b)=>a.round-b.round||a.slot-b.slot)
  const maxRound=matches.reduce((m,x)=>Math.max(m,x.round),0)
  return {
    generated:matches.length>0,
    rounds:Array.from({length:maxRound},(_,i)=>i+1).map(round=>({
      round,
      label:matches.find(m=>m.round===round)?.roundLabel||`Раунд ${round}`,
      matches:matches.filter(m=>m.round===round).map(m=>({...m,teamA:team(m.teamAId),teamB:team(m.teamBId),winnerTeam:team(m.winnerTeamId)})),
    }))
  }
}
