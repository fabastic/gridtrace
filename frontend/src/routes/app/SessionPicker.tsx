import { useEffect, useState } from 'react'
import { api, type EventSummary, type SeasonSummary } from '../../api/client'
import { TrackThumb, VaultMap } from '../../components/app/VaultMap'
import './SessionPicker.css'

interface EventsState {
  season: number
  events: EventSummary[]
  error: string | null
}

export function SessionPicker({ onPick }: { onPick: (sessionKey: number) => void }) {
  const [seasons, setSeasons] = useState<SeasonSummary[]>([])
  const [season, setSeason] = useState<number | null>(null)
  const [eventsState, setEventsState] = useState<EventsState | null>(null)
  const [seasonsError, setSeasonsError] = useState<string | null>(null)
  const [loadingSeasons, setLoadingSeasons] = useState(true)
  const [hover, setHover] = useState<number | null>(null)

  const effectiveSeason =
    season ?? (seasons.length > 0 ? Math.max(...seasons.map((s) => s.year)) : null)

  const loadedForCurrent = eventsState != null && eventsState.season === effectiveSeason
  const events = eventsState && eventsState.season === effectiveSeason ? eventsState.events : []
  const error = eventsState && eventsState.season === effectiveSeason ? eventsState.error : seasonsError
  const loadingEvents = effectiveSeason != null && !loadedForCurrent

  useEffect(() => {
    let cancelled = false
    api
      .seasons()
      .then((list) => {
        if (cancelled) return
        setSeasons([...list].sort((a, b) => b.year - a.year))
        setLoadingSeasons(false)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setSeasonsError(e instanceof Error ? e.message : String(e))
        setLoadingSeasons(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (effectiveSeason == null) return
    let cancelled = false
    api
      .yearEvents(effectiveSeason)
      .then((page) => {
        if (cancelled) return
        setEventsState({ season: effectiveSeason, events: page.events, error: null })
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setEventsState({
          season: effectiveSeason,
          events: [],
          error: e instanceof Error ? e.message : String(e),
        })
      })
    return () => {
      cancelled = true
    }
  }, [effectiveSeason])

  const loading = loadingSeasons || loadingEvents

  const pick = (ev: EventSummary) => {
    if (ev.ingested && ev.session_key != null) onPick(ev.session_key)
  }

  return (
    <div className="picker vault">
      <div className="picker__inner">
        <p className="mod__kicker">Pitwall module</p>
        <div className="vault__head">
          <h2 className="mod__title">
            Race <em>Vault</em>
          </h2>
          {!loadingSeasons && seasons.length > 0 && (
            <div className="seg vault__seasons" role="tablist" aria-label="Season">
              {seasons.map((s) => (
                <button
                  key={s.year}
                  type="button"
                  role="tab"
                  aria-selected={s.year === effectiveSeason}
                  className={s.year === effectiveSeason ? 'is-on' : ''}
                  onClick={() => setSeason(s.year)}
                >
                  {s.year}
                  <small className="mono"> {s.race_count}</small>
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="mod__sub">
          Every cached session, ready to replay. Pick a round on the map or a card below. Every number in the replay
          traces back to cached timing data.
        </p>
        {loading && <div className="picker__state mono">LOADING…</div>}
        {error && (
          <div className="picker__state picker__state--error mono" role="alert">
            FAILED TO LOAD CATALOG · {error}
          </div>
        )}
        {!loading && !error && events.length === 0 && <div className="picker__state mono">NO EVENTS FOR THIS SEASON</div>}
        {!loading && !error && events.length > 0 && (
          <>
            <div className="vault__map">
              <VaultMap events={events} hover={hover} onHover={setHover} onPick={pick} />
            </div>
            <ul className="vault__grid">
              {events.map((ev) => {
                const ok = ev.ingested && ev.session_key != null
                return (
                  <li key={`${ev.season}-${ev.round}`}>
                    <button
                      type="button"
                      className={`vcard${ok ? '' : ' is-off'}${hover === ev.round ? ' is-on' : ''}`}
                      disabled={!ok}
                      onPointerEnter={() => setHover(ev.round)}
                      onPointerLeave={() => setHover(null)}
                      onClick={() => pick(ev)}
                    >
                      <span className="vcard__top">
                        <b className="mono">{String(ev.round).padStart(2, '0')}</b>
                        <span>
                          <strong>{ev.event_name.replace(' Grand Prix', ' GP')}</strong>
                          <small className="mono">{ev.circuit_name} · {ev.country}</small>
                        </span>
                      </span>
                      <span className="vcard__thumb">
                        <TrackThumb sessionKey={ok ? ev.session_key : null} />
                      </span>
                      <span className="vcard__foot mono">
                        <span>{ev.date_start.slice(0, 10)}</span>
                        <span className={ok ? 'is-ok' : ''}>{ok ? 'REPLAY ↗' : 'NOT INGESTED'}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
