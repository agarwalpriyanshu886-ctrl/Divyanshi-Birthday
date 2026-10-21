import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Menu, X, ChevronLeft, ChevronRight, ArrowUp, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { content as C } from './data/birthdayContent.js'
import { photos } from './data/birthdayPhotos.js'
import { fireConfetti } from './utils/confetti.js'
import { musicBox } from './utils/audioSynth.js'

const EMO = ['💗', '✨', '🎀', '🎉', '🦋', '🌷']

function Reveal({ children, delay = 0, className = '' }) {
  const rm = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={rm ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}

function Burst({ k, n = 22 }) {
  const items = useMemo(() => Array.from({ length: n }, (_, i) => {
    const a = Math.random() * Math.PI * 2
    const d = 90 + Math.random() * 140
    return { i, dx: Math.cos(a) * d, dy: Math.sin(a) * d - 40, e: EMO[i % EMO.length], dl: Math.random() * 0.15 }
  }), [k, n])

  if (!k) return null
  return (
    <div className="burst" aria-hidden="true" key={k}>
      {items.map((p) => (
        <span key={p.i} style={{ '--dx': p.dx + 'px', '--dy': p.dy + 'px', animationDelay: p.dl + 's' }}>
          {p.e}
        </span>
      ))}
    </div>
  )
}

function Photo({ p, className = '', eager }) {
  const [bad, setBad] = useState(false)
  if (bad) {
    return (
      <div className="ph-missing">
        <span>📸</span>
        <b>Add our photo here 📸</b>
      </div>
    )
  }
  return (
    <div className={'frame ' + className}>
      <img
        src={p.src}
        alt={p.alt}
        loading={eager ? 'eager' : 'lazy'}
        onError={() => setBad(true)}
        style={{ objectPosition: p.objectPosition || 'center' }}
      />
    </div>
  )
}

function Polaroid({ p, rot = 0, onClick, eager, big }) {
  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick()
    }
  }
  return (
    <figure
      className={'polaroid' + (big ? ' big' : '') + (onClick ? ' interactive' : '')}
      style={{ '--r': rot + 'deg' }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'View photo: ' + p.caption : undefined}
    >
      <Photo p={p} eager={eager} />
      <figcaption>{p.caption}</figcaption>
      <i className="tape" aria-hidden="true" />
    </figure>
  )
}

function Gift({ open }) {
  return (
    <svg className={'gift' + (open ? ' open' : '')} viewBox="0 0 200 190" role="img" aria-label="Gift box">
      <g className="lid">
        <rect x="30" y="52" width="140" height="34" rx="8" fill="#F8AFCB" />
        <rect x="90" y="52" width="20" height="34" fill="#fff" />
        <path d="M100 52 C70 10 40 30 100 52 C160 30 130 10 100 52Z" fill="#fff" stroke="#F8AFCB" strokeWidth="4" />
      </g>
      <rect x="40" y="86" width="120" height="90" rx="8" fill="#FFD6E7" />
      <rect x="90" y="86" width="20" height="90" fill="#fff" />
    </svg>
  )
}

function Welcome({ onDone, onStartMusic }) {
  const [open, setOpen] = useState(false)
  const [k, setK] = useState(0)

  const go = () => {
    setOpen(true)
    setK(1)
    fireConfetti({ count: 70 })
    if (onStartMusic) onStartMusic()
    setTimeout(onDone, 1100)
  }

  return (
    <motion.section className="welcome" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      <div className="stars" aria-hidden="true" />
      <p className="label">{C.welcome.label}</p>
      <h1 className="hand-title">{C.welcome.title}</h1>
      <p className="lead">{C.welcome.sub}</p>
      <div className="gift-wrap">
        <Gift open={open} />
        <Burst k={k} />
      </div>
      <button className="btn" onClick={go} disabled={open}>{C.welcome.button}</button>
    </motion.section>
  )
}

function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <header className="nav">
        <a className="brand" href="#home">D 💗</a>
        <button className="menu-btn" aria-expanded={open} aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? 'open' : ''} aria-label="Sections">
          {C.nav.map(([l, id]) => (
            <a key={id} href={'#' + id} onClick={() => setOpen(false)}>{l}</a>
          ))}
        </nav>
      </header>
      {open && <div className="nav-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
    </>
  )
}

