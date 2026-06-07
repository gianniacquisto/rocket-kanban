<script lang="ts">
  let canvas: HTMLCanvasElement | undefined
  let rafId: number = 0
  let w = 0
  let h = 0

  // Stars & rockets are mutable refs — only alive in browser
  let stars: { x: number; y: number; z: number; size: number; brightness: number }[] = []
  let rockets: { x: number; y: number; angle: number; speed: number; size: number; trail: { x: number; y: number; alpha: number }[]; life: number }[] = []
  let time = 0

  const STAR_COUNT = 120
  const ROCKET_SPAWN_RATE = 0.003

  function initCanvas() {
    if (!canvas) return
    w = window.innerWidth
    h = window.innerHeight
    canvas.width = w
    canvas.height = h
  }

  function createStar() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 3 + 0.5,
      size: Math.random() * 2 + 0.5,
      brightness: Math.random() * 0.7 + 0.3,
    }
  }

  function createRocket() {
    const fromLeft = Math.random() > 0.5
    return {
      x: fromLeft ? -20 : w + 20,
      y: Math.random() * h * 0.6 + h * 0.2,
      angle: fromLeft ? 0 : Math.PI,
      speed: Math.random() * 2 + 1.5,
      size: Math.random() * 8 + 6,
      trail: [],
      life: 0,
    }
  }

  function drawRocket(ctx: CanvasRenderingContext2D, r: typeof rockets[0]) {
    const { x, y, size, trail, life } = r
    const s = size / 6

    for (let i = 0; i < trail.length; i++) {
      const t = trail[i]
      ctx.fillStyle = `rgba(255, ${100 + i * 5}, 0, ${t.alpha * (1 - i / trail.length)})`
      ctx.fillRect(Math.floor(t.x), Math.floor(t.y), 3, 3)
    }

    ctx.fillStyle = `rgba(180, 200, 255, ${0.8 + Math.sin(life * 0.1) * 0.2})`
    ctx.fillRect(Math.floor(x - s * 2), Math.floor(y - s * 3), s * 4, s * 6)
    ctx.fillRect(Math.floor(x - s), Math.floor(y - s * 5), s * 2, s * 4)
    ctx.fillStyle = `rgba(255, 100, 80, 0.9)`
    ctx.fillRect(Math.floor(x - s), Math.floor(y - s * 6), s * 2, s)
    ctx.fillRect(Math.floor(x - s * 0.5), Math.floor(y - s * 7), s, s)
    ctx.fillStyle = `rgba(100, 200, 255, 0.8)`
    ctx.fillRect(Math.floor(x - s * 0.5), Math.floor(y - s * 2), s, s)
    ctx.fillStyle = `rgba(255, 150, 50, 0.9)`
    ctx.fillRect(Math.floor(x - s * 3), Math.floor(y + s), s * 2, s)
    ctx.fillRect(Math.floor(x + s), Math.floor(y + s), s * 2, s)

    const glowSize = s * (2 + Math.sin(life * 0.3) * 0.5)
    ctx.fillStyle = `rgba(255, 200, 50, ${0.6 + Math.sin(life * 0.5) * 0.3})`
    ctx.fillRect(Math.floor(x - s), Math.floor(y + s * 3), s * 2, glowSize)
  }

  function loop() {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = 'rgba(8, 10, 20, 0.3)'
    ctx.fillRect(0, 0, w, h)
    time++

    for (const star of stars) {
      star.y += star.z * 0.3
      if (star.y > h) { star.y = 0; star.x = Math.random() * w }
      const a = Math.max(0, Math.min(1, star.brightness + Math.sin(time * 0.05 + star.x) * 0.15))
      ctx.fillStyle = `rgba(200, 220, 255, ${a})`
      ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size)
    }

    if (Math.random() < ROCKET_SPAWN_RATE && rockets.length < 3)
      rockets.push(createRocket())

    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i]; r.life++
      r.x += Math.cos(r.angle) * r.speed
      r.y += Math.sin(r.angle) * r.speed * 0.3
      r.trail.push({ x: r.x, y: r.y + 10, alpha: 1 })
      if (r.trail.length > 15) r.trail.shift()
      for (const t of r.trail) t.alpha *= 0.92
      drawRocket(ctx, r)
      if (r.x < -50 || r.x > w + 50 || r.life > 400) rockets.splice(i, 1)
    }

    const grad = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, w * 0.4)
    grad.addColorStop(0, `rgba(100, 0, 150, ${0.02 + Math.sin(time * 0.005) * 0.01})`)
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    rafId = requestAnimationFrame(loop)
  }

  // Svelte 5 effect — runs only in browser, cleanup on destroy
  $effect(() => {
    initCanvas()
    stars = Array.from({ length: STAR_COUNT }, createStar)
    loop()

    function onResize() { initCanvas() }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
    }
  })
</script>

<canvas
  bind:this={canvas}
  class="fixed inset-0 w-full h-full pointer-events-none"
  style="z-index: 0"
></canvas>
