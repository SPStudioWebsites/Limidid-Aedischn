import { useEffect, useRef, useState } from 'react'
import './index.css'

// ─── Shared helpers ───────────────────────────────────────────────────────────
// Debounce: returns a function that only fires after `ms` ms of silence.
// Used on all resize-listeners to prevent simultaneous setState storms.
function debounce(fn, ms) {
  let id
  return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), ms) }
}

// ─── Color constants ──────────────────────────────────────────────────────────
const C = {
  red:     '#d6363a',
  redLight:'#e85558',
  redDark: '#b02c30',
  dark:    '#292a2e',
  darker:  '#1e1f22',
  card:    '#232428',
  light:   '#f7f7f7',
  muted:   'rgba(247,247,247,0.45)',
  faint:   'rgba(247,247,247,0.12)',
  border:  'rgba(247,247,247,0.08)',
  redA20:  'rgba(214,54,58,0.20)',
  redA12:  'rgba(214,54,58,0.12)',
  redA08:  'rgba(214,54,58,0.08)',
}

// ─── Intersection Observer Hook ───────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

// ─── Parallax Hook ────────────────────────────────────────────────────────────
function useParallax() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Disable parallax on mobile — causes janky scroll on touch devices
    if (window.matchMedia('(max-width: 768px)').matches) return
    const handle = () => { el.style.transform = `translateY(${window.scrollY * 0.25}px)` }
    window.addEventListener('scroll', handle, { passive: true })
    return () => window.removeEventListener('scroll', handle)
  }, [])
  return ref
}

// ─── Count-up Hook ────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1600) {
  const [count, setCount] = useState(0)
  const ref     = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const t0 = performance.now()
        const tick = (now) => {
          const p = Math.min((now - t0) / duration, 1)
          setCount(Math.round((1 - Math.pow(1 - p, 3)) * target))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])
  return [count, ref]
}

// ─── Typewriter Hook ──────────────────────────────────────────────────────────
function useTypewriter(words, typeSpeed = 80, deleteSpeed = 42, pause = 1800) {
  const [display, setDisplay] = useState('')
  const s = useRef({ wIdx: 0, deleting: false, charIdx: 0 })
  useEffect(() => {
    let timer
    const tick = () => {
      const { wIdx, deleting } = s.current
      const word = words[wIdx]
      if (!deleting) {
        s.current.charIdx = Math.min(s.current.charIdx + 1, word.length)
        setDisplay(word.slice(0, s.current.charIdx))
        if (s.current.charIdx === word.length) {
          timer = setTimeout(() => { s.current.deleting = true; tick() }, pause)
          return
        }
      } else {
        s.current.charIdx = Math.max(s.current.charIdx - 1, 0)
        setDisplay(word.slice(0, s.current.charIdx))
        if (s.current.charIdx === 0) {
          s.current.deleting = false
          s.current.wIdx = (wIdx + 1) % words.length
        }
      }
      timer = setTimeout(tick, deleting ? deleteSpeed : typeSpeed)
    }
    timer = setTimeout(tick, 800)
    return () => clearTimeout(timer)
  }, [])
  return display
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function NavBar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [isMobile,  setIsMobile]  = useState(() => window.innerWidth < 768)

  // Scroll detection
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  // Responsive breakpoint — debounced so many components don't setState simultaneously
  useEffect(() => {
    const onResize = debounce(() => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) setMenuOpen(false)
    }, 150)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Lock body scroll while menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // ESC closes menu
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const navLinks  = ['Auftritte', 'Repertoire', 'Band', 'Kontakt']
  const closeMenu = () => setMenuOpen(false)
  const navBg     = scrolled || menuOpen

  return (
    <>
      {/* ── Nav bar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: isMobile ? '13px 20px' : '16px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: navBg ? 'rgba(41,42,46,0.96)' : 'transparent',
        backdropFilter: navBg ? 'blur(20px)' : 'none',
        borderBottom: navBg ? `1px solid ${C.redA20}` : 'none',
        transition: 'background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease',
      }}>
        {/* Logo */}
        <a href="#" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <picture>
            <source srcSet="/logo-transparent.webp" type="image/webp" />
            <img
              src="/logo-transparent.png"
              alt="Limidid Ädischn"
              width="1440"
              height="690"
              style={{ height: isMobile ? '38px' : '48px', width: 'auto', objectFit: 'contain' }}
            />
          </picture>
        </a>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            {navLinks.map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{
                color: 'rgba(247,247,247,0.6)', textDecoration: 'none', fontSize: '13px',
                fontWeight: 500, letterSpacing: '0.8px', transition: 'color 0.2s',
              }}
                onMouseOver={e => e.target.style.color = C.red}
                onMouseOut={e  => e.target.style.color = 'rgba(247,247,247,0.6)'}
              >{item}</a>
            ))}
            <a href="#kontakt">
              <button className="btn-primary" style={{ padding: '10px 24px', borderRadius: '6px', fontSize: '13px' }}>
                Jetzt anfragen
              </button>
            </a>
          </div>
        )}

        {/* Mobile hamburger — three lines animate to × */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 4px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              gap: '5px', width: 32, height: 32,
            }}
          >
            <span style={{
              display: 'block', height: 2, borderRadius: 2, background: C.red,
              width: 22,
              transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
              transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
            }} />
            <span style={{
              display: 'block', height: 2, borderRadius: 2, background: C.red,
              width: 14,
              opacity: menuOpen ? 0 : 1,
              transition: 'opacity 0.2s ease',
            }} />
            <span style={{
              display: 'block', height: 2, borderRadius: 2, background: C.red,
              width: 22,
              transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
              transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </button>
        )}
      </nav>

      {/* ── Mobile full-screen overlay menu ── */}
      {isMobile && (
        <div
          onClick={closeMenu}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(15,15,18,0.97)',
            backdropFilter: 'blur(18px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '6px',
            opacity: menuOpen ? 1 : 0,
            pointerEvents: menuOpen ? 'all' : 'none',
            transition: 'opacity 0.35s ease',
          }}
        >
          {/* Nav links — staggered fade-in */}
          {navLinks.map((item, i) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={closeMenu}
              style={{
                color: C.light, textDecoration: 'none',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 52, letterSpacing: 5,
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(18px)',
                transition: `opacity 0.4s ${0.06 * i + 0.05}s ease, transform 0.4s ${0.06 * i + 0.05}s ease, color 0.15s`,
                WebkitTapHighlightColor: 'transparent',
              }}
              onTouchStart={e  => e.currentTarget.style.color = C.red}
              onTouchEnd={e    => e.currentTarget.style.color = C.light}
              onTouchCancel={e => e.currentTarget.style.color = C.light}
            >
              {item}
            </a>
          ))}

          {/* Divider */}
          <div style={{
            width: 50, height: 1, background: C.redA20,
            margin: '18px 0',
            opacity: menuOpen ? 1 : 0,
            transition: 'opacity 0.4s 0.28s ease',
          }} />

          {/* CTA button */}
          <a href="#kontakt" onClick={closeMenu}>
            <button
              className="btn-primary"
              style={{
                padding: '16px 52px', borderRadius: '8px', fontSize: '16px',
                letterSpacing: 1,
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.4s 0.32s ease, transform 0.4s 0.32s ease',
              }}
            >
              Jetzt anfragen
            </button>
          </a>
        </div>
      )}
    </>
  )
}