function Cake({ mini, lit = [true, true, true], onToggleCandle }) {
  return (
    <svg className={'cake' + (mini ? ' mini' : '')} viewBox="0 0 240 230" role="img" aria-label="Birthday cake with candles">
      <ellipse cx="120" cy="214" rx="105" ry="10" fill="#E6DDF7" />
      <rect x="30" y="140" width="180" height="70" rx="14" fill="#FFDCC8" />
      <rect x="50" y="95" width="140" height="55" rx="14" fill="#F8AFCB" />
      <path d="M50 108 q12 18 24 0 q12 18 24 0 q12 18 24 0 q12 18 24 0 q12 18 22 0 V100 H50Z" fill="#fff" />
      <path d="M30 152 q15 20 30 0 q15 20 30 0 q15 20 30 0 q15 20 30 0 q15 20 30 0 q15 20 30 0 V146H30Z" fill="#fff" />
      <text x="120" y="188" textAnchor="middle" fontSize="22">💗</text>
      {[90, 120, 150].map((x, n) => {
        const isLit = mini ? true : lit[n]
        return (
          <g
            key={x}
            className={!mini ? 'candle-hit' : undefined}
            onClick={!mini && onToggleCandle ? () => onToggleCandle(n) : undefined}
            role={!mini ? 'button' : undefined}
            aria-label={!mini ? `Candle ${n + 1}: ${isLit ? 'Lit. Tap to blow out' : 'Unlit'}` : undefined}
            tabIndex={!mini ? 0 : undefined}
            onKeyDown={!mini && onToggleCandle ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleCandle(n) } } : undefined}
          >
            <rect x={x - 4} y="62" width="8" height="34" rx="3" fill="#E6DDF7" />
            {isLit ? (
              <g>
                <ellipse className="flame" cx={x} cy="54" rx="6" ry="10" fill="#FFB347" />
                <ellipse className="flame" cx={x} cy="55" rx="3.5" ry="6.5" fill="#FFEE55" />
              </g>
            ) : (
              <ellipse className="candle-smoke" cx={x} cy="52" rx="4" ry="7" fill="rgba(150,150,150,0.5)" />
            )}
          </g>
        )
      })}
    </svg>
  )
}

function Hero({ onOpenPhoto }) {
  const hp = photos.find((p) => p.also === 'hero')
  const hpIndex = hp ? photos.findIndex((p) => p.src === hp.src) : -1
  return (
    <section id="home" className="hero">
      <motion.div className="badge" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>{C.hero.badge}</motion.div>
      <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>{C.hero.title}</motion.h1>
      <p className="lead">{C.hero.line}</p>
      <p className="hand">{C.hero.sub}</p>
      <div className="hero-art">
        <Cake mini />
        {hp && <Polaroid p={hp} rot={4} eager onClick={hpIndex >= 0 && onOpenPhoto ? () => onOpenPhoto(hpIndex) : undefined} />}
      </div>
      <div className="btns">
        <a className="btn" href="#celebrate">{C.hero.b1}</a>
        <a className="btn ghost" href="#letter">{C.hero.b2}</a>
      </div>
    </section>
  )
}

function Message() {
  return (
    <section id="celebrate" className="sec">
      <Reveal>
        <h2>{C.message.heading}</h2>
        <div className="card note">
          {C.message.paragraphs.map((t, i) => <p key={i}>{t}</p>)}
          <p className="hand sig">— {C.message.signature}</p>
        </div>
      </Reveal>
    </section>
  )
}

