import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"
import { createNotification } from "@/app/api/admin/send-notification/route"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const completionId = parseInt(id)
    if (isNaN(completionId) || completionId <= 0) {
      return NextResponse.json({ error: "Invalid completion ID" }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get("screenshot") as File

    if (!file) return NextResponse.json({ error: "Screenshot required" }, { status: 400 })
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files allowed" }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File too large. Max 5MB" }, { status: 400 })

    // Verify completion belongs to this user and is not already verified
    const { data: completion, error: compError } = await (supabaseAdmin as any)
      .from("task_completions")
      .select("*, tasks(title)")
      .eq("id", completionId)
      .eq("user_id", session.userId)
      .single()

    if (compError || !completion) {
      return NextResponse.json({ error: "Completion not found" }, { status: 404 })
    }

    if (completion.status === "verified") {
      return NextResponse.json({ error: "Already verified" }, { status: 400 })
    }

    // Upload file
    const fileExt = file.name.split(".").pop() || "jpg"
    const fileName = `proof_${completionId}_${session.userId}_${Date.now()}.${fileExt}`
    const fileBuffer = await file.arrayBuffer()

    const { error: uploadError } = await (supabaseAdmin as any)
      .storage
      .from("task-proofs")
      .upload(fileName, fileBuffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload screenshot" }, { status: 500 })
    }

    const { data: urlData } = (supabaseAdmin as any)
      .storage
      .from("task-proofs")
      .getPublicUrl(fileName)

    const proofUrl = urlData?.publicUrl || fileName

    // Update completion with proof
    const { error: updateError } = await (supabaseAdmin as any)
      .from("task_completions")
      .update({
        completion_proof: proofUrl,
        status: "pending_verification",
        updated_at: new Date().toISOString()
      })
      .eq("id", completionId)

    if (updateError) throw updateError

    // ── Notify all admins that a new proof is waiting ──
    const taskTitle = completion.tasks?.title || "a task"

    const { data: admins } = await (supabaseAdmin as any)
      .from("users")
      .select("id")
      .eq("is_admin", true)

    if (admins?.length) {
      await Promise.allSettled(
        admins.map((admin: any) =>
          createNotification({
            userId: admin.id,
            title: "New Proof Submitted 📸",
            body: `User #${session.userId} submitted proof for "${taskTitle}". Review it now.`,
            type: 'info',
            actionUrl: '/admin/proofs',
          })
        )
      )
    }

    return NextResponse.json({
      success: true,
      message: "Screenshot uploaded. Admin will verify within 24 hours.",
      proof_url: proofUrl
    })

  } catch (error) {
    console.error("Error uploading proof:", error)
    return NextResponse.json({ error: "Failed to upload proof" }, { status: 500 })
  }
}