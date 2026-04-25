/**
 * Compress an image file using the browser Canvas API.
 * No npm packages needed.
 *
 * @param file     Original image File
 * @param maxPx    Max width OR height in pixels (default 1280)
 * @param quality  JPEG quality 0–1 (default 0.8)
 * @param maxBytes Hard cap after compression (default 1 MB)
 * @returns        Compressed File, or throws if still over maxBytes
 */
export async function compressImage(
  file: File,
  maxPx = 1280,
  quality = 0.8,
  maxBytes = 1_000_000
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img
      if (width > maxPx || height > maxPx) {
        if (width > height) {
          height = Math.round((height * maxPx) / width)
          width = maxPx
        } else {
          width = Math.round((width * maxPx) / height)
          height = maxPx
        }
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) { reject(new Error("Canvas not supported")); return }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Compression failed")); return }

          if (blob.size > maxBytes) {
            reject(new Error(
              `Image too large even after compression (${(blob.size / 1024 / 1024).toFixed(1)} MB). ` +
              `Please take a clearer/smaller screenshot.`
            ))
            return
          }

          const compressedFile = new File(
            [blob],
            `compressed_${file.name.replace(/\.[^.]+$/, "")}.jpg`,
            { type: "image/jpeg", lastModified: Date.now() }
          )
          resolve(compressedFile)
        },
        "image/jpeg",
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Failed to load image"))
    }

    img.src = objectUrl
  })
}

/** Format bytes to human-readable string e.g. "0.4 MB" */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
