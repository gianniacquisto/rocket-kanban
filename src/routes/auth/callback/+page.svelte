<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase } from '$lib/supabase/client'
  import { currentUser, isAuthenticated } from '$lib/stores/app'
  import StarfieldBg from '$lib/components/StarfieldBg.svelte'

  let message = 'Processing login...'

  onMount(async () => {
    message = 'Verifying your session...'

    const session = await supabase.auth.getSession()

    if (session.data.session) {
      currentUser.set({
        id: session.data.session.user.id,
        email: session.data.session.user.email || '',
      })
      isAuthenticated.set(true)

      message = 'Loading your boards...'

      // Get user's boards and redirect to the first one
      const { data: boards } = await supabase
        .from('boards')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)

      if (boards && boards.length > 0) {
        window.location.href = `/board/${boards[0].id}`
      } else {
        // No boards yet, go to home page to create one
        window.location.href = '/'
      }
    } else {
      message = 'Login failed. Please try again.'
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    }
  })
</script>

<div class="relative min-h-screen w-full overflow-hidden">
  <StarfieldBg />
  <div class="relative z-10 flex flex-col items-center justify-center min-h-screen">
    <div class="text-5xl mb-6 animate-bounce">🚀</div>
    <p class="text-white font-mono text-lg">{message}</p>
  </div>
</div>