function Why() {
  const [hot, setHot] = useState(null)
  return (
    <section className="sec">
      <Reveal><h2>{C.why.heading}</h2></Reveal>
      <div className="why">
        {C.why.cards.map(([t, m], i) => (
          <Reveal key={t} delay={i * 0.06}>
            <button
              className={'card why-card c' + i + (hot === i ? ' hot' : '')}
              onClick={() => setHot(hot === i ? null : i)}
            >
              <span className="pop" aria-hidden="true">💗</span>
              <h3>{t}</h3>
              <p>{m}</p>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Wishes() {
  const [i, setI] = useState(-1)
  const [pop, setPop] = useState(0)

  const next = () => {
    setI((p) => {
      let n
      do {
        n = Math.floor(Math.random() * C.wishes.list.length)
      } while (n === p && C.wishes.list.length > 1)
      return n
    })
    setPop((x) => x + 1)
  }

  return (
    <section id="wishes" className="sec">
      <Reveal>
        <h2>{C.wishes.heading}</h2>
        <div className="card wish" aria-live="polite">
          {i >= 0 && <span className="wish-tag">Wish {i + 1} of {C.wishes.list.length}</span>}
          <AnimatePresence mode="wait">
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {i < 0 ? 'Tap the button for a little wish 💗' : C.wishes.list[i]}
            </motion.p>
          </AnimatePresence>
          <Burst k={pop} n={10} />
        </div>
        <button className="btn" onClick={next}>{C.wishes.button}</button>
      </Reveal>
    </section>
  )
}

function CakeSection() {
  const [lit, setLit] = useState([true, true, true])
  const [done, setDone] = useState(false)
  const [more, setMore] = useState(false)
  const [k, setK] = useState(0)

  const toggleCandle = (n) => {
    setLit((prev) => {
      const next = prev.map((v, i) => (i === n ? !v : v))
      if (next.every((v) => !v)) {
        setDone(true)
        setK((x) => x + 1)
        fireConfetti({ count: 75, y: window.innerHeight * 0.45 })
      }
      return next
    })
  }

  const blowAll = () => {
    setLit([false, false, false])
    setDone(true)
    setK((x) => x + 1)
    fireConfetti({ count: 85, y: window.innerHeight * 0.45 })
  }

  const relight = () => {
    setLit([true, true, true])
    setDone(false)
    setMore(false)
  }

  const revealSurprise = () => {
    setMore(true)
    setK((x) => x + 1)
    fireConfetti({ count: 60 })
  }

  return (
    <section id="cake" className="sec">
      <Reveal>
        <h2>{C.cake.heading}</h2>
        <p className="lead">{C.cake.instructions}</p>
        <div className="cake-wrap">
          <Cake lit={lit} onToggleCandle={toggleCandle} />
          <Burst k={k} n={28} />
        </div>
        <div className="btns">
          {!done ? (
            <button className="btn" onClick={blowAll}>{C.cake.button}</button>
          ) : (
            <button className="btn ghost" onClick={relight}>Light them again 🕯️</button>
          )}
        </div>
        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card wish">
              <p>{C.cake.done}</p>
              {!more ? (
                <button className="btn" onClick={revealSurprise}>{C.cake.more}</button>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card note">
                  <p className="hand big">{C.cake.surprise}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Reveal>
    </section>
  )
}

function Lightbox({ list, i, setI }) {
  const close = useCallback(() => setI(null), [setI])
  const step = useCallback((d) => setI((x) => (x + d + list.length) % list.length), [list.length, setI])

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') step(-1)
      if (e.key === 'ArrowRight') step(1)
    }
    document.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', h)
      document.body.style.overflow = ''
    }
  }, [close, step])

  const sx = useRef(0)
  const p = list[i]

  if (!p) return null

  return (
    <div
      className="lb"
      role="dialog"
      aria-modal="true"
      aria-label="Photo preview"
      onClick={close}
      onTouchStart={(e) => (sx.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const d = e.changedTouches[0].clientX - sx.current
        if (Math.abs(d) > 40) step(d > 0 ? -1 : 1)
      }}
    >
      <span className="lb-badge" aria-label={`Photo ${i + 1} of ${list.length}`}>
        {i + 1} / {list.length}
      </span>
      <button className="lb-x" onClick={close} aria-label="Close preview"><X size={20} /></button>
      {list.length > 1 && (
        <button className="lb-n l" onClick={(e) => { e.stopPropagation(); step(-1) }} aria-label="Previous photo">
          <ChevronLeft size={24} />
        </button>
      )}
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={p.src} alt={p.alt} />
        <figcaption>{p.caption}</figcaption>
      </figure>
      {list.length > 1 && (
        <button className="lb-n r" onClick={(e) => { e.stopPropagation(); step(1) }} aria-label="Next photo">
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  )
}

function Gallery({ onOpenPhoto }) {
  const rots = [-3, 2.5, -2, 3, -2.5, 2]
  return (
    <section id="memories" className="sec wide">
      <Reveal><h2>{C.gallery.heading}</h2></Reveal>
      <div className="gal">
        {photos.map((p, n) => (
          <Reveal key={p.src} delay={(n % 3) * 0.08} className={'gi g' + n}>
            <Polaroid
              p={p}
              rot={rots[n % 6]}
              big={n === 0 || n === 3}
              onClick={() => onOpenPhoto(n)}
            />
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Letter({ onOpenPhoto }) {
  const [open, setOpen] = useState(false)
  const lp = photos.find((p) => p.also === 'letter')
  const lpIndex = lp ? photos.findIndex((p) => p.src === lp.src) : -1

  return (
    <section id="letter" className="sec">
      <Reveal>
        <h2>{C.letter.heading}</h2>
        {!open ? (
          <div className="env">
            <div className="env-body">
              <span className="env-flap" />
              <p className="hand">{C.letter.envelope}</p>
            </div>
            <button className="btn" onClick={() => setOpen(true)}>{C.letter.button}</button>
          </div>
        ) : (
          <motion.div className="card paper" initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
            {lp && <Polaroid p={lp} rot={-3} onClick={lpIndex >= 0 && onOpenPhoto ? () => onOpenPhoto(lpIndex) : undefined} />}
            {C.letter.paragraphs.map((t, i) => (
              <p key={i} className="fade" style={{ animationDelay: Math.min(i * 0.1, 1.2) + 's' }}>{t}</p>
            ))}
            <p className="hand sig fade" style={{ animationDelay: '1.4s' }}>
              {C.letter.closing.map((l) => <span key={l}>{l}<br /></span>)}
              <span className="end-heart">💗</span>
            </p>
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button className="btn ghost fold-btn" onClick={() => setOpen(false)}>Fold Letter 💌</button>
            </div>
          </motion.div>
        )}
      </Reveal>
    </section>
  )
}

function Final({ onOpenPhoto }) {
  const [open, setOpen] = useState(false)
  const [k, setK] = useState(0)
  const fp = photos.find((p) => p.also === 'final')
  const fpIndex = fp ? photos.findIndex((p) => p.src === fp.src) : -1

  const handleOpen = () => {
    setOpen(true)
    setK((x) => x + 1)
    fireConfetti({ count: 90, fullRain: true })
  }

  return (
    <section id="surprise" className={'sec final' + (open ? ' glow' : '')}>
      <h2>{C.final.heading}</h2>
      <div className="gift-wrap big">
        <Gift open={open} />
        <Burst k={k} n={40} />
      </div>
      {!open && (
        <button className="btn" onClick={handleOpen}>{C.final.button}</button>
      )}
      {open && (
        <motion.div
          className="card note final-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {fp && <Polaroid p={fp} rot={-2} onClick={fpIndex >= 0 && onOpenPhoto ? () => onOpenPhoto(fpIndex) : undefined} />}
          <h3>{C.final.title}</h3>
          {C.final.paragraphs.map((t, i) => <p key={i}>{t}</p>)}
          <p className="hand sig">{C.final.signoff.map((l) => <span key={l}>{l}<br /></span>)}</p>
        </motion.div>
      )}
      <p className="foot">{C.final.footer}</p>
    </section>
  )
}

function Music({ musicState, setMusicState }) {
  const audioRef = useRef(null)
  const { on, mute, useSynth } = musicState

  useEffect(() => {
    const el = audioRef.current
    if (on) {
      if (useSynth) {
        musicBox.start()
      } else if (el) {
        el.play().catch(() => {
          musicBox.start()
          setMusicState((prev) => ({ ...prev, useSynth: true }))
        })
      }
    } else {
      if (useSynth) {
        musicBox.stop()
      } else if (el) {
        el.pause()
      }
    }
  }, [on, useSynth, setMusicState])

  useEffect(() => {
    const el = audioRef.current
    if (el) el.muted = mute
    musicBox.setMuted(mute)
  }, [mute])

  const toggle = () => {
    setMusicState((prev) => ({ ...prev, on: !prev.on }))
  }

  const toggleMute = () => {
    setMusicState((prev) => ({ ...prev, mute: !prev.mute }))
  }

  return (
    <div className="music">
      <audio
        ref={audioRef}
        src={C.musicSrc}
        loop
        preload="auto"
        muted={mute}
        onError={() => {
          setMusicState((prev) => ({ ...prev, useSynth: true }))
        }}
      />
      <button
        className={on ? 'active' : ''}
        onClick={toggle}
        aria-label={on ? 'Pause music' : 'Play music'}
        title={on ? 'Pause background music' : 'Play background music'}
      >
        {on ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <button
        onClick={toggleMute}
        aria-label={mute ? 'Unmute' : 'Mute'}
        title={mute ? 'Unmute' : 'Mute'}
      >
        {mute ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  )
}

function Floaters() {
  const items = useMemo(() => Array.from({ length: 9 }, (_, i) => ({
    i,
    l: 5 + i * 11 + (i % 2) * 3,
    d: 14 + (i % 4) * 4,
    dl: -i * 2.2,
    e: EMO[i % 6]
  })), [])

  return (
    <div className="floaters" aria-hidden="true">
      {items.map((f) => (
        <span key={f.i} style={{ left: f.l + '%', animationDuration: f.d + 's', animationDelay: f.dl + 's' }}>
          {f.e}
        </span>
      ))}
    </div>
  )
}

function CursorGlow() {
  const [pos, setPos] = useState({ x: -500, y: -500 })
  const [sparkles, setSparkles] = useState([])
  const lastSpawn = useRef(0)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    let frame = null

    const handleMove = (e) => {
      const { clientX: x, clientY: y } = e
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setPos({ x, y }))

      const now = Date.now()
      if (now - lastSpawn.current > 75) {
        lastSpawn.current = now
        const emojis = ['✨', '💗', '🎀', '⭐']
        const id = Math.random().toString(36).substring(2, 9)
        const angle = Math.random() * Math.PI * 2
        const dist = 14 + Math.random() * 20
        const item = {
          id,
          x,
          y,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          sx: Math.cos(angle) * dist + 'px',
          sy: Math.sin(angle) * dist + 'px',
          sr: (Math.random() - 0.5) * 60 + 'deg'
        }
        setSparkles((prev) => [...prev.slice(-14), item])
      }
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <>
      <div
        className="cursor-glow"
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
        aria-hidden="true"
      />
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="sparkle-dot"
          style={{
            left: s.x,
            top: s.y,
            '--sx': s.sx,
            '--sy': s.sy,
            '--sr': s.sr
          }}
          aria-hidden="true"
        >
          {s.emoji}
        </span>
      ))}
    </>
  )
}

export default function App() {
  const [welcomed, setWelcomed] = useState(false)
  const [top, setTop] = useState(false)
  const [activePhoto, setActivePhoto] = useState(null)
  const [musicState, setMusicState] = useState({ on: false, mute: false, useSynth: false })

  useEffect(() => {
    const h = () => setTop(window.scrollY > 500)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const startMusicOnUnlock = () => {
    if (!C.features.music) return
    musicBox.init()
    setMusicState((prev) => ({ ...prev, on: true }))
  }

  return (
    <>
      {C.features.cursorGlow && <CursorGlow />}
      <AnimatePresence>
        {!welcomed && (
          <Welcome
            key="w"
            onDone={() => setWelcomed(true)}
            onStartMusic={startMusicOnUnlock}
          />
        )}
      </AnimatePresence>
      {welcomed && (
        <>
          <Floaters />
          <Nav />
          <main>
            <Hero onOpenPhoto={setActivePhoto} />
            <Message />
            <Why />
            <Wishes />
            <CakeSection />
            <Gallery onOpenPhoto={setActivePhoto} />
            <Letter onOpenPhoto={setActivePhoto} />
            <Final onOpenPhoto={setActivePhoto} />
          </main>
          {C.features.music && <Music musicState={musicState} setMusicState={setMusicState} />}
          {top && (
            <button
              className="to-top"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
            >
              <ArrowUp />
            </button>
          )}
          {activePhoto !== null && (
            <Lightbox list={photos} i={activePhoto} setI={setActivePhoto} />
          )}
        </>
      )}
    </>
  )
}
