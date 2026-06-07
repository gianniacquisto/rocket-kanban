<script lang="ts">
  import { supabase } from '$lib/supabase/client'
  import { currentUser, isAuthenticated } from '$lib/stores/app'
  import { User, LogOut } from '@lucide/svelte'

  let { mode = 'button' }: { mode?: 'button' | 'link' } = $props()

  const user = $derived($currentUser)
  const isAuth = $derived($isAuthenticated)

  async function handleEmailSignup() {
    const email = prompt('Enter your email:')
    if (email) {
      const password = prompt('Enter password:')
      if (password) {
        await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
      }
    }
  }

  async function handleEmailLogin() {
    const email = prompt('Enter your email:')
    if (email) {
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    currentUser.set(null)
    isAuthenticated.set(false)
  }
</script>

{#if !isAuth}
  <div class="flex gap-2">
    <button
      onclick={handleEmailSignup}
      class="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-mono text-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center gap-2"
    >
      <User size={16} />
      Sign Up
    </button>
    <button
      onclick={handleEmailLogin}
      class="px-4 py-2 border border-purple-500/50 text-purple-400 rounded-lg font-mono text-sm hover:bg-purple-500/10 transition-all duration-300"
    >
      Login
    </button>
  </div>
{:else}
  <div class="flex items-center gap-3">
    <span class="text-sm text-gray-400 font-mono hidden sm:block">
      {user?.email?.split('@')[0] || 'User'}
    </span>
    <button
      onclick={handleLogout}
      class="px-3 py-1.5 border border-red-500/30 text-red-400 rounded-lg text-xs hover:bg-red-500/10 transition-all duration-300 flex items-center gap-1"
    >
      <LogOut size={14} />
      <span class="hidden sm:inline">Logout</span>
    </button>
  </div>
{/if}
