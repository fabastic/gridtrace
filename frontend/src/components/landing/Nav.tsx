import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import Magnet from '../reactbits/Magnet/Magnet'
import { lockScroll, scrollToTarget } from '../../hooks/useSmoothScroll'
import { useTeam } from '../../theme/useTeam'
import { Mark } from './Mark'

const LINKS = [
  { href: '#garage', label: 'Garage' },
  { href: '#finish', label: 'Finish' },
]

const MODULES = [
  { to: '/app', label: 'Race Control', note: 'Spatial circuit, timing tower, every race-control call on one clock', live: true },
  { to: '/app/battle', label: 'Battle Lab', note: 'Two drivers, one distance axis: speed, throttle, brake, delta', live: true },
  { to: '/app', label: 'Intelligence', note: 'Why positions changed: pit windows, undercuts, traffic', live: false },
  { to: '/app', label: 'Strategy Lab', note: 'What-if tyre and stop calls, labelled as simulation', live: false },
  { to: '/app', label: 'Driver Lab', note: 'One driver across sessions: pace, consistency, tyre life', live: false },
  { to: '/app', label: 'Race Vault', note: 'Archive of cached sessions to replay', live: false },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { team } = useTeam()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closing = useRef(false)

  const close = useCallback((after?: () => void) => {
    if (closing.current) return
    closing.current = true
    gsap
      .timeline({
        onComplete: () => {
          closing.current = false
          setOpen(false)
          if (after) window.setTimeout(after, 450)
        },
      })
      .to('.menu__link, .menu__note', { yPercent: -110, duration: 0.4, ease: 'expo.in', stagger: { each: 0.025, from: 'end' } })
      .to('.menu__aside > *, .menu__pages > *', { y: -24, opacity: 0, duration: 0.3, ease: 'power2.in', stagger: 0.03 }, 0)
      .to('.menu__row', { '--line': 0, duration: 0.35, ease: 'power2.in' }, 0.05)
  }, [])

  useEffect(() => {
    lockScroll(open)
    if (!open) return
    const tl = gsap.timeline({ delay: 0.2 })
    tl.fromTo('.menu__row', { '--line': 0 }, { '--line': 1, duration: 0.8, ease: 'expo.out', stagger: 0.05 })
      .fromTo('.menu__link, .menu__note', { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.04 }, 0.05)
      .fromTo('.menu__aside > *, .menu__pages > *', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.05 }, 0.2)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => {
      tl.kill()
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  const go = (href: string) => close(() => scrollToTarget(href))

  return (
    <>
      <header className={`nav${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
        <a href="#top" className="nav__brand" onClick={(e) => (e.preventDefault(), scrollToTarget(0))}>
          <span className="nav__brand-serif">Grid</span>
          <span className="nav__brand-bold">TRACE</span>
        </a>
        <div className="nav__center" aria-hidden="true">
          <Mark size={30} />
        </div>
        <div className="nav__actions">
          <span className="nav__theme mono" title="Active team theme">
            <i style={{ background: team.colors.primary }} />
            {team.label}
          </span>
          <Magnet padding={40} magnetStrength={4}>
            <Link to="/app" className="btn btn--primary btn--sm">
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2 10 L10 2 M4 2 H10 V8" stroke="currentColor" strokeWidth="1.6" fill="none" />
              </svg>
              Pitwall
            </Link>
          </Magnet>
          <button
            type="button"
            className="nav__menu-btn"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => (open ? close() : setOpen(true))}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div id="site-menu" className={`menu${open ? ' is-open' : ''}`} aria-hidden={!open}>
        <nav className="menu__nav" aria-label="Pitwall modules">
          <p className="menu__kicker mono">INSIDE THE PITWALL</p>
          {MODULES.map((m, i) => (
            <Link
              key={m.label}
              to={m.live ? m.to : '#'}
              tabIndex={open ? 0 : -1}
              aria-disabled={!m.live}
              className={`menu__row${m.live ? '' : ' is-soon'}`}
              onClick={(e) => {
                if (!m.live) e.preventDefault()
              }}
            >
              <span className="menu__idx mono">{String(i + 1).padStart(2, '0')}</span>
              <span className="menu__mask">
                <span className="menu__link">{m.label}</span>
              </span>
              <span className="menu__mask menu__mask--note">
                <span className="menu__note">
                  {m.note}
                  <b className="mono">{m.live ? 'OPEN ↗' : 'SOON'}</b>
                </span>
              </span>
            </Link>
          ))}
        </nav>
        <div className="menu__side">
          <div className="menu__pages">
            <p className="menu__kicker mono">ON THIS PAGE</p>
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                tabIndex={open ? 0 : -1}
                onClick={(e) => {
                  e.preventDefault()
                  go(l.href)
                }}
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="menu__aside">
            <p className="menu__kicker mono">FLAGSHIP REPLAY</p>
            <p className="menu__big">Silverstone · 2024</p>
            <p className="menu__meta mono">SESSION 9558 · REPLAY DATA</p>
            <Link to="/app" className="btn btn--primary" tabIndex={open ? 0 : -1}>
              Enter the pitwall
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
