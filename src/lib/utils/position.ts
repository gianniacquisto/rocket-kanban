/**
 * Position utilities for drag-and-drop and list/card ordering.
 */

/**
 * Calculate the next position value for a new item in a sorted list.
 * Uses the max existing position + 1 to avoid gaps.
 */
export function getNextPosition(items: { position: number }[]): number {
  if (items.length === 0) return 0
  const maxPosition = Math.max(...items.map((item) => item.position))
  return maxPosition + 1
}

/**
 * Renumber a list of items to have consecutive positions starting at 0,
 * sorted by their current position. Returns new objects (does not mutate).
 */
export function renumberPositions<T extends { position: number }>(
  items: T[],
): T[] {
  const sorted = [...items].sort((a, b) => a.position - b.position)
  return sorted.map((item, index) => ({ ...item, position: index }))
}
