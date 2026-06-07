<script lang="ts">
  import { supabase } from '$lib/supabase/client'
  import { currentUser, isAuthenticated } from '$lib/stores/app'
  import '../app.css'
  import { onMount } from 'svelte'

  onMount(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        currentUser.set({
          id: session.user.id,
          email: session.user.email || '',
        })
        isAuthenticated.set(true)
      }
    })

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        currentUser.set({
          id: session.user.id,
          email: session.user.email || '',
        })
        isAuthenticated.set(true)
      } else {
        currentUser.set(null)
        isAuthenticated.set(false)
      }
    })
  })
</script>

<slot />
