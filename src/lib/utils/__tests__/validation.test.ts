/**
 * Unit tests for validation utilities.
 * Tests form validation logic used across auth and card creation flows.
 *
 * These tests import directly from the production module to ensure
 * the actual code is tested, not a duplicate implementation.
 */
import {
  validateEmail,
  validatePassword,
  validateCardTitle,
  validateListName,
  validateBoardName,
} from '../validation'

describe('validateEmail', () => {
  it('rejects empty email', () => {
    expect(validateEmail('')).toBe('Email is required')
  })

  it('rejects whitespace-only email', () => {
    expect(validateEmail('   ')).toBe('Email is required')
  })

  it('rejects invalid email formats', () => {
    expect(validateEmail('notanemail')).toBe('Invalid email format')
    expect(validateEmail('@domain.com')).toBe('Invalid email format')
    expect(validateEmail('user@')).toBe('Invalid email format')
    expect(validateEmail('user domain.com')).toBe('Invalid email format')
  })

  it('accepts valid email formats', () => {
    expect(validateEmail('user@example.com')).toBeNull()
    expect(validateEmail('user.name@domain.org')).toBeNull()
    expect(validateEmail('user+tag@domain.co.uk')).toBeNull()
  })
})

describe('validatePassword', () => {
  it('rejects empty password', () => {
    expect(validatePassword('')).toBe('Password is required')
  })

  it('rejects short passwords', () => {
    expect(validatePassword('abc')).toBe('Password must be at least 6 characters')
    expect(validatePassword('12345')).toBe('Password must be at least 6 characters')
  })

  it('accepts passwords with 6+ characters', () => {
    expect(validatePassword('123456')).toBeNull()
    expect(validatePassword('password123')).toBeNull()
    expect(validatePassword('Str0ng!Pass')).toBeNull()
  })
})

describe('validateCardTitle', () => {
  it('rejects empty title', () => {
    expect(validateCardTitle('')).toBe('Title is required')
  })

  it('rejects whitespace-only title', () => {
    expect(validateCardTitle('   ')).toBe('Title is required')
  })

  it('rejects titles over 200 characters', () => {
    expect(validateCardTitle('a'.repeat(201))).toBe('Title must be 200 characters or less')
  })

  it('accepts valid titles', () => {
    expect(validateCardTitle('Buy groceries')).toBeNull()
    expect(validateCardTitle('a')).toBeNull()
    expect(validateCardTitle('a'.repeat(200))).toBeNull()
  })
})

describe('validateListName', () => {
  it('rejects empty list name', () => {
    expect(validateListName('')).toBe('List name is required')
  })

  it('rejects whitespace-only name', () => {
    expect(validateListName('  ')).toBe('List name is required')
  })

  it('rejects names over 50 characters', () => {
    expect(validateListName('a'.repeat(51))).toBe('List name must be 50 characters or less')
  })

  it('accepts valid list names', () => {
    expect(validateListName('To Do')).toBeNull()
    expect(validateListName('a'.repeat(50))).toBeNull()
  })
})

describe('validateBoardName', () => {
  it('rejects empty board name', () => {
    expect(validateBoardName('')).toBe('Board name is required')
  })

  it('rejects names over 100 characters', () => {
    expect(validateBoardName('a'.repeat(101))).toBe('Board name must be 100 characters or less')
  })

  it('accepts valid board names', () => {
    expect(validateBoardName('My Board')).toBeNull()
    expect(validateBoardName('a'.repeat(100))).toBeNull()
  })
})

describe('combined validation', () => {
  it('validates signup form correctly', () => {
    const signupData = { email: 'test@example.com', password: 'secure123', name: 'Test User' }
    const emailErr = validateEmail(signupData.email)
    const passErr = validatePassword(signupData.password)
    expect(emailErr).toBeNull()
    expect(passErr).toBeNull()
  })

  it('catches multiple validation errors', () => {
    const emailErr = validateEmail('')
    const passErr = validatePassword('123')
    expect(emailErr).toBe('Email is required')
    expect(passErr).toBe('Password must be at least 6 characters')
  })
})
