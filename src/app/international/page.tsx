'use client'

import { useMemo, useState } from 'react'

type Edition = {
  year: string
  place: string
  winner: string
  runner: string
  youtubeId?: string
  watch?: string
  cancelled?: boolean
}

const editions: Edition[] = [
  { year: '2026', place: 'Shanghai, China', winner: 'Team Spirit', runner: 'TEAM VISION', youtubeId: 'GMbjTK8UVks', watch: 'https://www.youtube.com/watch?v=GMbjTK8UVks' },
  { year: '2025', place: 'Hamburg, Germany', winner: 'Team Falcons', runner: 'Xtreme Gaming', youtubeId: 'TGmnhNbna8Q', watch: 'https://www.youtube.com/watch?v=TGmnhNbna8Q' },
  { year: '2024', place: 'Copenhagen, Denmark', winner: 'Team Liquid', runner: 'Gaimin Gladiators', youtubeId: 'P16ZVHkryD4', watch: 'https://www.youtube.com/watch?v=P16ZVHkryD4' },
  { year: '2023', place: 'Seattle, USA', winner: 'Team Spirit', runner: 'Gaimin Gladiators' },
  { year: '2022', place: 'Singapore', winner: 'Tundra Esports', runner: 'Team Secret' },
  { year: '2021', place: 'Bucharest, Romania', winner: 'Team Spirit', runner: 'PSG.LGD' },
  { year: '2020', place: '—', winner: 'Турнир не проводился', runner: 'TI10 был перенесён на 2021', cancelled: true },
  { year: '2019', place: 'Shanghai, China', winner: 'OG', runner: 'Team Liquid' },
  { year: '2018', place: 'Vancouver, Canada', winner: 'OG', runner: 'PSG.LGD' },
  { year: '2017', place: 'Seattle, USA', winner: 'Team Liquid', runner: 'Newbee' },
]

const searchLink = (year: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`Dota 2 The International ${year} Grand Final full`)}`

export default function InternationalPage() {
  const [active, setActive] = useState<Edition | null>(null)

  const featured = useMemo(() => editions.filter((e) => e.youtubeId), [])
  const archive = useMemo(() => editions.filter((e) => !e.youtubeId), [])

  return (
    <main className="min-h-[calc(100vh-74px)] px-4 py-12 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-[.2em] text-[#ff7b5d]">Dota 2 archive · 2017—2026</div>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl md:text-6xl">The International</h1>
          <p className="mt-4 text-base leading-7 text-white/50 sm:text-lg sm:leading-8">
            Архив The International внутри LAN ARENA. Доступные записи открываются в плеере прямо на сайте, а для старых турниров можно перейти к поиску полной записи на YouTube.
          </p>
        </div>

        <section className="mb-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.18em] text-white/30">Watch inside LAN ARENA</div>
              <h2 className="mt-1 text-2xl font-black md:text-3xl">Доступные записи</h2>
            </div>
            <div className="hidden rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-white/35 md:block">
              Видео загружается с YouTube
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {featured.map((e) => (
              <article key={e.year} className="card group overflow-hidden rounded-3xl">
                <button onClick={() => setActive(e)} className="relative block aspect-video w-full overflow-hidden bg-black text-left">
                  <img
                    src={`https://i.ytimg.com/vi/${e.youtubeId}/hqdefault.jpg`}
                    alt={`The International ${e.year}`}
                    className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.035] group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-black/55 text-2xl backdrop-blur-xl transition duration-300 group-hover:scale-110 group-hover:bg-[#d94a2c]">▶</span>
                  </div>
                  <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-xs font-bold backdrop-blur-md">TI {e.year}</div>
                </button>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[.14em] text-white/30">Grand Final archive</div>
                      <h3 className="mt-1 text-xl font-black">The International {e.year}</h3>
                    </div>
                    <div className="text-right text-xs text-white/30">{e.place}</div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/8 bg-white/[.025] p-3">
                      <div className="text-[10px] uppercase tracking-[.15em] text-white/25">Победитель</div>
                      <div className="mt-1 font-black">{e.winner}</div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[.025] p-3">
                      <div className="text-[10px] uppercase tracking-[.15em] text-white/25">Финалист</div>
                      <div className="mt-1 font-bold text-white/65">{e.runner}</div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button onClick={() => setActive(e)} className="rounded-xl bg-[#d94a2c] px-4 py-2.5 text-sm font-black transition hover:brightness-110">▶ Смотреть</button>
                    <a href={e.watch} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold transition hover:bg-white/5">YouTube ↗</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-5">
            <div className="text-xs font-bold uppercase tracking-[.18em] text-white/30">Archive</div>
            <h2 className="mt-1 text-2xl font-black md:text-3xl">Предыдущие турниры</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {archive.map((e) => (
              <article key={e.year} className="card flex min-h-64 flex-col justify-between rounded-3xl p-6">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[.18em] text-white/25">The International</div>
                      <div className="mt-1 text-5xl font-black text-[#d94a2c]">{e.year}</div>
                    </div>
                    <div className="rounded-full border border-white/8 px-3 py-1.5 text-xs text-white/35">{e.place}</div>
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[.14em] text-white/25">{e.cancelled ? 'Статус' : 'Победитель'}</div>
                      <div className="mt-1 font-black">{e.winner}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[.14em] text-white/25">{e.cancelled ? 'Комментарий' : 'Финалист'}</div>
                      <div className="mt-1 font-semibold text-white/55">{e.runner}</div>
                    </div>
                  </div>
                </div>

                {!e.cancelled && (
                  <a href={searchLink(e.year)} target="_blank" rel="noreferrer" className="mt-8 inline-flex w-fit rounded-xl border border-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/5">Найти запись на YouTube ↗</a>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>

      {active?.youtubeId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-xl" onMouseDown={() => setActive(null)}>
          <div className="max-h-[94dvh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0b0e] shadow-2xl sm:rounded-3xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-4 md:px-6">
              <div>
                <div className="text-xs uppercase tracking-[.16em] text-white/30">Now watching</div>
                <div className="mt-1 font-black">The International {active.year}</div>
              </div>
              <button onClick={() => setActive(null)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-lg text-white/65 transition hover:bg-white/5 hover:text-white">×</button>
            </div>

            <div className="aspect-video min-h-0 bg-black">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${active.youtubeId}?autoplay=1&rel=0`}
                title={`The International ${active.year}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
              <div className="text-sm text-white/45">{active.winner} · {active.runner} · {active.place}</div>
              <a href={active.watch} target="_blank" rel="noreferrer" className="w-fit rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold transition hover:bg-white/5">Открыть на YouTube ↗</a>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
