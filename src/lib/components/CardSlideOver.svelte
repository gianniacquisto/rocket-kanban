<script lang="ts">
  import { supabase } from '$lib/supabase/client'
  import { get } from 'svelte/store'
  import { selectedCard, slideOverOpen, currentBoard, currentUser } from '$lib/stores/app'
  import type { Card, Label } from '$lib/stores/app'
  import {
    X,
    Trash2,
    Calendar,
    Tag,
    List,
    GripVertical,
  } from '@lucide/svelte'
  import { fade, slide } from 'svelte/transition'

  let {
    card: _card,
  }: { card?: Card & { labels: Label[] } } = $props()

  const card = $derived(_card ?? get(selectedCard))
  const board = $derived(get(currentBoard))
  const authUser = $derived(get(currentUser))

  let title = $state('')
  let description = $state('')
  let dueDate = $state('')
  let labelColor = $state('#4ECDC4')
  let labelName = $state('')
  let showNewLabelForm = $state(false)
  let showLabels = $state(false)
  let cardLabels = $derived(card?.labels || [])

  $effect(() => {
    if (card) {
      title = card.title
      description = card.description || ''
      dueDate = card.due_date ? card.due_date.split('T')[0] : ''
    }
  })

  function close() {
    slideOverOpen.set(false)
    selectedCard.set(null)
  }

  async function saveCard() {
    if (!card) return
    const { error } = await supabase
      .from('cards')
      .update({ title, description, due_date: dueDate || null })
      .eq('id', card.id)
      .select()
      .single()

    if (error) {
      alert(`Failed to save card: ${error.message}`)
      return
    }

    // Sync local state after successful save
    const board = get(currentBoard)
    if (board) {
      lists = board.lists.map(l => ({
        ...l,
        cards: l.cards.map(c =>
          c.id === card.id
            ? { ...c, title, description, due_date: dueDate || null }
            : c
        ),
      }))
      currentBoard.set({ board: board.board, lists })
      selectedCard.set({ ...card, title, description, due_date: dueDate || null })
    }
  }

  async function deleteCard() {
    if (!card) return
    if (!confirm('Delete this card?')) return

    const { error } = await supabase.from('cards').delete().eq('id', card.id)
    if (error) {
      alert(`Failed to delete card: ${error.message}`)
      return
    }

    // Remove from local state
    const board = get(currentBoard)
    if (board) {
      lists = board.lists.map(l => ({
        ...l,
        cards: l.cards.filter((c: any) => c.id !== card.id),
      }))
      currentBoard.set({ board: board.board, lists })
    }
    close()
  }

  async function addLabel() {
    if (!labelName.trim() || !board || !authUser) return

    const { data: labelData, error: labelError } = await supabase
      .from('labels')
      .insert({
        name: labelName.trim(),
        color: labelColor,
        board_id: board.board.id,
        owner_id: authUser.id,
      })
      .select()
      .single()

    if (labelError) {
      alert(`Failed to create label: ${labelError.message}`)
      return
    }

    if (labelData && card) {
      const { error: joinError } = await supabase.from('card_labels').insert({
        card_id: card.id,
        label_id: labelData.id,
      })

      if (joinError) {
        alert(`Failed to add label to card: ${joinError.message}`)
        return
      }

      // Update the card with the new label
      const updatedLabels = [...card.labels, labelData]
      selectedCard.set({ ...card, labels: updatedLabels })

      // Also update in the board lists
      const currentBoardData = get(currentBoard)
      if (currentBoardData) {
        lists = currentBoardData.lists.map(l => ({
          ...l,
          cards: l.cards.map((c: any) =>
            c.id === card.id ? { ...c, labels: updatedLabels } : c
          ),
        }))
        currentBoard.set({ board: currentBoardData.board, lists })
      }

      showNewLabelForm = false
    }
  }

  async function removeLabel(labelId: string) {
    if (!card) return
    const { error } = await supabase
      .from('card_labels')
      .delete()
      .eq('card_id', card.id)
      .eq('label_id', labelId)

    if (error) {
      alert(`Failed to remove label: ${error.message}`)
      return
    }

    const updatedLabels = cardLabels.filter(l => l.id !== labelId)
    const updatedCard = { ...card, labels: updatedLabels }
    selectedCard.set(updatedCard)

    // Update in the board lists
    const currentBoardData = get(currentBoard)
    if (currentBoardData) {
      lists = currentBoardData.lists.map(l => ({
        ...l,
        cards: l.cards.map((c: any) =>
          c.id === card.id ? { ...c, labels: updatedLabels } : c
        ),
      }))
      currentBoard.set({ board: currentBoardData.board, lists })
    }
  }
