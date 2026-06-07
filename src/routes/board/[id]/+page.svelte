<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import { supabase } from '$lib/supabase/client'
  import {
    currentBoard,
    currentUser,
    sidebarOpen,
    selectedCard,
    slideOverOpen,
  } from '$lib/stores/app'
  import StarfieldBg from '$lib/components/StarfieldBg.svelte'
  import BoardSidebar from '$lib/components/BoardSidebar.svelte'
  import CardSlideOver from '$lib/components/CardSlideOver.svelte'
  import List from '$lib/components/List.svelte'
  import RocketLaunch from '$lib/components/RocketLaunch.svelte'
  import {
    PanelLeft,
    Settings,
    Search,
    Bell,
    Plus,
  } from '@lucide/svelte'

  let boardName = $state('')
  let lists = $state<any[]>([])
  let loading = $state(true)
  let rocketShow = $state(false)
  let editingBoardName = $state(false)

  // Load initial board
  async function loadBoard(boardId: string) {
    loading = true

    const { data: boardData } = await supabase
      .from('boards')
      .select('*')
      .eq('id', boardId)
      .single()

    if (!boardData) {
      loading = false
      return
    }

    // Get lists with cards and labels
    const { data: listsData } = await supabase
      .from('lists')
      .select(`
        *,
        cards (
          *,
          card_labels (
            label_id,
            labels (*)
          )
        )
      `)
      .eq('board_id', boardId)
      .order('position')

    if (listsData) {
      lists = listsData.map((list: any) => ({
        ...list,
        cards: (list.cards || []).map((card: any) => ({
          ...card,
          labels: (card.card_labels || []).map((cl: any) => cl.labels),
        })),
      }))
    }

    boardName = boardData.name

    currentBoard.set({
      board: boardData,
      lists,
    })

    loading = false
  }

  async function saveBoardName() {
    const b = get(currentBoard)
    if (!b) return
    await supabase
      .from('boards')
      .update({ name: boardName })
      .eq('id', b.board.id)
    editingBoardName = false
    currentBoard.set({ ...b, board: { ...b.board, name: boardName } })
  }

  // Handle list updates
  async function handleUpdateList(e: CustomEvent) {
    const { listId, name } = e.detail
    await supabase
      .from('lists')
      .update({ name })
      .eq('id', listId)

    lists = lists.map(l => l.id === listId ? { ...l, name } : l)
    currentBoard.set({
      board: get(currentBoard)!.board,
      lists,
    })
  }

  // Handle new card creation
  async function handleAddCard(e: CustomEvent) {
    const { listId, title } = e.detail
    const targetList = lists.find(l => l.id === listId)
    const position = targetList?.cards.length || 0

    const { data } = await supabase
      .from('cards')
      .insert({ title, list_id: listId, board_id: get(currentBoard)!.board.id, position })
      .select(`
        *,
        card_labels (
          label_id,
          labels (*)
        )
      `)
      .single()

    if (data) {
      const cardWithLabels = {
        ...data,
        labels: (data.card_labels || []).map((cl: any) => cl.labels),
      }

      lists = lists.map(l =>
        l.id === listId ? { ...l, cards: [...l.cards, cardWithLabels] } : l
      )

      currentBoard.set({
        board: get(currentBoard)!.board,
        lists,
      })
    }
  }

  // Handle card drop (move to different list)
  async function handleCardDrop(e: CustomEvent) {
    const { cardId, listId } = e.detail
    const targetList = lists.find(l => l.id === listId)

    if (!targetList) return

    // Find the card
    const allCards = lists.flatMap(l => l.cards)
    const card = allCards.find(c => c.id === cardId)
    if (!card) return

    const oldListId = card.list_id

    // Remove from old list
    lists = lists.map(l =>
      l.id === oldListId ? { ...l, cards: l.cards.filter((c: any) => c.id !== cardId) } : l
    )

    // Update position in new list
    const newPosition = targetList.cards.length
    await supabase
      .from('cards')
      .update({ list_id: listId, position: newPosition })
      .eq('id', cardId)

    // Update current state
    lists = lists.map(l =>
      l.id === listId ? { ...l, cards: [...l.cards, card] } : l
    )

    currentBoard.set({
      board: get(currentBoard)!.board,
      lists,
    })

    // Rocket launch when a list becomes complete
    const targetListAfter = lists.find(l => l.id === listId)?.cards.length || 0
    if (targetListAfter === 0 && targetList.name !== 'To Do') {
      rocketShow = true
      setTimeout(() => (rocketShow = false), 3000)
    }
  }

  // Handle list delete
  async function handleDeleteList(e: CustomEvent) {
    const { listId } = e.detail
    if (!confirm('Delete this list and all its cards?')) return

    await supabase.from('lists').delete().eq('id', listId)

    lists = lists.filter(l => l.id !== listId)
    currentBoard.set({
      board: get(currentBoard)!.board,
      lists,
    })
  }

  // Handle new list creation
  async function handleAddList() {
    const name = prompt('List name:') || 'New List'
    const position = lists.length

    const { data } = await supabase
      .from('lists')
      .insert({ name, board_id: get(currentBoard)!.board.id, position })
      .select()
      .single()

    if (data) {
      lists = [...lists, { ...data, cards: [] }]
      currentBoard.set({
        board: get(currentBoard)!.board,
        lists,
      })
    }
  }

  // Redirect if not logged in
  $effect(() => {
    if (!get(currentUser) && !loading) {
      window.location.href = '/login'
    }
  })

  // Load board when user exists
  $effect(() => {
    if (get(currentUser) && !loading) {
      const url = new URL(window.location.href)
      const boardId = url.pathname.split('/board/')[1]
      if (boardId) loadBoard(boardId)
    }
  })

  // Subscribe to auth changes
  onMount(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        currentUser.set({ id: session.user.id, email: session.user.email || '' })
      } else {
        currentUser.set(null)
      }
    })
  })
