<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase } from '$lib/supabase/client'
  import { currentUser } from '$lib/stores/app'
  import StarfieldBg from '$lib/components/StarfieldBg.svelte'

  let message = $state('Loading...')

  onMount(async () => {
    const user = $currentUser
    if (!user) {
      window.location.href = '/login'
      return
    }

    message = 'Finding your board...'

    const { data: boards } = await supabase
      .from('boards')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)

    if (boards && boards.length > 0) {
      window.location.href = `/board/${boards[0].id}`
    } else {
      message = 'No boards yet. Creating your first board...'
      // Create default board
      const { data: newBoard, error: boardError } = await supabase
        .from('boards')
        .insert({ name: 'My Board', owner_id: user.id, icon: '🚀' })
        .select()
        .single()

      if (boardError) {
        message = `Error creating board: ${boardError.message}`
        return
      }

      if (newBoard) {
        message = 'Setting up your board...'
        // Create default lists
        const { error: listError } = await supabase.from('lists').insert([
          { name: 'To Do', board_id: newBoard.id, position: 0 },
          { name: 'In Progress', board_id: newBoard.id, position: 1 },
          { name: 'Done', board_id: newBoard.id, position: 2 },
        ])

        if (listError) {
          message = `Error creating lists: ${listError.message}`
          return
        }

        window.location.href = `/board/${newBoard.id}`
      } else {
        message = 'Something went wrong. Please refresh.'
      }
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
