import { Suspense, lazy, useEffect, useRef, type PointerEvent } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTeam } from '../../theme/useTeam'
import { useInView } from '../../hooks/useInView'
import type { StudyShot } from './StudyCanvas'

gsap.registerPlugin(ScrollTrigger)

const StudyCanvas = lazy(() => import('./StudyCanvas'))

interface Study {
  id: string
  title: string
  note: string
  variant: 'number' | 'blueprint' | 'rim'
  shot: StudyShot
}

const STUDIES: Study[] = [
  {
    id: '01',
    title: 'Number',
    note: 'Toon shade, ink outline',
    variant: 'number',
    shot: { mode: 'toon', camera: [5, 7, 5], rotation: [0, 0.5, 0], zoom: 70, line: '#111111' },
  },
  {
    id: '02',
    title: 'Blueprint',
    note: 'Edge pass, plan view',
    variant: 'blueprint',
    shot: { mode: 'blueprint', camera: [3, 9, 4], rotation: [0, -0.45, 0], zoom: 64, line: '#ffffff' },
  },
  {
    id: '03',
    title: 'Rim light',
    note: 'Two-tone studio, low key',
    variant: 'rim',
    shot: { mode: 'standard', camera: [-1.6, 1.1, 7], rotation: [0, 0.2, 0], zoom: 74, line: '#111', lights: 'rim' },
  },
]

function StudyCard({ study, index }: { study: Study; index: number }) {
  const { team } = useTeam()
  const [ref, inView] = useInView<HTMLDivElement>('300px', true)

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    e.currentTarget.style.setProperty('--rx', `${-y * 8}deg`)
    e.currentTarget.style.setProperty('--ry', `${x * 10}deg`)
  }
  const onLeave = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--rx', '0deg')
    e.currentTarget.style.setProperty('--ry', '0deg')
  }

  return (
    <figure className={`study study--${study.variant}`} style={{ ['--i' as string]: index }}>
      <div ref={ref} className="study__frame" onPointerMove={onMove} onPointerLeave={onLeave}>
        <div className="study__art">
          {study.variant === 'number' && <span className="study__numeral">{team.number}</span>}
          {study.variant === 'blueprint' && <span className="study__dims mono">PLAN · EDGE PASS</span>}
          {inView && (
            <Suspense fallback={null}>
              <StudyCanvas team={team} shot={study.shot} />
            </Suspense>
          )}
          {study.variant === 'rim' && <span className="study__halftone" />}
        </div>
      </div>
      <figcaption className="study__cap">
        <span className="study__cap-title">{study.title}</span>
        <span className="study__cap-meta mono">
          {study.note} · <b>STUDY {study.id}</b>
        </span>
      </figcaption>
    </figure>
  )
}

export function Studies() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!root.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.from('.study', {
        y: 120,
        opacity: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.12,
        scrollTrigger: { trigger: '.studies__grid', start: 'top 80%' },
      })
      gsap.to('.study:nth-child(2)', {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: { trigger: '.studies__grid', start: 'top bottom', end: 'bottom top', scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="studies" ref={root} className="studies" aria-labelledby="studies-title">
      <header className="studies__head">
        <h2 id="studies-title" className="studies__title">
          <span>Single-seater</span>
          <em>studies</em>
        </h2>
        <p className="studies__intro">
          One car, three render passes: toon ink, blueprint edges and a low-key rim light. Repainted live in the
          active team colours with every sponsor mark stripped out.
        </p>
      </header>
      <div className="studies__grid">
        {STUDIES.map((s, i) => (
          <StudyCard key={s.id} study={s} index={i} />
        ))}
      </div>
    </section>
  )
}
