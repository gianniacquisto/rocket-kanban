<script lang="ts">
  import { supabase } from '$lib/supabase/client'
  import { currentBoard, sidebarOpen, currentUser } from '$lib/stores/app'
  import type { Board } from '$lib/stores/app'
  import {
    PanelLeft,
    Plus,
    Trash2,
    Edit3,
    Check,
    X,
    Rocket,
  } from '@lucide/svelte'
  import { slide, fade } from 'svelte/transition'

  let boards: Board[] = $state([])
  let loading = $state(true)
  let showDeleteConfirm = $state(false)
  let showRenameForm = $state(false)
  let renameValue = $state('')
  let renameBoardId = $state('')
  let deletingBoardId = $state('')
  let creating = $state(false)
  let renameInputRef: HTMLInputElement | undefined

  $effect(() => {
    if (showRenameForm && renameInputRef) {
      renameInputRef.focus()
      renameInputRef.select()
    }
  })

  async function loadBoards() {
    const user = $currentUser
    if (!user) return
    loading = true
    const result = await supabase
      .from('boards')
      .select('*')
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false })
    if (!result.error && result.data) {
      boards = result.data
    }
    loading = false
  }

  async function createBoard() {
    const user = $currentUser
    if (!user) return
    creating = true
    const name = prompt('Board name:') || 'My Board'
    const trimmedName = name.trim()
    if (!trimmedName) {
      creating = false
      return
    }

    const result = await supabase
      .from('boards')
      .insert({ name: trimmedName, owner_id: user.id, icon: '🚀' })
      .select()
      .single()

    if (result.error) {
      alert(`Failed to create board: ${result.error.message}`)
      creating = false
      return
    }

    const boardData = result.data
    if (boardData) {
      const { error: listError } = await supabase.from('lists').insert([
        { name: 'To Do', board_id: boardData.id, position: 0 },
        { name: 'In Progress', board_id: boardData.id, position: 1 },
        { name: 'Done', board_id: boardData.id, position: 2 },
      ])

      if (listError) {
        alert(`Failed to create default lists: ${listError.message}`)
      }

      await loadBoards()
      window.location.href = `/board/${boardData.id}`
    }
    creating = false
  }

  function selectBoard(boardId: string) {
    window.location.href = `/board/${boardId}`
  }

  async function deleteBoard(boardId: string) {
    if (!confirm('Delete this board and all its contents?')) return
    await supabase.from('boards').delete().eq('id', boardId)
    await loadBoards()
    showDeleteConfirm = false
  }

  function startRename(b: Board) {
    renameValue = b.name
    renameBoardId = b.id
    showRenameForm = true
  }

  async function saveRename(boardId: string) {
    if (!renameValue.trim()) return
    await supabase
      .from('boards')
      .update({ name: renameValue.trim() })
      .eq('id', boardId)
    showRenameForm = false
    renameBoardId = ''
    await loadBoards()
  }

  // Load boards when user changes
  $effect(() => {
    if ($currentUser) loadBoards()
  })
</script>

<div
  class="relative flex flex-col bg-gray-900/90 backdrop-blur-md border-r border-cyan-500/20 h-full"
  style="width: {sidebarOpen ? '240px' : '0px'}; min-width: {sidebarOpen ? '240px' : '0px'}"
  class:overflow-hidden={sidebarOpen}
  transition:slide="{{ duration: 200 }}"
>
  <!-- Header -->
  <div class="p-4 border-b border-cyan-500/20">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xs font-mono text-cyan-400 tracking-widest uppercase">
        Boards
      </h2>
      <button
        onclick={() => sidebarOpen.set(false)}
        class="p-1 text-gray-500 hover:text-cyan-400 transition-colors"
      >
        <PanelLeft size={16} />
      </button>
    </div>

    <button
      onclick={createBoard}
      class="w-full py-2 px-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm font-mono hover:from-cyan-500/30 hover:to-purple-500/30 transition-all flex items-center justify-center gap-2"
    >
      <Plus size={16} />
      New Board
    </button>
  </div>

  <!-- Board list -->
  <div class="flex-1 overflow-y-auto p-2 space-y-1">
    {#if loading}
      <div class="text-center py-8 text-gray-600 font-mono text-xs">
        Loading...
      </div>
    {:else}
      {#each boards as b (b.id)}
        <div class="group relative">
          {#if showRenameForm && b.id === renameBoardId}
            <div class="flex items-center gap-1 p-1">
              <input
                bind:this={renameInputRef}
                bind:value={renameValue}
                onblur={() => saveRename(b.id)}
                onkeydown={(e) => e.key === 'Enter' && saveRename(b.id)}
                class="flex-1 bg-gray-800 border border-cyan-500/50 rounded px-2 py-1 text-xs text-white font-mono"
              />
              <button onclick={() => saveRename(b.id)} class="text-green-400 hover:text-green-300">
                <Check size={14} />
              </button>
              <button onclick={() => { showRenameForm = false; renameBoardId = '' }} class="text-red-400 hover:text-red-300">
                <X size={14} />
              </button>
            </div>
          {:else}
            <div
              role="button"
              tabindex="0"
              onclick={() => selectBoard(b.id)}
              onkeydown={(e) => e.key === 'Enter' && selectBoard(b.id)}
              class="w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-all group flex items-center gap-2 cursor-pointer"
              class:highlight={$currentBoard && $currentBoard.board.id === b.id}
            >
              <span class="text-base">{b.icon || '📋'}</span>
              <span class="truncate flex-1">{b.name}</span>
              <div class="opacity-0 group-hover:opacity-100 flex gap-1">
                <button
                  onclick={(e) => { e.stopPropagation(); startRename(b) }}
                  class="p-1 text-gray-500 hover:text-cyan-400 transition-colors"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onclick={(e) => {
                    e.stopPropagation()
                    deletingBoardId = b.id
                    showDeleteConfirm = true
                  }}
                  class="p-1 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          {/if}

          {#if showDeleteConfirm && b.id === deletingBoardId}
            <div
              class="absolute left-full top-0 ml-2 bg-gray-800 border border-red-500/50 rounded-lg p-3 w-48 z-50 shadow-xl shadow-red-500/10"
              transition:fade="{{ duration: 150 }}"
            >
              <p class="text-xs text-red-400 mb-2 font-mono">Delete board?</p>
              <div class="flex gap-2">
                <button
                  onclick={() => deleteBoard(b.id)}
                  class="flex-1 px-2 py-1 bg-red-500/20 border border-red-500/50 rounded text-xs text-red-400 font-mono hover:bg-red-500/30"
                >
                  Delete
                </button>
                <button
                  onclick={() => showDeleteConfirm = false}
                  class="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-400 font-mono hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/each}

      {#if boards.length === 0}
        <div class="text-center py-8">
          <Rocket size={32} class="mx-auto mb-2 text-gray-600" />
          <p class="text-xs text-gray-600 font-mono">No boards yet</p>
        </div>
      {/if}
    {/if}
  </div>

  <!-- Footer -->
  <div class="p-3 border-t border-cyan-500/20">
    <div class="text-[10px] font-mono text-gray-600 text-center">
      ROCKET KANBAN 🚀
    </div>
  </div>
</div>

<style>
  .highlight {
    background-color: rgba(6, 182, 212, 0.1);
  }
</style>