// ─── Vinyl Record ─────────────────────────────────────────────────────────────
function VinylRecord() {
  // phase: 'parked' | 'dropping' | 'playing' | 'paused'
  const [phase,    setPhase]   = useState('parked')
  const [playing,  setPlaying] = useState(false)
  const [hovering, setHovering] = useState(false)
  // Track screenW for accurate scale calculation; derive isMobile from it.
  const [screenW, setScreenW] = useState(() => window.innerWidth)
  useEffect(() => {
    const onResize = debounce(() => setScreenW(window.innerWidth), 150)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const isMobile = screenW < 768
  const audioRef    = useRef(null)
  const needleRef   = useRef(null)
  const rafRef      = useRef(null)
  const dropTimer   = useRef(null)

  // Needle angles — pivot is RIGHT of record, so:
  //   negative = counterclockwise = arm lifted to the right = OFF record
  //   positive = clockwise        = arm swings left         = ON record
  // Arm length ~185px, pivot-to-center ~178px → overhang ~7px past spindle
  // PARKED = −5°: arm line tangent to outer groove circle (⊥-distance from center to arm line = 148px),
  //               needle tip ~22px outside the groove — arm rests alongside the record, not on it
  const PARKED = -5   // tangential to outer groove, needle outside record edge
  const OUTER  =  3   // outer groove (~148px from center, song start)
  const INNER  = 35   // inner groove / label (~51px from center, song end = overhang position)

  useEffect(() => {
    const audio = new Audio('/preview.mp3')
    audio.loop = false
    audioRef.current = audio

    // Set initial needle position — ref-controlled, no React re-render needed
    if (needleRef.current) {
      needleRef.current.style.transform = `rotate(${PARKED}deg)`
    }

    // Song ends naturally → lift needle back to parked
    audio.addEventListener('ended', () => {
      cancelAnimationFrame(rafRef.current)
      setPlaying(false)
      setPhase('parked')
      const el = needleRef.current
      if (el) {
        el.style.transition = 'transform 1.6s ease-in-out'
        el.style.transform  = `rotate(${PARKED}deg)`
      }
    })

    return () => {
      audio.pause()
      cancelAnimationFrame(rafRef.current)
      clearTimeout(dropTimer.current)
    }
  }, [])

  // rAF loop: move needle inward in real-time with song progress
  const startTracking = () => {
    cancelAnimationFrame(rafRef.current)
    const tick = () => {
      const audio = audioRef.current
      const el    = needleRef.current
      if (!audio || !el || audio.paused) return
      const p     = audio.duration ? audio.currentTime / audio.duration : 0
      const angle = OUTER + (INNER - OUTER) * p
      el.style.transform = `rotate(${angle.toFixed(4)}deg)`
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const toggle = () => {
    if (phase === 'dropping') return   // ignore clicks mid-drop
    const audio = audioRef.current
    const el    = needleRef.current
    if (!el || !audio) return

    if (phase === 'parked') {
      // Animate needle from resting position to outer groove
      setPhase('dropping')
      setPlaying(true)
      el.style.transition = 'transform 1.2s cubic-bezier(0.34,1.2,0.64,1)'
      el.style.transform  = `rotate(${OUTER}deg)`
      // Once needle has landed, start audio and begin tracking
      dropTimer.current = setTimeout(() => {
        el.style.transition = 'none'
        setPhase('playing')
        audio.play().catch(() => {})
        startTracking()
      }, 1200)

    } else if (phase === 'paused') {
      setPhase('playing')
      setPlaying(true)
      audio.play().catch(() => {})
      startTracking()

    } else if (phase === 'playing') {
      setPhase('paused')
      setPlaying(false)
      audio.pause()
      cancelAnimationFrame(rafRef.current)
    }
  }

  const grooves = Array.from({ length: 22 }, (_, i) => ({
    r: 52 + i * 4.2,
    stroke: i % 4 === 0 ? 'rgba(255,255,255,0.07)' : i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.025)',
    sw: i % 4 === 0 ? 1.2 : 0.7,
  }))

  const statusText = {
    parked:   isMobile ? '▶ TIPPEN ZUM ABSPIELEN' : '▶ KLICKEN ZUM ABSPIELEN',
    dropping: '♪',
    playing:  '▶ PLAYING',
    paused:   isMobile ? '▶ FORTSETZEN'           : '⏸ FORTSETZEN',
  }[phase]

  // Hover only makes sense on desktop (cursor exists)
  const canHover = !isMobile && (phase === 'parked' || phase === 'paused')

  const onEnter = () => {
    if (!canHover) return
    setHovering(true)
    if (phase === 'parked') {
      const el = needleRef.current
      if (el) {
        el.style.transition = 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)'
        el.style.transform  = `rotate(${PARKED - 8}deg)`
      }
    }
  }

  const onLeave = () => {
    if (isMobile) return
    setHovering(false)
    if (phase === 'parked') {
      const el = needleRef.current
      if (el) {
        el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)'
        el.style.transform  = `rotate(${PARKED}deg)`
      }
    }
  }

  // On mobile, scale down the 332px-wide content (300px disc + 32px tonearm overhang)
  // to fit within the available viewport width (screenW minus 80px horizontal padding).
  // On desktop always use 1 (no scale).
  const vinylScale = isMobile ? Math.min(1, (screenW - 80) / 332) : 1

  return (
    // Outer div: reserves the correct scaled layout space so nothing overflows
    <div style={{
      width:    Math.round(332 * vinylScale),
      height:   Math.round(340 * vinylScale),  // 300px disc + ~40px for status text
      margin:   '0 auto',
      position: 'relative',
    }}>
    {/* Inner div: applies the CSS scale transform */}
    <div style={{
      position:        'absolute',
      top:             0,
      left:            0,
      transform:       vinylScale < 1 ? `scale(${vinylScale})` : 'none',
      transformOrigin: 'top left',
    }}>
    <div
      onClick={toggle}
      onMouseEnter={isMobile ? undefined : onEnter}
      onMouseLeave={isMobile ? undefined : onLeave}
      style={{
        position: 'relative', width: 300, height: 300, margin: '0 auto',
        cursor: phase === 'dropping' ? 'default' : 'pointer',
        // Scale/lift only on desktop hover — no transform on mobile
        transition: isMobile ? 'none' : 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        transform: (hovering && canHover) ? 'scale(1.04) translateY(-6px)' : 'scale(1) translateY(0)',
      }}
    >
      {/* Vinyl disc */}
      <svg viewBox="0 0 280 280" style={{
        width: '100%', height: '100%', display: 'block',
        animation: playing ? 'vinylSpin 2.8s linear infinite' : 'none',
        // Glow on playing (both platforms) or hover (desktop only)
        filter: playing
          ? 'drop-shadow(0 0 32px rgba(214,54,58,0.55))'
          : (hovering && canHover)
            ? 'drop-shadow(0 0 36px rgba(214,54,58,0.55)) drop-shadow(0 0 12px rgba(214,54,58,0.3))'
            : 'drop-shadow(0 6px 24px rgba(0,0,0,0.7))',
        transition: 'filter 0.4s ease',
      }}>
        <defs>
          <radialGradient id="discShine" cx="35%" cy="28%" r="60%">
            <stop offset="0%"   stopColor="#fff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0"    />
          </radialGradient>
          <radialGradient id="labelGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#e85558" />
            <stop offset="100%" stopColor="#7a1a1d" />
          </radialGradient>
          <clipPath id="labelClip">
            <circle cx="140" cy="140" r="44" />
          </clipPath>
        </defs>
        <circle cx="140" cy="140" r="138" fill="#0e0e10" />
        {grooves.map((g, i) => (
          <circle key={i} cx="140" cy="140" r={g.r} fill="none" stroke={g.stroke} strokeWidth={g.sw} />
        ))}
        <circle cx="140" cy="140" r="137" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <circle cx="140" cy="140" r="48" fill="url(#labelGrad)" />
        <circle cx="140" cy="140" r="46" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <image href="/logo-vinyl.png" x="96" y="96" width="88" height="88"
          clipPath="url(#labelClip)" preserveAspectRatio="xMidYMid meet" />
        <circle cx="140" cy="140" r="5" fill="#0e0e10" />
        <circle cx="140" cy="140" r="138" fill="url(#discShine)" />
      </svg>

      {/* Tonearm — initial transform set in JSX to avoid 0deg flash on mount,
           subsequent updates via ref (React won't override since value never changes in vdom).
           Geometry: arm 185px, pivot-to-center 178px → 7px overhang past spindle.
           Headshell perpendicular to arm direction (72° − 90° = −18°). */}
      <div ref={needleRef} style={{
        position: 'absolute', top: -18, right: -32,
        width: 100, height: 200,
        transformOrigin: '16px 16px',
        transform: `rotate(${PARKED}deg)`,
        pointerEvents: 'none',
      }}>
        <svg viewBox="0 0 100 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="armGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#c8c8c8" />
              <stop offset="100%" stopColor="#505050" />
            </linearGradient>
          </defs>

          {/* Counterweight (opposite side of headshell, upper-left of pivot) */}
          <line x1="16" y1="16" x2="5" y2="3"
                stroke="#505050" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="3" cy="2" rx="8" ry="5.5"
                   fill="#2e2e2e" stroke="#606060" strokeWidth="1.2"
                   transform="rotate(-18 3 2)" />

          {/* Pivot bearing */}
          <circle cx="16" cy="16" r="12" fill="#3a3a3a" stroke="#707070" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="5.5" fill="#1a1a1a" />
          <circle cx="16" cy="16" r="2"   fill="#909090" />

          {/* Arm tube — direction 72.4° from horizontal, length ~185px */}
          <line x1="16" y1="16" x2="72" y2="192"
                stroke="url(#armGrad)" strokeWidth="3.5" strokeLinecap="round" />

          {/* Headshell — perpendicular to arm (72° − 90° = −18°), centred at arm tip */}
          <rect x="65" y="189" width="15" height="6" rx="2"
                fill="#363636" stroke="#5a5a5a" strokeWidth="0.8"
                transform="rotate(-18 72 192)" />

          {/* Stylus (needle contact point) — slightly past arm tip along arm axis */}
          <circle cx="75" cy="200" r="4.5" fill="#d6363a" />
          <circle cx="75" cy="200" r="2"   fill="#ff8888" />
        </svg>
      </div>

      {/* Status — pulses on mobile when parked to invite tap */}
      <p style={{
        textAlign: 'center', marginTop: '16px',
        fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
        color: playing ? '#d6363a' : '#f7f7f7',
        transition: 'color 0.4s ease', fontFamily: "'Inter', sans-serif",
        animation: (isMobile && phase === 'parked') ? 'mobileStatusPulse 1.8s ease-in-out infinite' : 'none',
        transformOrigin: 'center',
      }}>
        {statusText}
      </p>
    </div>
    </div>{/* /inner scale div */}
    </div>
  )
}

// ─── Marquee Ticker ───────────────────────────────────────────────────────────
function Marquee() {
  const items = ['LIVE MUSIK', 'PARTYBAND', 'FRANKEN', 'HOCHZEITEN', 'FIRMENFEIERN', 'STADTFESTE', 'GEBURTSTAGE', 'ABIPARTYS', 'KIRCHWEIHE']
  // 4 copies so translateX(-25%) lands on content identical to the start —
  // the loop reset is visually seamless with no jump
  const quad = [...items, ...items, ...items, ...items]
  return (
    <div style={{
      overflow: 'hidden',
      borderTop: `1px solid ${C.redA20}`, borderBottom: `1px solid ${C.redA20}`,
      padding: '11px 0', background: C.darker,
    }}>
      <div style={{ display: 'flex', width: 'max-content', animation: 'marqueeScroll 24s linear infinite', willChange: 'transform' }}>
        {quad.map((item, i) => (
          <span key={i} style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '15px', letterSpacing: '4px',
            padding: '0 26px', whiteSpace: 'nowrap',
            color: i % 2 === 0 ? C.red : 'rgba(247,247,247,0.22)',
          }}>
            ◆ {item}
          </span>
        ))}
      </div>
    </div>
  )
}