</script>

{#if card && $slideOverOpen}
  <div
    transition:slide="{{ duration: 300, axis: 'y' }}"
    class="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-gray-900/95 backdrop-blur-xl border-l border-cyan-500/20 shadow-2xl shadow-cyan-500/10 z-50 overflow-y-auto"
  >
    <!-- Header -->
    <div class="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/30 p-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <GripVertical size={16} class="text-gray-600" />
        <span class="text-xs font-mono text-cyan-400 uppercase tracking-widest">Card Details</span>
      </div>
      <button
        onclick={close}
        class="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
      >
        <X size={20} />
      </button>
    </div>

    <div class="p-4 space-y-6">
      <!-- Title -->
      <div>
        <label class="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2 block" for="card-title">Title</label>
        <input
          id="card-title"
          bind:value={title}
          onblur={saveCard}
          class="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-lg text-white font-mono outline-none focus:border-cyan-500/50 transition-colors"
          placeholder="Card title..."
        />
      </div>

      <!-- Description -->
      <div>
        <label class="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2 block flex items-center gap-2">
          <List size={14} /> Description
        </label>
        <textarea
          bind:value={description}
          onblur={saveCard}
          class="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 font-mono resize-none outline-none focus:border-cyan-500/50 transition-colors min-h-[120px]"
          placeholder="Add a more detailed description..."
        ></textarea>
      </div>

      <!-- Due Date -->
      <div>
        <label class="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2 block flex items-center gap-2">
          <Calendar size={14} /> Due Date
        </label>
        <input
          type="date"
          bind:value={dueDate}
          onchange={saveCard}
          class="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 font-mono outline-none focus:border-cyan-500/50 transition-colors"
        />
      </div>

      <!-- Labels -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Tag size={14} /> Labels
          </label>
          <button
            onclick={() => showNewLabelForm = !showNewLabelForm}
            class="text-xs text-cyan-400 font-mono hover:text-cyan-300"
          >
            + Add Label
          </button>
        </div>

        {#if showNewLabelForm}
          <div class="flex gap-2 mb-2">
            <input
              bind:value={labelName}
              placeholder="Label name"
              class="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 font-mono outline-none focus:border-cyan-500/50"
            />
            <input
              type="color"
              bind:value={labelColor}
              class="w-10 h-9 rounded-lg cursor-pointer bg-transparent"
            />
            <button
              onclick={addLabel}
              class="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-xs text-cyan-400 font-mono hover:bg-cyan-500/30"
            >
              Add
            </button>
          </div>
        {/if}

        <div class="flex flex-wrap gap-2">
          {#each cardLabels as label (label.id)}
            <div class="flex items-center gap-2">
              <div
                class="h-6 w-8 rounded-md cursor-pointer"
                style="background-color: {label.color}"
                title={label.name}
              ></div>
              <span class="text-xs font-mono text-gray-400">{label.name}</span>
              <button
                onclick={() => removeLabel(label.id)}
                class="text-gray-600 hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          {/each}
        </div>
      </div>

      <!-- Danger zone -->
      <div class="pt-4 border-t border-gray-700/30">
        <button
          onclick={deleteCard}
          class="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 rounded-lg text-sm font-mono hover:bg-red-500/10 transition-all"
        >
          <Trash2 size={16} />
          Delete Card
        </button>
      </div>
    </div>
  </div>

  <!-- Backdrop -->
  <div
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === 'Escape' && close()}
    transition:fade="{{ duration: 200 }}"
    onclick={close}
    class="fixed inset-0 bg-black/50 z-40"
  ></div>
{/if}
