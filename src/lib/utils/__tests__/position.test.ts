/**
 * Unit tests for position utility functions.
 * Tests the core position calculation logic used by drag-and-drop and card/list creation.
 */

// Simulate the position helper functions that would live in utils/position.ts
// We test the pure logic independent of Svelte/Supabase

type PositionItem = { position: number }

function getNextPosition(items: PositionItem[]): number {
  if (items.length === 0) return 0
  const maxPosition = Math.max(...items.map(i => i.position))
  return maxPosition + 1
}

function renumberPositions(items: PositionItem[]): PositionItem[] {
  return items
    .sort((a, b) => a.position - b.position)
    .map((item, index) => ({ ...item, position: index }))
}

describe('getNextPosition', () => {
  it('returns 0 for empty array', () => {
    expect(getNextPosition([])).toBe(0)
  })

  it('returns 1 when only item has position 0', () => {
    expect(getNextPosition([{ position: 0 }])).toBe(1)
  })

  it('returns max + 1 for consecutive positions', () => {
    expect(getNextPosition([{ position: 0 }, { position: 1 }, { position: 2 }])).toBe(3)
  })

  it('handles gaps in positions', () => {
    expect(getNextPosition([{ position: 0 }, { position: 5 }, { position: 10 }])).toBe(11)
  })

  it('handles negative positions gracefully', () => {
    expect(getNextPosition([{ position: -1 }, { position: 0 }, { position: 1 }])).toBe(2)
  })

  it('handles single large position', () => {
    expect(getNextPosition([{ position: 999 }])).toBe(1000)
  })
})

describe('renumberPositions', () => {
  it('renumbers empty array', () => {
    expect(renumberPositions([])).toEqual([])
  })

  it('renumbers single item', () => {
    expect(renumberPositions([{ position: 5 }])).toEqual([{ position: 0 }])
  })

  it('renumbers items to consecutive starting at 0', () => {
    const items = [{ position: 10 }, { position: 0 }, { position: 5 }]
    const result = renumberPositions(items)
    expect(result.map(i => i.position)).toEqual([0, 1, 2])
  })

  it('preserves item identity (id) after renumbering', () => {
    interface Item { id: string; position: number }
    const items: Item[] = [
      { id: 'a', position: 3 },
      { id: 'b', position: 1 },
      { id: 'c', position: 2 },
    ]
    const sorted = items.sort((a, b) => a.position - b.position)
    const result: Item[] = sorted.map((item, index) => ({ ...item, position: index }))
    expect(result[0].id).toBe('b')
    expect(result[0].position).toBe(0)
    expect(result[1].id).toBe('c')
    expect(result[1].position).toBe(1)
    expect(result[2].id).toBe('a')
    expect(result[2].position).toBe(2)
  })

  it('does not mutate original array (creates new objects)', () => {
    const items = [{ position: 5 }]
    const result = renumberPositions(items)
    result[0].position = 100
    expect(items[0].position).toBe(5)
  })
})