// ─── Wave Divider ─────────────────────────────────────────────────────────────
function WaveDivider() {
  // 4 seamlessly-tiling periods (each 720 units wide) in one SVG.
  // SVG is 200% wide → one period = 50vw.
  // translateX(-25%) = −50vw = exactly one period → invisible seam at loop point.
  const W = 2880, H = 48, mid = 24

  // Primary wave (crest up): 4 periods
  const p1 = `M0,${mid} C240,0 480,${H} 720,${mid} C960,0 1200,${H} 1440,${mid} C1680,0 1920,${H} 2160,${mid} C2400,0 2640,${H} 2880,${mid}`
  // Secondary wave (crest down, inverted): 4 periods
  const p2 = `M0,${mid} C240,${H} 480,0 720,${mid} C960,${H} 1200,0 1440,${mid} C1680,${H} 1920,0 2160,${mid} C2400,${H} 2640,0 2880,${mid}`
  // Thin accent wave (slightly faster, offset phase)
  const p3 = `M0,${mid} C180,4 540,${H-4} 720,${mid} C900,4 1260,${H-4} 1440,${mid} C1620,4 1980,${H-4} 2160,${mid} C2340,4 2700,${H-4} 2880,${mid}`

  return (
    <div style={{ lineHeight: 0, overflow: 'hidden', height: H }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{
          width: '200%', height: `${H}px`, display: 'block',
          animation: 'waveScroll 10s linear infinite',
          willChange: 'transform',
        }}
      >
        <path d={p1} stroke={C.red}      strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d={p2} stroke={C.redLight} strokeWidth="0.8" fill="none" opacity="0.25" />
        <path d={p3} stroke={C.light}    strokeWidth="0.5" fill="none" opacity="0.08" />
      </svg>
    </div>
  )
}

