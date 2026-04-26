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
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const completionId = parseInt(id)
    if (isNaN(completionId) || completionId <= 0)
      return NextResponse.json({ error: "Invalid completion ID" }, { status: 400 })

    const formData = await request.formData()
    const file = formData.get("screenshot") as File

    if (!file)
      return NextResponse.json({ error: "Screenshot required" }, { status: 400 })

    // ── Server-side MIME validation via magic bytes ─────────────────────────
    // Do NOT trust file.type — it comes from the client and can be spoofed.
    // Read the first 12 bytes and check against known image signatures.
    const headerBytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())

    const isJpeg = headerBytes[0] === 0xFF && headerBytes[1] === 0xD8 && headerBytes[2] === 0xFF
    const isPng  = headerBytes[0] === 0x89 && headerBytes[1] === 0x50 && headerBytes[2] === 0x4E && headerBytes[3] === 0x47
    const isWebp = headerBytes[8] === 0x57 && headerBytes[9] === 0x45 && headerBytes[10] === 0x42 && headerBytes[11] === 0x50
    const isGif  = headerBytes[0] === 0x47 && headerBytes[1] === 0x49 && headerBytes[2] === 0x46

    if (!isJpeg && !isPng && !isWebp && !isGif) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, WebP and GIF images are allowed." },
        { status: 400 }
      )
    }

    // Use a safe, server-determined extension based on actual magic bytes
    const mimeToExt: Record<string, string> = {}
    if (isJpeg) mimeToExt["ext"] = "jpg"
    else if (isPng) mimeToExt["ext"] = "png"
    else if (isWebp) mimeToExt["ext"] = "webp"
    else mimeToExt["ext"] = "gif"
    const safeExt = mimeToExt["ext"]

    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: "File too large. Max 5MB" }, { status: 400 })

    // Verify completion belongs to this user
    const { data: completion, error: compError } = await (supabaseAdmin as any)
      .from("task_completions")
      .select("*")
      .eq("id", completionId)
      .eq("user_id", session.userId)
      .single()

    if (compError || !completion)
      return NextResponse.json({ error: "Completion not found" }, { status: 404 })

    if (completion.status === "verified")
      return NextResponse.json({ error: "Already verified" }, { status: 400 })

    // Fetch task title separately — avoids join issues
    const { data: task } = await (supabaseAdmin as any)
      .from("tasks")
      .select("title")
      .eq("id", completion.task_id)
      .maybeSingle()

    const taskTitle = task?.title || "a task"

    // Upload file to Supabase storage
    // Upload file to Supabase storage
    const mimeToType: Record<string, string> = {
      jpg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif"
    }

    const fileName = `proof_${completionId}_${session.userId}_${Date.now()}.${safeExt}`
    const fileBuffer = await file.arrayBuffer()

    // ── Anti-Fraud: SHA-256 Image hashing ──────────────────────────────────
    // Calculate hash of the image content to prevent duplicate submissions
    const crypto = await import("crypto")
    const proofHash = crypto.createHash("sha256").update(Buffer.from(fileBuffer)).digest("hex")

    // Check for duplicate hashes in existing task completions
    // We only block if the identical image was already "verified" or is "pending_verification"
    const { data: duplicate } = await (supabaseAdmin as any)
      .from("task_completions")
      .select("id, status")
      .eq("proof_hash", proofHash)
      .in("status", ["verified", "pending_verification"])
      .neq("id", completionId) // Ignore current record
      .limit(1)
      .maybeSingle()

    if (duplicate) {
      return NextResponse.json(
        { error: "This screenshot has already been used. Please provide original proof." },
        { status: 400 }
      )
    }

    const { error: uploadError } = await (supabaseAdmin as any)
      .storage
      .from("task-proofs")
      .upload(fileName, fileBuffer, { contentType: mimeToType[safeExt], upsert: true })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload screenshot. Please try again." }, { status: 500 })
    }

    const { data: urlData } = (supabaseAdmin as any)
      .storage
      .from("task-proofs")
      .getPublicUrl(fileName)

    const proofUrl = urlData?.publicUrl || fileName

    // Update completion with hash and proof URL
    const { error: updateError } = await (supabaseAdmin as any)
      .from("task_completions")
      .update({
        completion_proof: proofUrl,
        proof_hash: proofHash,
        status: "pending_verification",
        updated_at: new Date().toISOString(),
      })
      .eq("id", completionId)

    if (updateError) throw updateError

    // Notify admins — fixed: added .select('id')
    try {
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
              body: `User submitted proof for "${taskTitle}". Review it now.`,
              type: "info",
              actionUrl: "/admin/proofs",
            })
          )
        )
      }
    } catch (notifError) {
      // Don't fail the upload if notification fails
      console.error("Notification error:", notifError)
    }

    return NextResponse.json({
      success: true,
      message: "Screenshot uploaded successfully. Admin will verify within 24 hours.",
      proof_url: proofUrl,
    })

  } catch (error) {
    console.error("Error uploading proof:", error)
    return NextResponse.json({ error: "Failed to upload proof" }, { status: 500 })
  }
}