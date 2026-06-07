<script lang="ts">
  import { selectedCard, slideOverOpen } from '$lib/stores/app'
  import type { Card, Label } from '$lib/stores/app'
  import { Calendar, Edit3 } from '@lucide/svelte'

  let {
    card,
    labels = [] as Label[],
    onEdit,
    onDelete,
    onDragStart,
    onDragEnd,
    isDragging = false,
  }: {
    card: Card
    labels?: Label[]
    onEdit: () => void
    onDelete?: () => void
    onDragStart: (e: DragEvent) => void
    onDragEnd: (e: DragEvent) => void
    isDragging?: boolean
  } = $props()

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return 'Overdue'
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    if (days <= 7) return `${days} days`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function selectCard() {
    selectedCard.set(card as Card & { labels: Label[] })
    slideOverOpen.set(true)
    onEdit()
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      selectCard()
    }
  }
</script>

<div
  role="button"
  tabindex="0"
  aria-label={`Card: ${card.title}`}
  draggable="true"
  ondragstart={(e) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', card.id)
      e.dataTransfer.effectAllowed = 'move'
    }
    onDragStart(e)
  }}
  ondragend={onDragEnd}
  onclick={selectCard}
  onkeydown={handleKeyDown}
  class="group bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-200 mb-2 relative text-left w-full"
  class:opacity-60={isDragging}
  class:scale-105={isDragging}
>
  <!-- Labels -->
  {#if labels.length > 0}
    <div class="flex gap-1 mb-2 flex-wrap">
      {#each labels as label (label.id)}
        <div
          class="h-2 w-6 rounded-sm"
          style="background-color: {label.color}"
          title={label.name}
        />
      {/each}
    </div>
  {/if}

  <!-- Title -->
  <h4 class="text-sm font-mono text-gray-200 group-hover:text-white transition-colors">
    {card.title}
  </h4>

  <!-- Meta -->
  <div class="flex items-center gap-2 mt-2 text-xs text-gray-500 font-mono">
    {#if card.due_date}
      <span class="flex items-center gap-1">
        <Calendar size={12} />
        {formatDate(card.due_date)}
      </span>
    {/if}
    {#if card.description && card.description.length > 0}
      <span class="flex items-center gap-1">
        <Edit3 size={12} />
      </span>
    {/if}
  </div>

  <!-- Hover actions - moved outside to avoid nested button -->
  <div
    class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
    role="group"
    aria-label="Card actions"
  >
    <button
      type="button"
      onclick={(e) => { e.stopPropagation(); onEdit() }}
      onkeydown={(e) => e.stopPropagation()}
      class="p-1 text-gray-500 hover:text-cyan-400 transition-colors rounded hover:bg-gray-700"
    >
      <Edit3 size={14} />
    </button>
  </div>
</div>
