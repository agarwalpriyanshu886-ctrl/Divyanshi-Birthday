// Lightweight zero-dependency Canvas Confetti engine
let canvas = null
let ctx = null
let particles = []
let animationId = null

const COLORS = ['#FFD6E7', '#F8AFCB', '#FFDCC8', '#E6DDF7', '#FFD700', '#FFFFFF', '#FF85A2']

function initCanvas() {
  if (canvas && document.body.contains(canvas)) return
  canvas = document.createElement('canvas')
  canvas.className = 'confetti-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.appendChild(canvas)
  ctx = canvas.getContext('2d')

  const resize = () => {
    if (!canvas || !ctx) return
    canvas.width = window.innerWidth * (window.devicePixelRatio || 1)
    canvas.height = window.innerHeight * (window.devicePixelRatio || 1)
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)
  }
  resize()
  window.addEventListener('resize', resize)
}

function createParticle(x, y, isFullRain = false) {
  const angle = isFullRain ? Math.PI / 2 + (Math.random() - 0.5) * 0.8 : Math.random() * Math.PI * 2
  const speed = isFullRain ? 2 + Math.random() * 4 : 5 + Math.random() * 12
  const shape = Math.random() > 0.4 ? 'rect' : (Math.random() > 0.5 ? 'heart' : 'circle')
  return {
    x: x ?? window.innerWidth / 2,
    y: y ?? (isFullRain ? -20 : window.innerHeight / 2),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - (isFullRain ? 0 : 3),
    w: 6 + Math.random() * 6,
    h: 8 + Math.random() * 8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rot: Math.random() * 360,
    vrot: (Math.random() - 0.5) * 12,
    gravity: 0.18 + Math.random() * 0.08,
    drag: 0.98,
    shape,
    opacity: 1,
    fade: 0.006 + Math.random() * 0.008,
    wobble: Math.random() * 10,
    wobbleSpeed: 0.05 + Math.random() * 0.05,
  }
}

function drawHeart(c, x, y, size, color, alpha) {
  c.save()
  c.globalAlpha = alpha
  c.fillStyle = color
  c.translate(x, y)
  c.scale(size / 15, size / 15)
  c.beginPath()
  c.moveTo(0, 0)
  c.bezierCurveTo(-5, -5, -10, 2, 0, 10)
  c.bezierCurveTo(10, 2, 5, -5, 0, 0)
  c.fill()
  c.restore()
}

function loop() {
  if (!ctx || !canvas) return
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.vx *= p.drag
    p.vy = p.vy * p.drag + p.gravity
    p.x += p.vx + Math.sin(p.wobble) * 1.2
    p.y += p.vy
    p.rot += p.vrot
    p.wobble += p.wobbleSpeed
    p.opacity -= p.fade

    if (p.opacity <= 0 || p.y > window.innerHeight + 40) {
      particles.splice(i, 1)
      continue
    }

    if (p.shape === 'heart') {
      drawHeart(ctx, p.x, p.y, p.w, p.color, p.opacity)
    } else {
      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.fillStyle = p.color
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rot * Math.PI) / 180)
      if (p.shape === 'circle') {
        ctx.beginPath()
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      }
      ctx.restore()
    }
  }

  if (particles.length > 0) {
    animationId = requestAnimationFrame(loop)
  } else {
    animationId = null
    if (ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  }
}

export function fireConfetti({ count = 50, x, y, fullRain = false } = {}) {
  try {
    initCanvas()
    const targetX = x ?? window.innerWidth / 2
    const targetY = y ?? (fullRain ? 0 : window.innerHeight / 2)

    for (let i = 0; i < count; i++) {
      particles.push(createParticle(fullRain ? Math.random() * window.innerWidth : targetX, targetY, fullRain))
    }

    if (!animationId) {
      animationId = requestAnimationFrame(loop)
    }
  } catch (e) {
    // Graceful fallback
  }
}
