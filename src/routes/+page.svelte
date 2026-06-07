<script lang="ts">
  import StarfieldBg from '$lib/components/StarfieldBg.svelte'
  import AuthButton from '$lib/components/AuthButton.svelte'
  import { Rocket, Zap, Clock, ArrowRight } from '@lucide/svelte'
</script>

<svelte:head>
  <title>Rocket Kanban - Ship Your Tasks</title>
  <meta name="description" content="A futuristic Kanban board to launch your productivity" />
</svelte:head>

<div class="relative min-h-screen w-full overflow-hidden">
  <StarfieldBg />

  <div class="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
    <!-- Logo and title -->
    <div class="text-center mb-16">
      <div class="text-8xl mb-6 animate-bounce">🚀</div>
      <h1 class="text-5xl md:text-7xl font-mono font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
        Rocket Kanban
      </h1>
      <p class="text-lg md:text-xl text-gray-400 font-mono max-w-md mx-auto">
        Launch your tasks into orbit. The minimalist Kanban board for focused teams.
      </p>
    </div>

    <!-- CTA buttons -->
    <div class="flex flex-col sm:flex-row gap-4 mb-20">
      <a
        href="/signup"
        class="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-mono text-lg hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 flex items-center gap-3"
      >
        Get Started Free
        <ArrowRight size={20} class="group-hover:translate-x-1 transition-transform" />
      </a>
      <a
        href="/login"
        class="px-8 py-4 border border-cyan-500/30 text-cyan-400 rounded-xl font-mono text-lg hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all duration-300"
      >
        Sign In
      </a>
    </div>

    <!-- Features -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
      <div class="bg-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 text-center hover:border-cyan-500/30 transition-all">
        <div class="w-12 h-12 mx-auto mb-4 bg-cyan-500/10 rounded-lg flex items-center justify-center">
          <Zap size={24} class="text-cyan-400" />
        </div>
        <h3 class="text-white font-mono mb-2">Lightning Fast</h3>
        <p class="text-sm text-gray-500 font-mono">Drag and drop cards between lists. Zero lag, pure speed.</p>
      </div>

      <div class="bg-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 text-center hover:border-purple-500/30 transition-all">
        <div class="w-12 h-12 mx-auto mb-4 bg-purple-500/10 rounded-lg flex items-center justify-center">
          <Rocket size={24} class="text-purple-400" />
        </div>
        <h3 class="text-white font-mono mb-2">Stay Focused</h3>
        <p class="text-sm text-gray-500 font-mono">Clean interface. No distractions. Just your tasks and the cosmos.</p>
      </div>

      <div class="bg-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 text-center hover:border-pink-500/30 transition-all">
        <div class="w-12 h-12 mx-auto mb-4 bg-pink-500/10 rounded-lg flex items-center justify-center">
          <Clock size={24} class="text-pink-400" />
        </div>
        <h3 class="text-white font-mono mb-2">Track Progress</h3>
        <p class="text-sm text-gray-500 font-mono">Watch your tasks fly from "To Do" to "Done". See momentum build.</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="absolute bottom-8 text-center">
      <p class="text-xs font-mono text-gray-700">
        Built for speed. Designed for focus. Powered by caffeine. ☕
      </p>
    </div>
  </div>
</div>