</script>

<svelte:head>
  <title>Kanban - {boardName || 'Board'}</title>
</svelte:head>

<div class="relative h-screen w-screen overflow-hidden">
  <!-- Background -->
  <StarfieldBg />

  <!-- Main layout -->
  <div class="relative flex h-full z-10">
    <!-- Sidebar -->
    <BoardSidebar />

    <!-- Expand sidebar button -->
    {#if !$sidebarOpen}
      <button
        onclick={() => sidebarOpen.set(true)}
        class="fixed top-4 left-4 p-2 bg-gray-900/80 backdrop-blur-md border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-all z-50"
      >
        <PanelLeft size={20} />
      </button>
    {/if}

    <!-- Board content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top bar -->
      <header class="flex items-center justify-between px-6 py-4 border-b border-gray-700/30 bg-gray-900/50 backdrop-blur-md">
        <div class="flex items-center gap-4">
          {#if editingBoardName}
            <input
              bind:value={boardName}
              onblur={saveBoardName}
              onkeydown={(e) => e.key === 'Enter' && saveBoardName()}
              class="bg-gray-800 border border-cyan-500/50 rounded-lg px-3 py-1.5 text-lg text-white font-mono outline-none"
              autofocus
            />
          {:else}
            <h1
              onclick={() => { editingBoardName = true }}
              class="text-xl font-mono text-white hover:text-cyan-400 cursor-pointer transition-colors flex items-center gap-2"
            >
              {get(currentBoard)?.board.icon || '🚀'} {boardName}
              <Settings size={16} class="text-gray-600" />
            </h1>
          {/if}
        </div>

        <div class="flex items-center gap-3">
          <button class="p-2 text-gray-500 hover:text-cyan-400 transition-colors">
            <Search size={18} />
          </button>
          <button class="p-2 text-gray-500 hover:text-cyan-400 transition-colors relative">
            <Bell size={18} />
            <span class="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full" />
          </button>
        </div>
      </header>

      <!-- Board area -->
      <main class="flex-1 overflow-x-auto overflow-y-hidden">
        {#if loading}
          <div class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="text-4xl mb-4 animate-bounce">🚀</div>
              <p class="text-gray-500 font-mono text-sm">Loading board...</p>
            </div>
          </div>
        {:else}
          <div class="flex items-start gap-4 p-6 h-full min-w-max">
            {#each lists as list (list.id)}
              <List
                list={list}
                cards={list.cards}
                on:update-list={handleUpdateList}
                on:add-card={handleAddCard}
                on:card-dropped={handleCardDrop}
                on:delete-list={handleDeleteList}
              />
            {/each}

            <!-- Add list -->
            <button
              onclick={handleAddList}
              class="flex flex-col items-center justify-center w-72 min-h-[120px] bg-gray-800/30 border border-dashed border-gray-600/50 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-gray-500 hover:text-cyan-400 font-mono"
            >
              <Plus size={24} class="mb-2" />
              <span class="text-sm">Add another list</span>
            </button>
          </div>
        {/if}
      </main>
    </div>
  </div>

  <!-- Slide-over panel -->
  <CardSlideOver />

  <!-- Rocket celebration -->
  {#if rocketShow}
    <RocketLaunch show={rocketShow} />
  {/if}
</div>
