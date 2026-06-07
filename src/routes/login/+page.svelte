<script lang="ts">
  import { supabase } from '$lib/supabase/client'
  import { isAuthenticated } from '$lib/stores/app'
  import StarfieldBg from '$lib/components/StarfieldBg.svelte'
  import { Rocket, ArrowLeft, Mail, Lock } from '@lucide/svelte'

  let email = $state('')
  let password = $state('')
  let loading = $state(false)
  let error = $state('')
  let sendingOtp = $state(false)
  let showingOtp = $state(false)



  async function handleLogin() {
    loading = true
    error = ''

    if (!email || !password) {
      error = 'Please enter both email and password'
      loading = false
      return
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      error = loginError.message
      loading = false
    } else {
      // Redirect to first board
      const { data: boards } = await supabase.from('boards').select('id').order('created_at', { ascending: false }).limit(1)
      if (boards && boards.length > 0) {
        window.location.href = `/board/${boards[0].id}`
      } else {
        window.location.href = '/'
      }
    }
  }

  async function handleMagicLink() {
    sendingOtp = true
    error = ''

    if (!email) {
      error = 'Please enter your email'
      sendingOtp = false
      return
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/board`,
      },
    })

    if (otpError) {
      error = otpError.message
    } else {
      showingOtp = true
    }

    sendingOtp = false
  }

  function navigateToSignup() {
    window.location.href = '/signup'
  }
</script>

<div class="relative min-h-screen w-full overflow-hidden">
  <StarfieldBg />

  <div class="relative z-10 flex items-center justify-center min-h-screen px-4">
    <div class="w-full max-w-md">
      <!-- Back button -->
      <button
        onclick={() => (window.location.href = '/')}
        class="flex items-center gap-2 text-gray-500 hover:text-cyan-400 font-mono text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to home
      </button>

      <!-- Login form -->
      <div class="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl shadow-purple-500/5">
        <div class="text-center mb-8">
          <div class="text-5xl mb-4">🚀</div>
          <h1 class="text-2xl font-mono font-bold text-white mb-2">Welcome Back</h1>
          <p class="text-sm text-gray-500 font-mono">Sign in to continue to Rocket Kanban</p>
        </div>

        {#if error}
          <div class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-mono text-center">
            {error}
          </div>
        {/if}

        {#if showingOtp}
          <div class="text-center mb-6">
            <p class="text-cyan-400 font-mono text-sm">Check your email for the magic link!</p>
            <p class="text-gray-500 font-mono text-xs mt-2">Didn't receive it? Try again.</p>
          </div>
        {:else}
          <!-- Email/Password form -->
          <form onsubmit={(e) => { e.preventDefault(); handleLogin() }} class="space-y-4">
            <div>
              <label class="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2 block" for="login-email">Email</label>
              <div class="relative">
                <Mail size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  id="login-email"
                  type="email"
                  bind:value={email}
                  placeholder="you@example.com"
                  class="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white font-mono outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label class="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2 block" for="login-password">Password</label>
              <div class="relative">
                <Lock size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  id="login-password"
                  type="password"
                  bind:value={password}
                  placeholder="••••••••"
                  class="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white font-mono outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              class="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-mono hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-700/50"></div>
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="px-4 bg-gray-900/80 text-gray-600 font-mono">OR</span>
            </div>
          </div>

          <!-- Magic link -->
          <button
            onclick={handleMagicLink}
            disabled={sendingOtp}
            class="w-full py-3 border border-cyan-500/30 text-cyan-400 rounded-lg font-mono hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {#if sendingOtp}
              Sending...
            {:else}
              <Mail size={16} />
              Send Magic Link
            {/if}
          </button>
        {/if}

        <p class="text-center text-sm text-gray-500 font-mono mt-6">
          Don't have an account?{' '}
          <button onclick={navigateToSignup} class="text-cyan-400 hover:text-cyan-300 hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </div>
  </div>
</div>
