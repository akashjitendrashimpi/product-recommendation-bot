export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email) && email.length <= 255
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' }
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password too long' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain an uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain a lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain a number' }
  }
  return { valid: true }
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[+]?[0-9]{10,15}$/
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''))
}

export function validateUpiId(upiId: string): boolean {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+$/
  return upiRegex.test(upiId) && upiId.length <= 100
}

export function sanitizeString(input: string, maxLength = 255): string {
  return input.trim().slice(0, maxLength).replace(/[<>"']/g, '')
}