// ─── Stat Counter Card ────────────────────────────────────────────────────────
function StatCounter({ value, label, delay }) {
  const match  = value.match(/^(\d+)(.*)$/)
  const num    = match ? parseInt(match[1]) : 0
  const suffix = match ? match[2] : ''
  const [count, ref] = useCountUp(num)
  return (
    <div ref={ref} className={`reveal reveal-delay-${delay} card-hover`} style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: '14px', padding: '32px 24px', textAlign: 'center',
    }}>
      <div className="font-display" style={{ fontSize: '3.2rem', lineHeight: 1, color: C.red, marginBottom: '10px' }}>
        {count}{suffix}
      </div>
      <div style={{ color: C.muted, fontSize: '14px', fontWeight: 500, letterSpacing: '0.3px' }}>{label}</div>
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ parallaxRef }) {
  const logoRef = useRef(null)
  const typedText  = useTypewriter(['Hochzeiten', 'Firmenfeiern', 'Stadtfeste', 'Geburtstage', 'Abipartys'])
  const isMobile = window.innerWidth < 768

  // Random glitch bursts on the logo — desktop only (filter + transform on large PNG is heavy on mobile)
  useEffect(() => {
    if (window.innerWidth < 768) return
    const logo = logoRef.current
    if (!logo) return
    let timer
    const scheduleGlitch = () => {
      timer = setTimeout(() => {
        logo.style.filter = 'drop-shadow(3px 0 #d6363a) drop-shadow(-3px 0 #00eeff) brightness(1.3)'
        logo.style.transform = 'translateX(3px) skewX(-2deg)'
        setTimeout(() => {
          logo.style.filter = 'drop-shadow(0 0 40px rgba(214,54,58,0.35))'
          logo.style.transform = ''
          setTimeout(() => {
            logo.style.filter = 'drop-shadow(-2px 0 #d6363a) brightness(1.15)'
            logo.style.transform = 'translateX(-1px)'
            setTimeout(() => {
              logo.style.filter = 'drop-shadow(0 0 40px rgba(214,54,58,0.35))'
              logo.style.transform = ''
              scheduleGlitch()
            }, 90)
          }, 60)
        }, 75)
      }, 3000 + Math.random() * 5000)
    }
    scheduleGlitch()
    return () => clearTimeout(timer)
  }, [])

  return (
    <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', position: 'relative', overflow: 'hidden',
        padding: '80px 24px 120px',
        // Mobile: no loading screen → fade in directly so there's no jarring pop-in
        animation: isMobile ? 'heroFadeIn 0.5s ease forwards' : 'none',
      }}
    >
      {/* Band photo background — LCP element, high priority, WebP first.
          Mobile gets a portrait-cropped version (750×1300) to cover the tall viewport
          without upscaling the landscape original. */}
      <picture style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <source media="(max-width: 767px)" srcSet="/Bandfoto-mobile.webp" type="image/webp" />
        <source srcSet="/Bandfoto.webp" type="image/webp" />
        <img
          src="/Bandfoto.jpg"
          alt=""
          fetchPriority="high"
          width="1200"
          height="630"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center top',
            pointerEvents: 'none',
          }}
        />
      </picture>

      {/* Dark overlay + stage atmosphere */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          conic-gradient(from 195deg at 15% -5%, rgba(214,54,58,0.18) 0deg, transparent 25deg),
          conic-gradient(from 330deg at 85% -5%, rgba(247,247,247,0.06) 0deg, transparent 25deg),
          conic-gradient(from 255deg at 50% -5%, rgba(214,54,58,0.10) 0deg, transparent 30deg),
          radial-gradient(ellipse 80% 50% at 50% 100%, rgba(214,54,58,0.06) 0%, transparent 70%),
          linear-gradient(180deg, rgba(41,42,46,0.72) 0%, rgba(20,15,15,0.82) 100%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Stage light rays — desktop only (blur filter on 5 divs hurts mobile GPU) */}
      {!isMobile && [
        { left: '10%',  rotate: '14deg',  color: 'rgba(214,54,58,0.5)'    },
        { left: '83%',  rotate: '-11deg', color: 'rgba(247,247,247,0.15)' },
        { left: '48%',  rotate: '2deg',   color: 'rgba(214,54,58,0.35)'   },
        { left: '29%',  rotate: '20deg',  color: 'rgba(214,54,58,0.2)'    },
        { left: '68%',  rotate: '-20deg', color: 'rgba(247,247,247,0.08)' },
      ].map((ray, i) => (
        <div key={i} style={{
          position: 'absolute', top: 0, left: ray.left,
          width: '2px', height: '65vh',
          background: `linear-gradient(180deg, ${ray.color}, transparent)`,
          transform: `rotate(${ray.rotate})`, transformOrigin: 'top center',
          filter: 'blur(1.5px)', pointerEvents: 'none',
        }} />
      ))}

      {/* Floor glow */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '90%', height: '250px',
        background: `radial-gradient(ellipse 70% 40% at 50% 100%, ${C.redA08}, transparent)`,
        pointerEvents: 'none',
      }} />

      {/* Parallax content */}
      <div ref={parallaxRef} style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '900px', width: '100%' }}>
        {/* Badge — extra shimmer pulse on mobile to catch attention */}
        <div style={{
          display: 'inline-block',
          border: `1px solid ${C.redA20}`, borderRadius: '100px',
          padding: '7px 22px', marginBottom: '36px',
          fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase',
          color: C.red, background: C.redA08,
          animation: isMobile ? 'badgeShimmer 2.6s ease-in-out infinite' : 'none',
        }}>
          Live-Musik aus Franken
        </div>

        {/* Logo — random glitch effect (desktop only) */}
        <picture style={{ display: 'block', margin: '0 auto 40px', width: 'clamp(240px, 80vw, 720px)' }}>
          {/* Serve 720w on mobile/tablet, 1440w on large screens */}
          <source
            type="image/webp"
            srcSet="/logo-transparent-720.webp 720w, /logo-transparent.webp 1440w"
            sizes="(max-width: 768px) 80vw, clamp(240px, 50vw, 720px)"
          />
          <img
            ref={logoRef}
            src="/logo-transparent.png"
            alt="Limidid Ädischn"
            fetchPriority="high"
            width="1440"
            height="690"
            style={{
              display: 'block',
              width: '100%',
              height: 'auto', objectFit: 'contain',
              filter: 'drop-shadow(0 0 40px rgba(214,54,58,0.35))',
            }}
          />
        </picture>

        {/* H1 — visually hidden, present for SEO/screen-readers */}
        <h1 style={{
          position: 'absolute', width: 1, height: 1, padding: 0,
          margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap', border: 0,
        }}>
          Partyband aus Franken – Limidid Ädischn
        </h1>

        {/* Divider */}
        <div style={{
          width: '100px', margin: '0 auto 36px', height: '2px',
          background: `linear-gradient(90deg, transparent, ${C.red}, transparent)`,
        }} />

        {/* Static slogan */}
        <p style={{
          fontSize: 'clamp(13px, 2vw, 18px)', letterSpacing: '6px',
          textTransform: 'uppercase', color: 'rgba(247,247,247,0.4)',
          marginBottom: '10px', fontWeight: 300,
        }}>
          Partyband aus Franken
        </p>

        {/* Typewriter — event types */}
        <p style={{
          fontSize: 'clamp(16px, 2.4vw, 26px)', letterSpacing: '3px',
          textTransform: 'uppercase', marginBottom: '32px',
          fontWeight: 600, minHeight: '1.5em',
        }}>
          <span style={{ color: C.red }}>{typedText || '\u00A0'}</span>
          <span style={{ color: C.red, animation: 'blink 1s step-end infinite' }}>|</span>
        </p>

        <p style={{
          fontSize: 'clamp(15px, 1.8vw, 19px)', color: 'rgba(247,247,247,0.6)',
          maxWidth: '600px', margin: '0 auto 52px', lineHeight: 1.7, fontWeight: 300,
        }}>
          Wir bringen jede Feier zum Kochen. Von Rock und Pop bis zu fränkischen Klassikern, alles live, alles mit Vollgas.
        </p>

        {/* CTAs — stacked full-width on mobile, side-by-side on desktop */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          padding: isMobile ? '0 8px' : '0',
        }}>
          <a href="#kontakt" style={{ width: isMobile ? '100%' : 'auto' }}>
            <button className="btn-primary pulse-glow" style={{
              padding: isMobile ? '18px 0' : '20px 52px',
              borderRadius: '8px', fontSize: '17px',
              width: isMobile ? '100%' : 'auto',
            }}>
              Jetzt anfragen
            </button>
          </a>
          <a href="#repertoire" style={{ width: isMobile ? '100%' : 'auto' }}>
            <button className="btn-outline" style={{
              padding: isMobile ? '16px 0' : '20px 44px',
              borderRadius: '8px', fontSize: '17px',
              width: isMobile ? '100%' : 'auto',
            }}>
              Mehr erfahren
            </button>
          </a>
        </div>

        {/* Scroll cue — hidden on mobile (users know to scroll, and it takes up space) */}
        {!isMobile && (
          <div style={{ marginTop: '72px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.35 }}>
            <span style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase' }}>Scroll</span>
            <div style={{ width: '1px', height: '36px', background: `linear-gradient(180deg, ${C.red}, transparent)` }} />
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Über uns ─────────────────────────────────────────────────────────────────
function UeberUns() {
  const stats = [
    { value: '50+',   label: 'Live-Auftritte'   },
    { value: '5',     label: 'Bandmitglieder'   },
    { value: '10+',   label: 'Jahre Erfahrung'  },
    { value: '100%',  label: 'Partystimmung'    },
  ]
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const onResize = debounce(() => setIsMobile(window.innerWidth < 768), 150)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <section id="auftritte" style={{ padding: isMobile ? '72px 20px' : '120px 40px', background: C.dark }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="reveal grid-2" style={{ gap: isMobile ? '40px' : '80px', alignItems: 'center' }}>

          {/* Left — heading + text */}
          <div>
            <div style={{ fontSize: '12px', letterSpacing: '5px', textTransform: 'uppercase', color: C.red, marginBottom: '24px' }}>
              Über uns
            </div>

            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 800, lineHeight: 1.15,
              color: C.light, marginBottom: '32px',
            }}>
              Eure Partyband aus{' '}
              <span style={{ color: C.red }}>Franken.</span>
            </h2>

            <p style={{ color: C.muted, fontSize: '16px', lineHeight: 1.8, marginBottom: '20px' }}>
              Limidid Ädischn sind fünf Musiker aus Franken, die seit Jahren gemeinsam auf der Bühne stehen.
              Ob Hochzeit, Firmenfeier, Kirchweihe oder Stadtfest, wir sorgen für den Soundtrack, den eure Gäste nicht so schnell vergessen.
            </p>
            <p style={{ color: C.muted, fontSize: '16px', lineHeight: 1.8, marginBottom: '40px' }}>
              Jeder Auftritt ist für uns mehr als ein Job. Wir spielen mit Herz, mit Energie und dem Ziel,
              dass eure Gäste noch wochenlang davon reden.
            </p>

            <a href="#kontakt">
              <button className="btn-primary" style={{ padding: '14px 36px', borderRadius: '8px', fontSize: '15px' }}>
                Jetzt anfragen
              </button>
            </a>
          </div>

          {/* Right — 2×2 animated stat counters */}
          <div className="reveal grid-2" style={{ gap: '16px' }}>
            {stats.map((s, i) => <StatCounter key={i} {...s} delay={i + 1} />)}
          </div>

        </div>
      </div>
    </section>
  )
}

// ─── Repertoire ───────────────────────────────────────────────────────────────
function GenreCard({ icon, genre, songs, delay }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`reveal reveal-delay-${delay}`}
      onClick={() => setOpen(o => !o)}
      style={{
        borderRadius: '12px', background: C.card, cursor: 'pointer',
        border: `1px solid ${open ? C.red : C.border}`,
        borderTop: `3px solid ${C.red}`,
        padding: '28px 28px',
        transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
        transform: open ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: open ? `0 20px 50px rgba(214,54,58,0.18)` : 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '1.6rem' }}>{icon}</span>
        <h3 style={{ color: C.light, fontWeight: 700, fontSize: '18px', flex: 1 }}>{genre}</h3>
        <span style={{
          color: C.red, fontSize: '22px', lineHeight: 1, flexShrink: 0,
          display: 'inline-block',
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
        }}>+</span>
      </div>

      {/* Song list — grid 0fr→1fr animates to exact content height, no jank */}
      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        marginTop: open ? '20px' : '0px',
        transition: 'grid-template-rows 0.4s cubic-bezier(0.4,0,0.2,1), margin-top 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '11px' }}>
            {songs.map((song, i) => (
              <li key={i} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                color: 'rgba(247,247,247,0.75)', fontSize: '14px', lineHeight: 1.4,
              }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: C.red, flexShrink: 0 }} />
                {song}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function Repertoire() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const onResize = debounce(() => setIsMobile(window.innerWidth < 768), 150)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const genres = [
    {
      icon: '🎸',
      genre: 'Rock & Pop',
      songs: ['Sweet Home Alabama – Lynyrd Skynyrd', "Don't Stop Believin' – Journey", 'Livin\' on a Prayer – Bon Jovi', 'Shut Up and Dance – Walk the Moon'],
    },
    {
      icon: '🎺',
      genre: 'Deutsch & Schlager',
      songs: ['Cordula Grün – Schmidbauer & Kälberer', '99 Luftballons – Nena', 'Griechischer Wein – Udo Jürgens', 'Hulapalu – Andreas Gabalier'],
    },
    {
      icon: '🕺',
      genre: 'Party & Dance',
      songs: ["Can't Stop the Feeling – Justin Timberlake", 'I Gotta Feeling – Black Eyed Peas', 'September – Earth, Wind & Fire', 'Uptown Funk – Bruno Mars'],
    },
    {
      icon: '🍺',
      genre: 'Fränkische Hits',
      songs: ['Auf nach Franken – Volksmusik', 'Fränkisches Bier – Troglauer', 'Bamberg – Stoppok', 'Frankenwein – Wacholder'],
    },
  ]

  return (
    <section id="repertoire" style={{ padding: isMobile ? '72px 20px' : '120px 40px', background: C.darker }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: isMobile ? '40px' : '72px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '5px', textTransform: 'uppercase', color: C.red, marginBottom: '16px' }}>
            Für jeden Geschmack
          </div>
          <h2 className="font-display" style={{ fontSize: 'clamp(36px, 6vw, 72px)', color: C.light, lineHeight: 1 }}>
            REPERTOIRE – ROCK, POP & SCHLAGER LIVE
          </h2>
          <div className="accent-line" style={{ width: '80px', margin: '24px auto' }} />
          <p style={{ color: C.muted, fontSize: '17px', maxWidth: '560px', margin: '0 auto 48px' }}>
            Unser Repertoire reicht von deutschen und internationalen Hits über Rock- und Pop-Klassiker
            bis hin zu fränkischen Evergreens. Alles live, alles mit Herz.
          </p>
          <VinylRecord />
        </div>

        {/* 4 cards — 2 × 2 grid */}
        <div className="grid-2" style={{ gap: '20px' }}>
          {genres.map((g, i) => <GenreCard key={i} {...g} delay={(i % 2) + 1} />)}
        </div>

        <div className="reveal" style={{
          marginTop: isMobile ? '32px' : '64px',
          padding: isMobile ? '28px 20px' : '40px',
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: '12px', textAlign: 'center',
        }}>
          <h3 style={{ color: C.light, fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>
            … und über 200 weitere Songs.
          </h3>
          <p style={{ color: C.muted, marginBottom: '28px', fontSize: '15px' }}>
            Sonderwünsche? Kein Problem! Schreibt uns euren Lieblingssong.
          </p>
          <a href="#kontakt">
            <button className="btn-primary" style={{ padding: '14px 40px', borderRadius: '8px', fontSize: '15px' }}>
              Jetzt anfragen
            </button>
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── Band Members ─────────────────────────────────────────────────────────────
function MemberCard({ name, instrument, emoji, accent, delay }) {
  return (
    <div className={`reveal reveal-delay-${delay} card-hover`} style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: '16px', overflow: 'hidden', textAlign: 'center',
    }}>
      <div style={{
        height: '190px',
        background: `linear-gradient(160deg, ${accent}18 0%, ${C.darker} 100%)`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '80px', height: '100%',
          background: `linear-gradient(180deg, ${accent}25, transparent)`,
        }} />
        <div style={{ fontSize: '3.5rem', zIndex: 1 }}>{emoji}</div>
        <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: accent, marginTop: '8px', zIndex: 1, opacity: 0.8 }}>
          {instrument}
        </div>
      </div>
      <div style={{ padding: '20px 18px' }}>
        <h3 style={{ color: C.light, fontWeight: 700, fontSize: '16px' }}>{name}</h3>
      </div>
    </div>
  )
}

function Band() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const onResize = debounce(() => setIsMobile(window.innerWidth < 768), 150)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const members = [
    { name: 'Nadja',  instrument: 'Gesang',             emoji: '🎤', accent: C.red      },
    { name: 'Uwe',    instrument: 'Gesang & Bass',     emoji: '🎸', accent: C.redLight },
    { name: 'Simon',  instrument: 'Gitarre',           emoji: '🎸', accent: C.light    },
    { name: 'Stefan', instrument: 'Gesang & Schlagzeug', emoji: '🥁', accent: C.red    },
    { name: 'Jessie', instrument: 'Keyboard',          emoji: '🎹', accent: C.redLight },
  ]

  return (
    <section id="band" style={{ padding: isMobile ? '72px 20px' : '120px 40px', background: C.dark }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: isMobile ? '40px' : '80px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '5px', textTransform: 'uppercase', color: C.red, marginBottom: '16px' }}>
            Wer wir sind
          </div>
          <h2 className="font-display" style={{ fontSize: 'clamp(36px, 6vw, 72px)', color: C.light, lineHeight: 1 }}>
            DIE BAND – 5 MUSIKER AUS FRANKEN
          </h2>
          <div className="accent-line" style={{ width: '80px', margin: '24px auto' }} />
          <p style={{ color: C.muted, fontSize: '17px', maxWidth: '560px', margin: '0 auto' }}>
            Fünf Musiker aus Franken, seit Jahren auf Bühnen in der ganzen Region zuhause, mit dem gemeinsamen Ziel: eine Party, die keiner so schnell vergisst.
          </p>
        </div>

        {/* Members — horizontal scroll carousel on mobile, 3-col grid on desktop */}
        {isMobile ? (
          <div>
            <div
              className="mobile-band-carousel"
              style={{
                display: 'flex',
                gap: 12,
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollSnapType: 'x mandatory',
                overscrollBehaviorX: 'contain',
                touchAction: 'pan-x',
                paddingBottom: 8,
                cursor: 'grab',
              }}
            >
              {members.map((m, i) => (
                <div key={i} style={{
                  flexShrink: 0,
                  width: 152,
                  scrollSnapAlign: 'start',
                }}>
                  <MemberCard {...m} delay={1} />
                </div>
              ))}
            </div>
            {/* Swipe hint */}
            <div style={{
              textAlign: 'center', marginTop: 14,
              fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
              color: 'rgba(247,247,247,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <span>Wischen für mehr</span>
              <span style={{ animation: 'swipeHint 1.4s ease-in-out infinite', display: 'inline-block' }}>→</span>
            </div>
          </div>
        ) : (
          <div className="grid-3">
            {members.map((m, i) => <MemberCard key={i} {...m} delay={(i % 3) + 1} />)}
          </div>
        )}

        {/* Bio — 2 columns */}
        <div className="reveal grid-2" style={{ marginTop: isMobile ? '40px' : '72px', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: C.light, fontSize: '26px', fontWeight: 700, marginBottom: '16px' }}>Über uns</h3>
            <p style={{ color: C.muted, lineHeight: 1.8, marginBottom: '16px', fontSize: '15px' }}>
              Seit Jahren spielen wir zusammen auf Bühnen in Franken und Bayern. Wir nehmen jeden Auftritt
              ernst, gehen auf euren Anlass ein und sorgen dafür, dass am Ende wirklich alle getanzt haben.
            </p>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: '15px' }}>
              Musik ist unsere Leidenschaft und das spürt man. Jeder Auftritt ist ein Erlebnis,
              das eure Gäste noch lange in Erinnerung behalten.
            </p>
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${C.redA08}, rgba(247,247,247,0.02))`,
            border: `1px solid ${C.redA12}`, borderRadius: '16px', padding: '32px',
          }}>
            {[
              ['🎵', 'Musikalische Erfahrung',    'Über 6 Jahre gemeinsam auf der Bühne'            ],
              ['🔊', 'Professionelles Equipment', 'Hochwertige PA-Anlage & Lichttechnik inklusive'  ],
              ['📋', 'Flexibles Programm',        '3–5 Stunden Live-Musik nach Wunsch'              ],
              ['🤝', 'Persönliche Beratung',      'Individuelle Abstimmung auf euren Anlass'        ],
            ].map(([icon, title, desc], i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: i < 3 ? '22px' : 0 }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ color: C.light, fontWeight: 600, fontSize: '14px', marginBottom: '3px' }}>{title}</div>
                  <div style={{ color: C.muted, fontSize: '13px' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal" style={{ textAlign: 'center', marginTop: '64px' }}>
          <a href="#kontakt">
            <button className="btn-outline" style={{ padding: '16px 44px', borderRadius: '8px', fontSize: '16px' }}>
              Jetzt anfragen
            </button>
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null)
  const isMobile = window.innerWidth < 768

  const items = [
    {
      q: 'Was kostet eine Partyband in Franken?',
      a: 'Die Kosten hängen von Dauer, Anlass und Entfernung ab. Schreibt uns für ein unverbindliches Angebot.',
    },
    {
      q: 'Wo spielt Limidid Ädischn überall?',
      a: 'Wir spielen in ganz Franken und Bayern: Schweinfurt, Würzburg, Bamberg, Nürnberg, Haßfurt und Umgebung. Bei größeren Events fahren wir auch weiter.',
    },
    {
      q: 'Wie lange spielt die Band?',
      a: 'Typisch 3 bis 5 Stunden Live-Musik, ganz nach eurem Wunsch.',
    },
    {
      q: 'Könnt ihr Wunschsongs spielen?',
      a: 'Ja! Schreibt uns euren Lieblingssong und wir nehmen ihn gerne ins Repertoire auf.',
    },
    {
      q: 'Bringt ihr eure eigene Technik mit?',
      a: 'Ja, wir kommen mit komplettem Equipment: PA-Anlage, Mikrofone und Lichttechnik sind dabei. Ihr müsst euch um nichts kümmern.',
    },
  ]

  return (
    <section id="faq" style={{ padding: isMobile ? '72px 20px' : '100px 40px', background: C.dark }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: isMobile ? '36px' : '56px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '5px', textTransform: 'uppercase', color: C.red, marginBottom: '16px' }}>
            Häufige Fragen
          </div>
          <h2 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 60px)', color: C.light, lineHeight: 1 }}>
            FAQ
          </h2>
          <div className="accent-line" style={{ width: '80px', margin: '20px auto 0' }} />
        </div>

        <dl>
          {items.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={i} style={{
                borderBottom: `1px solid ${C.border}`,
                marginBottom: 0,
              }}>
                <dt>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', gap: 16,
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '20px 0', textAlign: 'left',
                      color: isOpen ? C.red : C.light,
                      fontSize: isMobile ? '15px' : '17px',
                      fontWeight: 600, fontFamily: "'Inter Variable', 'Inter', sans-serif",
                      transition: 'color 0.2s',
                    }}
                  >
                    {item.q}
                    <span style={{
                      flexShrink: 0, fontSize: '20px', lineHeight: 1,
                      color: C.red, transform: isOpen ? 'rotate(45deg)' : 'none',
                      transition: 'transform 0.25s ease',
                      display: 'inline-block',
                    }}>+</span>
                  </button>
                </dt>
                <dd style={{
                  margin: 0,
                  display: 'grid',
                  gridTemplateRows: isOpen ? '1fr' : '0fr',
                  transition: 'grid-template-rows 0.3s ease',
                }}>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{
                      color: C.muted, fontSize: '15px', lineHeight: 1.75,
                      padding: '0 0 20px',
                    }}>
                      {item.a}
                    </p>
                  </div>
                </dd>
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}

// ─── Booking Form ─────────────────────────────────────────────────────────────
function BookingForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', anlass: '', nachricht: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const onResize = debounce(() => setIsMobile(window.innerWidth < 768), 150)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const occasions = ['Hochzeit', 'Firmenfeier', 'Stadtfest', 'Geburtstag', 'Abiparty', 'Privatfeier', 'Sonstiges']
  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('send failed')
      setSent(true)
    } catch {
      alert('Etwas ist schiefgelaufen. Schreib uns direkt an info@limidid-aedischn.de')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="kontakt" style={{ padding: isMobile ? '80px 20px' : '120px 40px', background: C.darker }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: isMobile ? '40px' : '72px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '5px', textTransform: 'uppercase', color: C.red, marginBottom: '16px' }}>
            Euer Abend wartet
          </div>
          <h2 className="font-display" style={{ fontSize: 'clamp(36px, 6vw, 72px)', color: C.light, lineHeight: 1 }}>
            PARTYBAND FÜR HOCHZEITEN & EVENTS IN FRANKEN BUCHEN
          </h2>
          <div className="accent-line" style={{ width: '80px', margin: '24px auto' }} />
          <p style={{ color: C.muted, fontSize: '17px', maxWidth: '480px', margin: '0 auto' }}>
            Schreibt uns eine Nachricht und wir melden uns innerhalb von 24 Stunden
            mit einem unverbindlichen Angebot.
          </p>
        </div>

        <div className="reveal gradient-border" style={{ borderRadius: '20px' }}>
          {sent ? (
            <div style={{ background: C.card, borderRadius: '20px', padding: isMobile ? '48px 20px' : '80px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🎉</div>
              <h3 style={{ color: C.light, fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>Anfrage gesendet!</h3>
              <p style={{ color: C.muted, fontSize: '16px' }}>Wir melden uns so schnell wie möglich. Bis bald auf der Bühne!</p>
            </div>
          ) : (
            <form
              onSubmit={submit}
              style={{ background: C.card, borderRadius: '20px', padding: isMobile ? '28px 20px' : '52px 48px' }}
            >
              {/* Form fields — always 2 columns (2 × 2) */}
              <div className="grid-2" style={{ marginBottom: '18px' }}>
                {[
                  { label: 'Name *',   name: 'name',  type: 'text',  ph: 'Euer Name',      required: true  },
                  { label: 'E-Mail *', name: 'email', type: 'email', ph: 'eure@email.de',  required: true  },
                  { label: 'Telefon',  name: 'phone', type: 'tel',   ph: '+49 ...',        required: false },
                  { label: 'Datum *',  name: 'date',  type: 'date',  ph: '',               required: true  },
                ].map(({ label, name, type, ph, required }) => (
                  <div key={name}>
                    <label style={{ display: 'block', color: 'rgba(247,247,247,0.5)', fontSize: '12px', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      {label}
                    </label>
                    <input
                      className="form-input" type={type} name={name}
                      required={required} placeholder={ph}
                      value={form[name]} onChange={handle}
                      style={type === 'date' ? { colorScheme: 'dark' } : {}}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', color: 'rgba(247,247,247,0.5)', fontSize: '12px', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Anlass *
                </label>
                <select className="form-input" name="anlass" required value={form.anlass} onChange={handle} style={{ cursor: 'pointer', colorScheme: 'dark' }}>
                  <option value="" disabled>Anlass (z.B. Hochzeit, Firmenevent)</option>
                  {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', color: 'rgba(247,247,247,0.5)', fontSize: '12px', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Eure Nachricht
                </label>
                <textarea
                  className="form-input" name="nachricht" rows={5}
                  placeholder="Erzählt uns von eurem Event – Ort, Gästezahl, besondere Wünsche..."
                  value={form.nachricht} onChange={handle}
                  style={{ resize: 'vertical', minHeight: '120px' }}
                />
              </div>

              <button type="submit" className="btn-primary pulse-glow" disabled={loading}
                style={{ width: '100%', padding: '20px', borderRadius: '10px', fontSize: '17px', opacity: loading ? 0.8 : 1 }}>
                {loading ? '⏳ Wird gesendet...' : 'Anfrage senden'}
              </button>
              <p style={{ textAlign: 'center', color: 'rgba(247,247,247,0.25)', fontSize: '12px', marginTop: '18px' }}>
                Wir antworten innerhalb von 24 Stunden · Kostenlos & unverbindlich
              </p>
            </form>
          )}
        </div>

        <div className="reveal" style={{ marginTop: '48px', display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          {[['📧', 'info@limidid-aedischn.de'], ['📞', '+49 176 123 456 78'], ['📍', 'Franken, Bayern']].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'rgba(247,247,247,0.35)', fontSize: '14px' }}>
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const isMobile = window.innerWidth < 768
  return (
    <footer style={{ background: '#18191c', borderTop: `1px solid ${C.border}`, padding: isMobile ? '40px 20px' : '48px 40px', textAlign: 'center' }}>
      <picture>
        <source srcSet="/logo-transparent.webp" type="image/webp" />
        <img
          src="/logo-transparent.png"
          alt="Limidid Ädischn"
          loading="lazy"
          width="1440"
          height="690"
          style={{ height: '56px', width: 'auto', objectFit: 'contain', marginBottom: '14px' }}
        />
      </picture>
      <p style={{ color: 'rgba(247,247,247,0.2)', fontSize: '13px', marginBottom: '24px' }}>Die Partyband aus Franken</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {[['Impressum', '#impressum'], ['Datenschutz', '#datenschutz'], ['Kontakt', '#kontakt']].map(([label, href]) => (
          <a key={label} href={href} style={{ color: 'rgba(247,247,247,0.2)', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = C.red}
            onMouseOut={e => e.target.style.color = 'rgba(247,247,247,0.2)'}
          >{label}</a>
        ))}
      </div>
      <div className="accent-line" style={{ width: '160px', margin: '0 auto 20px' }} />
      <p style={{ color: 'rgba(247,247,247,0.12)', fontSize: '12px' }}>© 2026 Limidid Ädischn. Alle Rechte vorbehalten.</p>
    </footer>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
// ─── Stage Fog ────────────────────────────────────────────────────────────────
function StageFog() {
  const [active, setActive] = useState(false)
  const timerRef = useRef(null)
  // Detect mobile once on mount — no resize needed, fog is cosmetic only
  const isMobile = window.innerWidth < 768

  useEffect(() => {
    // Skip scroll listener on mobile — fog not rendered there
    if (isMobile) return
    const onScroll = () => {
      setActive(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setActive(false), 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(timerRef.current)
    }
  }, [])

  // Skip on mobile — 8 blurred animated gradients are GPU-heavy on phones
  if (isMobile) return null

  const puffs = [
    { w: 700, h: 220, x: '5%',   y: '75%', dur:  9, delay:   0, opacity: 0.055, anim: 1 },
    { w: 560, h: 190, x: '30%',  y: '85%', dur: 12, delay:  -3, opacity: 0.045, anim: 2 },
    { w: 750, h: 230, x: '58%',  y: '70%', dur:  8, delay:  -5, opacity: 0.060, anim: 3 },
    { w: 480, h: 170, x: '80%',  y: '80%', dur: 14, delay:  -2, opacity: 0.040, anim: 1 },
    { w: 620, h: 200, x: '20%',  y: '92%', dur: 11, delay:  -7, opacity: 0.050, anim: 2 },
    { w: 520, h: 180, x: '70%',  y: '90%', dur:  9, delay:  -4, opacity: 0.045, anim: 3 },
    { w: 440, h: 160, x: '45%',  y: '95%', dur: 13, delay:  -1, opacity: 0.035, anim: 1 },
    { w: 580, h: 195, x: '-2%',  y: '88%', dur: 10, delay:  -6, opacity: 0.055, anim: 2 },
  ]

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: '33vh',
      pointerEvents: 'none',
      zIndex: 80,
      overflow: 'hidden',
      maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 35%, black 70%)',
      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 35%, black 70%)',
    }}>
      {puffs.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: p.x, top: p.y,
          width: p.w, height: p.h,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(210,215,230,0.9) 0%, transparent 70%)',
          filter: 'blur(38px)',
          opacity: p.opacity,
          transform: 'translate(-50%, -50%)',
          animation: `fogDrift${p.anim} ${p.dur}s ${p.delay}s ease-in-out infinite`,
          animationPlayState: active ? 'running' : 'paused',
        }} />
      ))}

      {/* Extra dense layer at very bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: '-10%', right: '-10%',
        height: '40%',
        background: 'linear-gradient(to top, rgba(200,205,220,0.06) 0%, transparent 100%)',
        filter: 'blur(20px)',
      }} />
    </div>
  )
}

// ─── Loading Screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  const [phase, setPhase] = useState('intro') // 'intro' | 'open' | 'done'

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    // Mobile gets a shorter intro (1.2s) since LCP is gated behind this screen.
    // Desktop keeps the full 2s dramatic curtain.
    const isMob = window.innerWidth < 768
    const introMs  = isMob ? 1200 : 1400   // desktop: 2000 → 1400ms
    const totalMs  = isMob ? 1950 : 2250   // = introMs + 750ms curtain + 100ms buffer
    const t1 = setTimeout(() => setPhase('open'), introMs)
    const t2 = setTimeout(() => {
      setPhase('done')
      document.body.style.overflow = ''
    }, totalMs)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (phase === 'done') return null

  const opening = phase === 'open'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: opening ? 'none' : 'all' }}>
      {/* Left curtain */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '50%', height: '100%',
        background: '#0d0d0f',
        animation: opening ? 'curtainLeft 0.75s cubic-bezier(0.76,0,0.24,1) forwards' : 'none',
      }} />
      {/* Right curtain */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '50%', height: '100%',
        background: '#0d0d0f',
        animation: opening ? 'curtainRight 0.75s cubic-bezier(0.76,0,0.24,1) forwards' : 'none',
      }} />

      {/* Stage light rays */}
      {[
        { left: '18%', r: '12deg',  color: 'rgba(214,54,58,0.35)',   delay: '0.15s' },
        { left: '82%', r: '-12deg', color: 'rgba(214,54,58,0.35)',   delay: '0.25s' },
        { left: '50%', r: '0deg',   color: 'rgba(255,210,140,0.15)', delay: '0.05s' },
      ].map((ray, i) => (
        <div key={i} style={{
          position: 'absolute', top: 0, left: ray.left,
          width: '3px', height: '75vh',
          background: `linear-gradient(180deg, ${ray.color}, transparent)`,
          transformOrigin: 'top center',
          transform: `rotate(${ray.r})`,
          filter: 'blur(2px)',
          opacity: opening ? undefined : 0,
          animation: opening
            ? 'rayFadeOut 0.5s ease forwards'
            : `rayAppear 0.7s ${ray.delay} ease forwards`,
          '--r': ray.r,
        }} />
      ))}

      {/* Center content — fades out as curtains open */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
        opacity: opening ? 0 : 1,
        transform: opening ? 'scale(0.92)' : 'scale(1)',
        transition: opening ? 'opacity 0.35s ease, transform 0.35s ease' : 'none',
      }}>
        <picture style={{ display: 'block', width: 'clamp(220px, 40vw, 520px)' }}>
          <source srcSet="/logo-transparent.webp" type="image/webp" />
          <img
          src="/logo-transparent.png"
          alt="Limidid Ädischn"
          fetchPriority="high"
          width="1440"
          height="690"
          style={{
            width: '100%',
            height: 'auto',
            filter: 'drop-shadow(0 0 50px rgba(214,54,58,0.55))',
            opacity: 0,
            animation: 'logoFlipIn 0.9s 0.1s cubic-bezier(0.34,1.1,0.64,1) forwards',
          }}
        />
        </picture>
        <p style={{
          color: 'rgba(247,247,247,0.5)', fontSize: '12px',
          letterSpacing: '6px', textTransform: 'uppercase',
          marginTop: '28px', opacity: 0,
          animation: 'taglineFadeIn 0.6s 0.9s ease forwards',
        }}>
          Partyband aus Franken
        </p>
      </div>
    </div>
  )
}

// ─── Stage Spotlights ─────────────────────────────────────────────────────────
function StageSpotlight({ side }) {
  // Mobile has no cursor — spotlight is meaningless and wastes GPU. Return nothing.
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const onResize = debounce(() => setIsMobile(window.innerWidth < 768), 150)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const coneRef = useRef(null)
  const posX    = useRef(side === 'left' ? 180 : window.innerWidth - 180)
  const posY    = 110
  const rafId   = useRef(null)

  useEffect(() => {
    if (isMobile) return  // no listeners on mobile

    const onResize = () => {
      posX.current = side === 'left' ? 180 : window.innerWidth - 180
    }
    // RAF-throttled: only one DOM write per frame max (caps at 60fps)
    const onMove = (e) => {
      if (rafId.current) return
      const cx = e.clientX, cy = e.clientY
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null
        if (!coneRef.current) return
        const dx    = cx - posX.current
        const dy    = cy - posY
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) - 90
        coneRef.current.style.transform = `rotate(${angle}deg)`
      })
    }
    window.addEventListener('resize',    onResize, { passive: true })
    window.addEventListener('mousemove', onMove,   { passive: true })
    return () => {
      window.removeEventListener('resize',    onResize)
      window.removeEventListener('mousemove', onMove)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [isMobile, side])

  // No cursor on mobile → render nothing at all
  if (isMobile) return null

  const edgeOffset   = 0   // spotlight pivot sits at the screen corner edge
  const defaultAngle = side === 'left' ? 'rotate(25deg)' : 'rotate(-25deg)'
  const intensity    = 1  // always full intensity on desktop

  return (
    <div style={{
      position: 'fixed',
      top: posY,
      left: side === 'left' ? edgeOffset : undefined,
      right: side === 'right' ? edgeOffset : undefined,
      zIndex: 900,
      pointerEvents: 'none',
    }}>
      {/* Rotating cone — origin is the spotlight center (0,0).
          will-change:transform creates a GPU compositing layer so the blurred
          children are rasterised once; rotation is pure GPU compositing, no CPU repaint. */}
      <div
        ref={coneRef}
        style={{
          position: 'absolute', left: 0, top: 0,
          transformOrigin: '0 0',
          transform: defaultAngle,
          willChange: 'transform',
        }}
      >
        {/* Wide ambient halo */}
        <div style={{
          position: 'absolute',
          top: '-10px', left: '-200px',
          width: '400px', height: '700px',
          background: `radial-gradient(ellipse 40% 95% at 50% 0%, rgba(255,220,120,${0.10 * intensity}) 0%, rgba(255,200,80,${0.04 * intensity}) 45%, transparent 75%)`,
          filter: 'blur(55px)',
        }} />
        {/* Mid cone */}
        <div style={{
          position: 'absolute',
          top: '-5px', left: '-110px',
          width: '220px', height: '580px',
          background: `radial-gradient(ellipse 45% 90% at 50% 0%, rgba(255,230,150,${0.22 * intensity}) 0%, rgba(255,210,100,${0.08 * intensity}) 50%, transparent 80%)`,
          filter: 'blur(28px)',
        }} />
        {/* Inner bright streak */}
        <div style={{
          position: 'absolute',
          top: '-2px', left: '-45px',
          width: '90px', height: '460px',
          background: `radial-gradient(ellipse 50% 85% at 50% 0%, rgba(255,245,210,${0.32 * intensity}) 0%, rgba(255,235,170,${0.10 * intensity}) 55%, transparent 85%)`,
          filter: 'blur(12px)',
        }} />
        {/* Hot center thread */}
        <div style={{
          position: 'absolute',
          top: 0, left: '-12px',
          width: '24px', height: '320px',
          background: `radial-gradient(ellipse 60% 80% at 50% 0%, rgba(255,255,240,${0.38 * intensity}) 0%, rgba(255,245,200,${0.12 * intensity}) 60%, transparent 100%)`,
          filter: 'blur(5px)',
        }} />
      </div>

      {/* Spotlight lamp */}
      <div style={{
        position: 'absolute',
        transform: 'translate(-10px, -10px)',
        width: 20, height: 20,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #fff 0%, #ffe090 55%, #ff9200 100%)',
        boxShadow: `0 0 ${8 * intensity}px ${4 * intensity}px rgba(255,195,80,0.9), 0 0 24px rgba(255,140,30,${0.45 * intensity})`,
        zIndex: 901,
      }} />
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
// ─── Scroll Progress Bar ─────────────────────────────────────────────────────
function ScrollProgress() {
  const barRef = useRef(null)
  useEffect(() => {
    const onScroll = () => {
      const el = barRef.current
      if (!el) return
      const scrolled = window.scrollY
      const total   = document.documentElement.scrollHeight - window.innerHeight
      el.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 3, zIndex: 10000, background: 'rgba(0,0,0,0.2)',
    }}>
      <div ref={barRef} style={{
        height: '100%', width: '0%',
        background: `linear-gradient(90deg, ${C.redDark}, ${C.red}, ${C.redLight})`,
        transition: 'width 0.1s linear',
        boxShadow: `0 0 8px ${C.red}`,
      }} />
    </div>
  )
}

// ─── WhatsApp Floating Button ─────────────────────────────────────────────────
function WhatsAppButton() {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  // Replace with the band's actual WhatsApp number (international format, no +/spaces):
  const PHONE = '4917622783639'
  // Hover expansion only makes sense when a cursor exists — on touch it would stick open
  const isMobile = window.innerWidth < 768

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const expanded = !isMobile && hovered

  return (
    <a
      href={`https://wa.me/${PHONE}?text=Hallo!%20Ich%20m%C3%B6chte%20Limidid%20%C3%84dischn%20f%C3%BCr%20eine%20Veranstaltung%20buchen.`}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={isMobile ? undefined : () => setHovered(true)}
      onMouseLeave={isMobile ? undefined : () => setHovered(false)}
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 9998,
        display: 'flex', alignItems: 'center', gap: 10,
        background: expanded ? '#1ebe5d' : '#25D366',
        color: '#fff', textDecoration: 'none',
        borderRadius: 50, padding: expanded ? '12px 20px 12px 14px' : '14px',
        boxShadow: '0 4px 24px rgba(37,211,102,0.45)',
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.6)',
        pointerEvents: visible ? 'auto' : 'none',
        animation: visible ? 'pulse-glow-wa 2.8s ease-in-out infinite' : 'none',
        fontFamily: "'Inter', sans-serif",
        fontWeight: 700, fontSize: 13, letterSpacing: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {/* WhatsApp SVG icon */}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      {expanded && <span>JETZT ANFRAGEN</span>}
    </a>
  )
}

