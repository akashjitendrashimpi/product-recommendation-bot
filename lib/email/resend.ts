// Email service disabled - Resend is not configured
// All email functions are no-ops that log and return null

export async function sendVerificationEmail(
  email: string,
  token: string,
  displayName?: string
) {
  console.log('[Email] Verification email skipped - Resend not configured', { email, displayName })
  return null
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  displayName?: string
) {
  console.log('[Email] Password reset email skipped - Resend not configured', { email, displayName })
  return null
}

export async function sendTaskCompletionEmail(
  email: string,
  taskTitle: string,
  amount: number | string,
  displayName?: string
) {
  console.log('[Email] Task completion email skipped - Resend not configured', { email, taskTitle, amount })
  return null
}

export async function sendPaymentConfirmationEmail(
  email: string,
  amount: number | string,
  upiId: string,
  transactionId?: string,
  displayName?: string
) {
  console.log('[Email] Payment confirmation email skipped - Resend not configured', { email, amount, upiId })
  return null
}
