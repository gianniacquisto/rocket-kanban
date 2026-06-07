<script lang="ts">
  import Card from './Card.svelte'
  import {
    Plus,
    MoreVertical,
    Edit3,
    Trash2,
    GripVertical,
  } from '@lucide/svelte'
  import { createEventDispatcher } from 'svelte'

  let {
    list,
    cards = [],
  }: {
    list: any
    cards?: any[]
  } = $props()

  const dispatch = createEventDispatcher()

  let editing = $state(false)
  let editTitle = $state('')
  let showMenu = $state(false)
  let showNewCard = $state(false)
  let newCardTitle = $state('')
  let draggingOver = $state(false)
  let draggedCardId = $state('')

  function startEdit() {
    editTitle = list.name
    editing = true
  }

  function saveTitle() {
    if (!editTitle.trim()) return
    dispatch('update-list', { listId: list.id, name: editTitle.trim() })
    editing = false
  }

  function addCard() {
    if (!newCardTitle.trim()) return
    dispatch('add-card', { listId: list.id, title: newCardTitle.trim() })
    newCardTitle = ''
    showNewCard = false
  }

  function onCardDragStart(e: DragEvent, cardId: string) {
    draggedCardId = cardId
    draggingOver = false
  }

  function onCardDragOver(e: DragEvent) {
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    draggingOver = true
  }

  function onCardDragLeave() {
    draggingOver = false
  }

  function onCardDrop(e: DragEvent) {
    e.preventDefault()
    draggingOver = false
    dispatch('card-dropped', {
      cardId: draggedCardId,
      listId: list.id,
    })
  }

  function onCardDragEnd() {
    draggedCardId = ''
    draggingOver = false
  }

  function onCardEdit() {
    dispatch('edit-card')
  }

  function onCardDelete() {
    dispatch('delete-card')
  }
</script>

<div
  role="list"
  class={`flex flex-col bg-gray-900/60 backdrop-blur-sm rounded-xl border transition-all duration-200 ${
    draggingOver
      ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10 bg-cyan-500/5'
      : 'border-gray-700/30'
  }`}
  ondragover={onCardDragOver}
  ondragleave={onCardDragLeave}
  ondrop={onCardDrop}
  style="min-width: 280px; max-width: 280px; width: 280px"
>
  <!-- List header -->
  <div class="flex items-center justify-between p-3 border-b border-gray-700/30">
    {#if editing}
      <input
        bind:value={editTitle}
        onblur={saveTitle}
        onkeydown={(e) => e.key === 'Enter' && saveTitle()}
        class="flex-1 bg-gray-800 border border-cyan-500/50 rounded px-2 py-1 text-sm text-white font-mono outline-none"
        autofocus
      />
    {:else}
      <div role="button" tabindex="0" class="flex items-center gap-2 cursor-pointer group" onclick={startEdit} onkeydown={(e) => e.key === 'Enter' && startEdit()}>
        <GripVertical size={14} class="text-gray-600 group-hover:text-gray-400" />
          <h3 class="text-sm font-mono text-gray-300 group-hover:text-white transition-colors">
          {list.name}
        </h3>
        <span class="text-xs text-gray-600 font-mono">({cards.length})</span>
      </div>
    {/if}

    <div class="relative">
      <button
        onclick={() => showMenu = !showMenu}
        class="p-1 text-gray-600 hover:text-gray-300 transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      {#if showMenu}
        <div
          class="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-40 z-20"
        >
          <button
            onclick={() => { startEdit(); showMenu = false }}
            class="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-cyan-400 hover:bg-gray-700 font-mono flex items-center gap-2"
          >
            <Edit3 size={14} /> Rename
          </button>
          <button
            onclick={() => { dispatch('delete-list', { listId: list.id }); showMenu = false }}
            class="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-red-400 hover:bg-gray-700 font-mono flex items-center gap-2"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Cards -->
  <div class="flex-1 overflow-y-auto p-2 space-y-1 min-h-[60px]">
    {#each cards as card (card.id)}
      <Card
        card={card}
        labels={card.labels || []}
        onEdit={onCardEdit}
        onDelete={onCardDelete}
        onDragStart={(e: DragEvent) => onCardDragStart(e, card.id)}
        onDragEnd={onCardDragEnd}
        isDragging={draggedCardId === card.id}
      />
    {/each}
  </div>

  <!-- Add card -->
  <div class="p-2 border-t border-gray-700/30">
    {#if showNewCard}
      <div>
        <textarea
          bind:value={newCardTitle}
          onkeydown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addCard() }
            if (e.key === 'Escape') showNewCard = false
          }}
          placeholder="Enter card title..."
          class="w-full bg-gray-800/80 border border-gray-600 rounded-lg p-2 text-sm text-white font-mono resize-none outline-none focus:border-cyan-500/50 transition-colors"
          rows={2}
          autofocus
        ></textarea>
        <div class="flex items-center gap-2 mt-2">
          <button
            onclick={addCard}
            class="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-xs text-cyan-400 font-mono hover:bg-cyan-500/30"
          >
            Add Card
          </button>
          <button
            onclick={() => showNewCard = false}
            class="px-3 py-1 text-gray-500 text-xs font-mono hover:text-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    {:else}
      <button
        onclick={() => showNewCard = true}
        class="w-full py-2 flex items-center justify-center gap-2 text-gray-500 hover:text-cyan-400 font-mono text-sm transition-colors hover:bg-gray-800/30 rounded-lg"
      >
        <Plus size={16} />
        Add a card
      </button>
    {/if}
  </div>
</div>
