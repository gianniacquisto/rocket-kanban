<script lang="ts">
  import { supabase } from '$lib/supabase/client'
  import StarfieldBg from '$lib/components/StarfieldBg.svelte'
  import { Rocket, ArrowLeft, Mail, Lock, User } from '@lucide/svelte'

  let name = $state('')
  let email = $state('')
  let password = $state('')
  let loading = $state(false)
  let error = $state('')
  let success = $state(false)

  async function handleSignup() {
    loading = true
    error = ''

    if (!name || !email || !password) {
      error = 'Please fill in all fields'
      loading = false
      return
    }

    if (password.length < 6) {
      error = 'Password must be at least 6 characters'
      loading = false
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      error = signUpError.message
      loading = false
      return
    }
    success = true
  }

  function navigateToLogin() {
    window.location.href = '/login'
  }
</script>

<div class="relative min-h-screen w-full overflow-hidden">
  <StarfieldBg />

  <div class="relative z-10 flex items-center justify-center min-h-screen px-4">
    <div class="w-full max-w-md">
      <button
        onclick={() => (window.location.href = '/')}
        class="flex items-center gap-2 text-gray-500 hover:text-cyan-400 font-mono text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to home
      </button>

      <div class="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl shadow-cyan-500/5">
        {#if success}
          <div class="text-center py-8">
            <div class="text-6xl mb-4">🎉</div>
            <h2 class="text-2xl font-mono font-bold text-white mb-2">Check your email!</h2>
            <p class="text-sm text-gray-500 font-mono">
              We've sent a confirmation link to <span class="text-cyan-400">{email}</span>
            </p>
            <p class="text-xs text-gray-600 font-mono mt-4">
              Click the link to activate your account and launch your first board!
            </p>
          </div>
        {:else}
          <div class="text-center mb-8">
            <div class="text-5xl mb-4">🚀</div>
            <h1 class="text-2xl font-mono font-bold text-white mb-2">Join Rocket Kanban</h1>
            <p class="text-sm text-gray-500 font-mono">Create your account and start launching tasks</p>
          </div>

          {#if error}
            <div class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-mono text-center">
              {error}
            </div>
          {/if}

          <form onsubmit={(e) => { e.preventDefault(); handleSignup() }} class="space-y-4">
            <div>
              <label class="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2 block" for="signup-name">Name</label>
              <div class="relative">
                <User size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  id="signup-name"
                  type="text"
                  bind:value={name}
                  placeholder="Your name"
                  class="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white font-mono outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label class="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2 block" for="signup-email">Email</label>
              <div class="relative">
                <Mail size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  id="signup-email"
                  type="email"
                  bind:value={email}
                  placeholder="you@example.com"
                  class="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white font-mono outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label class="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2 block" for="signup-password">Password</label>
              <div class="relative">
                <Lock size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  id="signup-password"
                  type="password"
                  bind:value={password}
                  placeholder="Min. 6 characters"
                  class="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white font-mono outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              class="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-mono hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p class="text-center text-sm text-gray-500 font-mono mt-6">
            Already have an account?{' '}
            <button onclick={navigateToLogin} class="text-purple-400 hover:text-purple-300 hover:underline">
              Sign in
            </button>
          </p>
        {/if}
      </div>
    </div>
  </div>
</div>
