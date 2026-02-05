import { Resend } from "resend"

const RESEND_API_KEY = process.env.RESEND_API_KEY

if (!RESEND_API_KEY) {
  console.warn("⚠️ RESEND_API_KEY is not set in environment variables. Email functionality will not work.")
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

const FROM_EMAIL = "QrBot <onboarding@resend.dev>" // Change this to your verified domain later
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// Send email verification
export async function sendVerificationEmail(email: string, token: string, displayName?: string) {
  if (!resend) {
    console.error("❌ Cannot send verification email: Resend API key not configured")
    throw new Error("Email service not configured")
  }
  
  const verificationUrl = `${APP_URL}/auth/verify-email?token=${token}`
  
  try {
    console.log(`📧 Sending verification email to: ${email}`)
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify your QrBot account",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">QrBot</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Welcome${displayName ? `, ${displayName}` : ""}!</h2>
              <p>Thank you for signing up for QrBot. Please verify your email address to complete your registration.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email Address</a>
              </div>
              <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="color: #667eea; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
              <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} QrBot. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("❌ Error sending verification email:", error)
      throw error
    }

    console.log(`✅ Verification email sent successfully to: ${email}`)
    return data
  } catch (error) {
    console.error("❌ Failed to send verification email:", error)
    throw error
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, token: string, displayName?: string) {
  if (!resend) {
    console.error("❌ Cannot send password reset email: Resend API key not configured")
    throw new Error("Email service not configured")
  }
  
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`
  
  try {
    console.log(`📧 Sending password reset email to: ${email}`)
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset your QrBot password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">QrBot</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
              <p>Hello${displayName ? ` ${displayName}` : ""},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
              </div>
              <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="color: #667eea; font-size: 12px; word-break: break-all;">${resetUrl}</p>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour.</p>
              <p style="color: #d32f2f; font-size: 14px; font-weight: bold;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} QrBot. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("❌ Error sending password reset email:", error)
      throw error
    }

    console.log(`✅ Password reset email sent successfully to: ${email}`)
    return data
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error)
    throw error
  }
}

// Send task completion notification
export async function sendTaskCompletionEmail(
  email: string,
  taskTitle: string,
  amount: number | string,
  displayName?: string
) {
  if (!resend) {
    console.error("❌ Cannot send task completion email: Resend API key not configured")
    throw new Error("Email service not configured")
  }
  
  try {
    // Convert amount to number if it's a string (MySQL DECIMAL returns as string)
    const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount
    const formattedAmount = isNaN(amountNum) ? '0.00' : amountNum.toFixed(2)
    
    console.log(`📧 Sending task completion email to: ${email}`)
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Task Completed: ${taskTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">QrBot</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Task Completed! 🎉</h2>
              <p>Hello${displayName ? ` ${displayName}` : ""},</p>
              <p>Great news! Your task completion has been verified:</p>
              <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">${taskTitle}</p>
                <p style="margin: 10px 0 0 0; font-size: 24px; color: #667eea; font-weight: bold;">₹${formattedAmount}</p>
              </div>
              <p>The amount has been added to your earnings. You can view your balance and request a payout from your dashboard.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Dashboard</a>
              </div>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} QrBot. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("❌ Error sending task completion email:", error)
      throw error
    }

    console.log(`✅ Task completion email sent successfully to: ${email}`)
    return data
  } catch (error) {
    console.error("❌ Failed to send task completion email:", error)
    throw error
  }
}

// Send payment confirmation email
export async function sendPaymentConfirmationEmail(
  email: string,
  amount: number | string,
  upiId: string,
  transactionId?: string,
  displayName?: string
) {
  if (!resend) {
    console.error("❌ Cannot send payment confirmation email: Resend API key not configured")
    throw new Error("Email service not configured")
  }
  
  try {
    // Convert amount to number if it's a string
    const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount
    const formattedAmount = isNaN(amountNum) ? '0.00' : amountNum.toFixed(2)
    
    console.log(`📧 Sending payment confirmation email to: ${email}`)
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Payment Request Processed",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">QrBot</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Payment Processed ✅</h2>
              <p>Hello${displayName ? ` ${displayName}` : ""},</p>
              <p>Your payment request has been processed:</p>
              <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
                <p style="margin: 0; color: #666;">Amount</p>
                <p style="margin: 5px 0; font-size: 24px; color: #667eea; font-weight: bold;">₹${formattedAmount}</p>
                <p style="margin: 15px 0 0 0; color: #666;">UPI ID</p>
                <p style="margin: 5px 0; font-size: 16px; color: #333; font-weight: bold;">${upiId}</p>
                ${transactionId ? `<p style="margin: 15px 0 0 0; color: #666;">Transaction ID</p><p style="margin: 5px 0; font-size: 14px; color: #333; font-family: monospace;">${transactionId}</p>` : ""}
              </div>
              <p>The payment has been sent to your UPI ID. Please check your UPI app for confirmation.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Dashboard</a>
              </div>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} QrBot. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("❌ Error sending payment confirmation email:", error)
      throw error
    }

    console.log(`✅ Payment confirmation email sent successfully to: ${email}`)
    return data
  } catch (error) {
    console.error("❌ Failed to send payment confirmation email:", error)
    throw error
  }
}