// ─── Photo Gallery ────────────────────────────────────────────────────────────
// Drop your photos into /public/gallery/ as foto-1.jpg … foto-9.jpg
const GALLERY_PHOTOS = Array.from({ length: 9 }, (_, i) => ({
  src:  `/gallery/foto-${i + 1}.jpg`,
  alt:  `Limidid Ädischn Live – Bild ${i + 1}`,
  // span: which photos are "big" (col/row span 2 in the masonry grid)
  wide: [0, 4, 7].includes(i),
  tall: [2, 5].includes(i),
}))

function Gallery() {
  const [lightbox, setLightbox]   = useState(null) // index or null
  const [imgError, setImgError]   = useState({})   // track broken images
  const [screenW,  setScreenW]    = useState(() => window.innerWidth)
  const touchStartX = useRef(null)  // for swipe navigation in lightbox
  useEffect(() => {
    const onResize = debounce(() => setScreenW(window.innerWidth), 150)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Keyboard nav
  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e) => {
      if (e.key === 'Escape')     setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox(i => (i + 1) % GALLERY_PHOTOS.length)
      if (e.key === 'ArrowLeft')  setLightbox(i => (i - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  const allMissing = GALLERY_PHOTOS.every((_, i) => imgError[i])
  const isMobile = screenW < 768
  // cols drives both gridTemplateColumns AND tells tiles whether span-2 is allowed
  const cols = screenW < 640 ? 1 : screenW < 1024 ? 2 : 3

  return (
    <section id="galerie" style={{ padding: isMobile ? '64px 0 56px' : '100px 0 80px', background: C.darker }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 16px' }}>

        {/* Heading */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: isMobile ? 36 : 56 }}>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: 12,
            letterSpacing: 6, color: C.red, textTransform: 'uppercase', marginBottom: 12,
          }}>Erlebe uns live</p>
          <h2 className="font-display" style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1 }}>
            MOMENTE
          </h2>
          <p style={{ color: C.muted, marginTop: 14, fontSize: 15 }}>
            Sieh selbst, wie es bei unseren Auftritten zugeht.
          </p>
          <div className="accent-line" style={{ width: 80, margin: '20px auto 0' }} />
        </div>

        {/* Placeholder hint when no photos loaded yet */}
        {allMissing && (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            border: `1px dashed ${C.faint}`, borderRadius: 12,
            color: C.muted, fontSize: 14, lineHeight: 1.8,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
            <strong style={{ color: C.light }}>Fotos hier einfügen</strong><br />
            Lege deine Bilder als <code style={{ color: C.red }}>foto-1.jpg … foto-9.jpg</code><br />
            in den Ordner <code style={{ color: C.red }}>/public/gallery/</code>
          </div>
        )}

        {/* Masonry-style CSS grid — columns collapse on smaller screens.
            cols is passed to tiles so they can suppress span-2 on narrow grids */}
        {!allMissing && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: cols === 1 ? '1fr' : cols === 2 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gridAutoRows: cols === 1 ? '240px' : '220px',
            gap: isMobile ? 8 : 10,
          }}>
            {GALLERY_PHOTOS.map((photo, i) => {
              if (imgError[i]) return null
              return (
                <GalleryTile
                  key={i}
                  photo={photo}
                  index={i}
                  cols={cols}
                  onOpen={() => setLightbox(i)}
                  onError={() => setImgError(prev => ({ ...prev, [i]: true }))}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Lightbox — swipe left/right on mobile to navigate */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={e => {
            if (touchStartX.current === null) return
            const dx = e.changedTouches[0].clientX - touchStartX.current
            if (dx > 50)  setLightbox(i => (i - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length)
            if (dx < -50) setLightbox(i => (i + 1) % GALLERY_PHOTOS.length)
            touchStartX.current = null
          }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9990,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          {/* Prev — hidden on mobile (swipe instead) */}
          {!isMobile && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(i => (i - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length) }}
              style={lbBtnStyle('left')}
            >&#8592;</button>
          )}

          <img
            src={GALLERY_PHOTOS[lightbox].src}
            alt={GALLERY_PHOTOS[lightbox].alt}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '88vh',
              objectFit: 'contain', borderRadius: 8,
              boxShadow: `0 0 60px rgba(214,54,58,0.3)`,
            }}
          />

          {/* Next — hidden on mobile (swipe instead) */}
          {!isMobile && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(i => (i + 1) % GALLERY_PHOTOS.length) }}
              style={lbBtnStyle('right')}
            >&#8594;</button>
          )}

          {/* Counter + swipe hint on mobile */}
          <div style={{
            position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            color: 'rgba(247,247,247,0.5)', fontSize: 13, letterSpacing: 2,
            fontFamily: "'Inter', sans-serif", textAlign: 'center', whiteSpace: 'nowrap',
          }}>
            {lightbox + 1} / {GALLERY_PHOTOS.length}
            {isMobile && (
              <span style={{ display: 'block', fontSize: 11, letterSpacing: 1.5, marginTop: 4, opacity: 0.5 }}>
                ← WISCHEN →
              </span>
            )}
          </div>

          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute', top: 20, right: 24,
              background: 'none', border: 'none', color: '#fff',
              fontSize: 28, cursor: 'pointer', lineHeight: 1,
            }}
          >✕</button>
        </div>
      )}
    </section>
  )
}

