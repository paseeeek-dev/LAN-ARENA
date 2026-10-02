import Link from 'next/link'
import MatchCard from '@/components/MatchCard'

const tournaments = [
  {title:'Moscow Dota LAN Cup', game:'Dota 2', city:'Москва', teams:16, prize:'500 000 ₽', status:'Регистрация открыта'},
  {title:'Northern Clash', game:'CS2', city:'Санкт-Петербург', teams:8, prize:'250 000 ₽', status:'Скоро'},
  {title:'Weekend Championship', game:'Valorant', city:'Казань', teams:12, prize:'150 000 ₽', status:'LIVE'},
]

export default function Home(){
  return <main className="grid-noise min-h-screen overflow-hidden">
    <section className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:pt-16 md:px-6 md:pb-16 md:pt-28">
      <div className="hero-enter max-w-4xl">
        <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[.035] px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-white/55">Турниры · команды · матчи · статистика</div>
        <h1 className="text-[2.65rem] font-black leading-[.96] tracking-[-.04em] sm:text-5xl md:text-8xl">LAN-ТУРНИРЫ<br/><span className="text-[#d94a2c]">БЕЗ ХАОСА.</span></h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/55 sm:mt-7 sm:text-lg sm:leading-8">Единая площадка для локальных киберспортивных турниров: создавай команду, регистрируйся на LAN, следи за сеткой, матчами и статистикой.</p>
        <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
          <Link href="/tournaments" className="lift rounded-xl bg-[#d94a2c] px-5 py-3 font-bold hover:bg-[#ef5a3c]">Найти турнир</Link>
          <Link href="/teams" className="lift rounded-xl border border-white/10 px-5 py-3 font-bold hover:bg-white/5">Найти команду</Link>
          <Link href="/register" className="lift rounded-xl border border-white/10 px-5 py-3 font-bold text-white/70 hover:bg-white/5 hover:text-white">Создать аккаунт</Link>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-xs uppercase tracking-[.2em] text-white/35">Матчи</div><h2 className="mt-2 text-3xl font-black">LIVE и ближайшие</h2></div><Link href="/matches" className="text-sm text-[#ff7b5d]">Все матчи →</Link></div>
      <div className="grid gap-4 md:grid-cols-3">
        <MatchCard teamA="Team Phoenix" teamB="Void Five" score="1:1" status="LIVE · Game 3" event="Moscow Dota LAN Cup" format="BO3" live/>
        <MatchCard teamA="Northern Wolves" teamB="Cyber Bears" score="0:0" status="Сегодня · 18:00" event="Northern Clash" format="BO3"/>
        <MatchCard teamA="Red Dragons" teamB="Team Aurora" score="0:0" status="Завтра · 15:30" event="Weekend Championship" format="BO1"/>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="mb-5"><div className="text-xs uppercase tracking-[.2em] text-white/35">События</div><h2 className="mt-2 text-3xl font-black">Активные LAN-турниры</h2></div>
      <div className="grid gap-4 md:grid-cols-3">{tournaments.map((t)=><div key={t.title} className="card lift overflow-hidden rounded-2xl">
        <div className="h-36 bg-gradient-to-br from-[#27120d] via-[#16181f] to-[#0b0d12] p-5"><div className="text-xs uppercase tracking-[.2em] text-white/40">{t.game}</div><div className="mt-10 text-2xl font-black">{t.title}</div></div>
        <div className="space-y-4 p-5"><div className="grid grid-cols-2 gap-4 text-sm"><div><div className="text-white/35">Город</div><div className="mt-1 font-semibold">{t.city}</div></div><div><div className="text-white/35">Команд</div><div className="mt-1 font-semibold">{t.teams}</div></div><div><div className="text-white/35">Призовой фонд</div><div className="mt-1 font-semibold">{t.prize}</div></div><div><div className="text-white/35">Статус</div><div className="mt-1 font-semibold text-[#ff7b5d]">{t.status}</div></div></div><Link href="/tournaments" className="block rounded-xl border border-white/10 px-4 py-3 text-center font-semibold hover:bg-white/5">Подробнее</Link></div>
      </div>)}</div>
    </section>

    <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[.055] to-white/[.02] p-7 md:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#d94a2c]/10 blur-3xl" />
        <div className="relative grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div><div className="text-4xl font-black">16</div><div className="mt-2 text-sm text-white/40">LAN-турниров</div></div>
          <div><div className="text-4xl font-black">84</div><div className="mt-2 text-sm text-white/40">Команды</div></div>
          <div><div className="text-4xl font-black">420+</div><div className="mt-2 text-sm text-white/40">Игроков</div></div>
          <div><div className="text-4xl font-black">190+</div><div className="mt-2 text-sm text-white/40">Матчей проведено</div></div>
        </div>
      </div>
    </section>
  </main>
}
