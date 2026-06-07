import { writable } from 'svelte/store'
import type { Database } from '$lib/supabase/database.types'

export type Board = Database['public']['Tables']['boards']['Row']
export type List = Database['public']['Tables']['lists']['Row']
export type Card = Database['public']['Tables']['cards']['Row']
export type Label = Database['public']['Tables']['labels']['Row']
export type CardLabel = Database['public']['Tables']['card_labels']['Row']

export interface BoardWithLists {
  board: Board
  lists: (List & { cards: Card[] })[]
}

// Auth state
export const currentUser = writable<null | { id: string; email: string } | null>(null)
export const isAuthenticated = writable(false)

// Board state
export const currentBoard = writable<BoardWithLists | null>(null)
export const sidebarOpen = writable(true)
export const slideOverOpen = writable(false)
export const selectedCard = writable<Card & { labels: Label[] } | null>(null)

// UI state
export const editingListId = writable<string | null>(null)
export const editingCardId = writable<string | null>(null)
export const newCardListId = writable<string | null>(null)
export const newBoardName = writable('')

// Drag and drop state
export const isDragging = writable(false)
