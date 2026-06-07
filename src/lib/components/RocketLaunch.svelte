<script lang="ts">
  import { fly } from 'svelte/transition'
  import { onMount } from 'svelte'

  let { show = false }: { show?: boolean } = $props()

  let particles: { x: number; y: number; vx: number; vy: number; color: string; size: number }[] = []
  let animationId: number = 0

  const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3']

  function spawnParticles() {
    particles = Array.from({ length: 40 }, () => ({
      x: 0.5,
      y: 0.5,
      vx: (Math.random() - 0.5) * 0.02,
      vy: -Math.random() * 0.015 - 0.005,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 4 + 2,
    }))
  }

  function animateParticles() {
    const canvas = document.getElementById('rocket-particles') as HTMLCanvasElement | null
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.0003
      p.size *= 0.998

      ctx.fillStyle = p.color
      ctx.fillRect(
        Math.floor(p.x * canvas.width),
        Math.floor(p.y * canvas.height),
        Math.ceil(p.size),
        Math.ceil(p.size)
      )
    }

    const alive = particles.filter(p => p.x > -0.1 && p.x < 1.1 && p.y > -0.1 && p.y < 1.1 && p.size > 0.5)
    if (alive.length > 0) {
      animationId = requestAnimationFrame(animateParticles)
    }
  }

  $effect(() => {
    if (show) {
      spawnParticles()
      const timer = setTimeout(() => {
        animationId = requestAnimationFrame(animateParticles)
      }, 100)
      return () => { clearTimeout(timer); cancelAnimationFrame(animationId) }
    }
    return () => cancelAnimationFrame(animationId)
  })
</script>

{#if show}
  <div
    transition:fly="{{ duration: 400, delay: 100 }}"
    class="fixed inset-0 flex items-center justify-center pointer-events-none"
    style="z-index: 9999"
  >
    <div
      class="text-6xl md:text-8xl font-mono"
      style="filter: drop-shadow(0 0 20px rgba(255, 200, 0, 0.8))"
    >
      🚀
    </div>
  </div>

  <canvas
    id="rocket-particles"
    class="fixed inset-0 pointer-events-none"
    style="z-index: 9998"
  ></canvas>
{/if}
