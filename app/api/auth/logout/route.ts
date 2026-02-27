import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete("auth_session")
  return response
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`
  const response = NextResponse.redirect(`${baseUrl}/auth/login`)
  response.cookies.delete("auth_session")
  return response
}