function GalleryTile({ photo, index, cols, onOpen, onError }) {
  const [hovered, setHovered] = useState(false)
  const [tapped,  setTapped]  = useState(false)
  const isMobile = window.innerWidth < 768

  const handleTouchStart = () => {
    // Flash-confirm tap with brief animation state
    setTapped(true)
    setTimeout(() => setTapped(false), 320)
  }

  const active = hovered || tapped

  return (
    <div
      className="reveal"
      onClick={onOpen}
      onMouseEnter={isMobile ? undefined : () => setHovered(true)}
      onMouseLeave={isMobile ? undefined : () => setHovered(false)}
      onTouchStart={handleTouchStart}
      style={{
        // span-2 only when grid actually has room for it
        gridColumn: (photo.wide && cols >= 2) ? 'span 2' : 'span 1',
        gridRow:    (photo.tall && cols >= 2) ? 'span 2' : 'span 1',
        position: 'relative', overflow: 'hidden',
        borderRadius: 8, cursor: 'pointer',
        background: C.card,
        animation: tapped ? 'tileFlash 0.32s ease' : 'none',
      }}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        onError={onError}
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          transition: 'transform 0.5s ease',
          transform: hovered ? 'scale(1.07)' : 'scale(1)',
          display: 'block',
        }}
      />
      {/* Overlay — visible on hover (desktop) or tap flash (mobile) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: active ? 'rgba(214,54,58,0.35)' : 'rgba(0,0,0,0.12)',
        transition: 'background 0.35s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {active && (
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            border: '2px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: '#fff',
          }}>⊕</div>
        )}
      </div>
    </div>
  )
}

function lbBtnStyle(side) {
  return {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    [side]: 16,
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff', fontSize: 22, width: 44, height: 44,
    borderRadius: '50%', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.2s',
    zIndex: 1,
  }
}

export default function App() {
  useReveal()
  const parallaxRef = useParallax()

  // On mobile the loading screen delays LCP by ~2s (curtain blocks hero visibility).
  // Skip it on mobile — hero fades in directly via CSS animation instead.
  const skipLoadingScreen = window.innerWidth < 768

  return (
    <>
      {!skipLoadingScreen && <LoadingScreen />}
      <StageSpotlight side="left" />
      <StageSpotlight side="right" />
      <StageFog />
      <div className="noise" />
      <ScrollProgress />
      <NavBar />
      <Hero parallaxRef={parallaxRef} />
      <Marquee />
      <UeberUns />
      <WaveDivider />
      <Repertoire />
      <Marquee />
      <Band />
      <Gallery />
      <WaveDivider />
      <FAQ />
      <BookingForm />
      <Footer />
      <WhatsAppButton />
    </>
  )
}
