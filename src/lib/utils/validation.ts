/**
 * Form validation utilities used across auth and card/list creation flows.
 */

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) return 'Email is required'
  const trimmed = email.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) return 'Invalid email format'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  return null
}

export function validateCardTitle(title: string): string | null {
  if (!title.trim()) return 'Title is required'
  if (title.trim().length > 200) return 'Title must be 200 characters or less'
  return null
}

export function validateListName(name: string): string | null {
  if (!name.trim()) return 'List name is required'
  if (name.trim().length > 50) return 'List name must be 50 characters or less'
  return null
}

export function validateBoardName(name: string): string | null {
  if (!name.trim()) return 'Board name is required'
  if (name.trim().length > 100) return 'Board name must be 100 characters or less'
  return null
}
