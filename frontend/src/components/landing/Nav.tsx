import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import Magnet from '../reactbits/Magnet/Magnet'
import { lockScroll, scrollToTarget } from '../../hooks/useSmoothScroll'
import { useTeam } from '../../theme/useTeam'
import { Mark } from './Mark'

const LINKS = [
  { href: '#manifesto', label: 'Thesis', idx: '01' },
  { href: '#warp', label: 'Replay', idx: '02' },
  { href: '#studies', label: 'Studies', idx: '03' },
  { href: '#garage', label: 'Garage', idx: '04' },
  { href: '#pitwall', label: 'Pitwall', idx: '05' },
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

  useEffect(() => {
    lockScroll(open)
    if (!open) return
    gsap.fromTo(
      '.menu__link',
      { yPercent: 110 },
      { yPercent: 0, duration: 0.7, ease: 'expo.out', stagger: 0.05, delay: 0.15 },
    )
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (href: string) => {
    setOpen(false)
    window.setTimeout(() => scrollToTarget(href), 350)
  }

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
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div id="site-menu" className={`menu${open ? ' is-open' : ''}`} aria-hidden={!open}>
        <nav className="menu__nav" aria-label="Sections">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              tabIndex={open ? 0 : -1}
              className="menu__row"
              onClick={(e) => {
                e.preventDefault()
                go(l.href)
              }}
            >
              <span className="menu__idx mono">{l.idx}</span>
              <span className="menu__mask">
                <span className="menu__link">{l.label}</span>
              </span>
            </a>
          ))}
        </nav>
        <div className="menu__aside">
          <p className="menu__kicker mono">FLAGSHIP REPLAY</p>
          <p className="menu__big">Silverstone · 2024</p>
          <p className="menu__meta mono">SESSION 9558 · REPLAY DATA</p>
          <Link to="/app" className="btn btn--primary" tabIndex={open ? 0 : -1}>
            Enter the pitwall
          </Link>
        </div>
      </div>
    </>
  )
}
