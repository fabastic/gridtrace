import { useEffect, useRef, useState } from 'react'
import { scrollToTarget } from '../../hooks/useSmoothScroll'

const SECTIONS = [
  { id: 'top', label: 'Start' },
  { id: 'manifesto', label: 'Thesis' },
  { id: 'warp', label: 'Replay' },
  { id: 'studies', label: 'Studies' },
  { id: 'garage', label: 'Garage' },
  { id: 'pitwall', label: 'Pitwall' },
]

const R = 46
const C = 2 * Math.PI * R

export function TyreProgress({ visible }: { visible: boolean }) {
  const wheel = useRef<SVGGElement>(null)
  const arc = useRef<SVGCircleElement>(null)
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const [past, setPast] = useState(false)

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let angle = 0
    let target = 0
    let lastY = window.scrollY
    const tick = () => {
      const y = window.scrollY
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const p = Math.min(1, Math.max(0, y / max))
      if (arc.current) arc.current.style.strokeDashoffset = String(C * (1 - p))
      if (!reduced) {
        target += (y - lastY) * 0.35
        lastY = y
        angle += (target - angle) * 0.12
        if (wheel.current) wheel.current.style.transform = `rotate(${angle.toFixed(2)}deg)`
      }
      if (!reduced && Math.abs(target - angle) > 0.05) raf = requestAnimationFrame(tick)
      else raf = 0
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    tick()
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', kick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', kick)
      window.removeEventListener('resize', kick)
    }
  }, [])

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const idx = SECTIONS.findIndex((s) => s.id === e.target.id)
          if (idx >= 0) setActive(idx)
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const spokes = Array.from({ length: 10 }, (_, i) => i * 36)

  return (
    <div className={`tyreprog${visible && past ? ' is-visible' : ''}${open ? ' is-open' : ''}`}>
      <ol className="tyreprog__list" aria-label="Page sections">
        {SECTIONS.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              tabIndex={open ? 0 : -1}
              className={i === active ? 'is-on' : ''}
              onClick={() => {
                setOpen(false)
                scrollToTarget(s.id === 'top' ? 0 : `#${s.id}`)
              }}
            >
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              {s.label}
            </button>
          </li>
        ))}
      </ol>

      <div className="tyreprog__label" aria-hidden="true">
        <span className="mono">
          {String(active + 1).padStart(2, '0')} / {String(SECTIONS.length).padStart(2, '0')}
        </span>
        <b key={active}>{SECTIONS[active].label}</b>
      </div>

      <button
        type="button"
        className="tyreprog__btn"
        aria-expanded={open}
        aria-label={`Section ${active + 1} of ${SECTIONS.length}: ${SECTIONS[active].label}. Open section list`}
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r={R} className="tyreprog__track" />
          <circle
            ref={arc}
            cx="60"
            cy="60"
            r={R}
            className="tyreprog__arc"
            strokeDasharray={C}
            strokeDashoffset={C}
            transform="rotate(-90 60 60)"
          />
          <g ref={wheel} className="tyreprog__wheel">
            <circle cx="60" cy="60" r="40" fill="#141414" />
            <circle cx="60" cy="60" r="40" fill="none" stroke="#000" strokeWidth="1.5" />
            <circle cx="60" cy="60" r="31.5" fill="none" stroke="var(--team-primary)" strokeWidth="2.2" />
            <circle cx="60" cy="60" r="36" fill="none" stroke="var(--team-primary)" strokeWidth="1" strokeDasharray="7 3.5" opacity="0.85" />
            <circle cx="60" cy="60" r="28" fill="#2a2b2e" />
            {spokes.map((a) => (
              <path key={a} d="M58.6 36 L61.4 36 L63 55 L57 55 Z" fill="#45474c" transform={`rotate(${a} 60 60)`} />
            ))}
            <circle cx="60" cy="60" r="9" fill="var(--team-primary)" />
            <circle cx="60" cy="60" r="4.5" fill="#121212" />
            <circle cx="60" cy="31" r="1.6" fill="#f1ece4" />
          </g>
          {SECTIONS.map((_, i) => {
            const a = ((i / SECTIONS.length) * 360 - 90) * (Math.PI / 180)
            return (
              <circle
                key={i}
                cx={60 + Math.cos(a) * 54}
                cy={60 + Math.sin(a) * 54}
                r={i === active ? 3 : 1.8}
                className={`tyreprog__pip${i <= active ? ' is-on' : ''}`}
              />
            )
          })}
        </svg>
      </button>
    </div>
  )
}
