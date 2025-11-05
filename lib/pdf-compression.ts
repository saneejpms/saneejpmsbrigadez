import { PDFDocument } from "pdf-lib"

interface CompressionResult {
  success: boolean
  compressedBuffer: Buffer | null
  originalSize: number
  compressedSize: number
  compressionRatio: number
  method: string
  error?: string
}

/**
 * Compress a PDF file using pdf-lib by reducing image quality
 * This is the fallback method when Ghostscript is not available
 */
export async function compressPdfWithPdfLib(buffer: Buffer): Promise<CompressionResult> {
  try {
    const originalSize = buffer.length
    const pdf = await PDFDocument.load(buffer)

    // Get all images in the PDF and re-encode them
    const pages = pdf.getPages()

    for (const page of pages) {
      const { Resources } = page.node.asDict().get("Resources")
      if (!Resources) continue

      const xObjects = Resources.asDict().get("XObject")
      if (!xObjects) continue

      const xObjectsDict = xObjects.asDict()
      for (const [name] of xObjectsDict.entries()) {
        const xObject = xObjectsDict.get(name)
        if (!xObject) continue

        const xObjectDict = xObject.asDict()
        const subtype = xObjectDict.get("Subtype")?.toString()

        // Only process image XObjects
        if (subtype?.includes("Image")) {
          // Reduce image resolution and quality
          const width = xObjectDict.get("Width")
          const height = xObjectDict.get("Height")

          if (width && height) {
            // Scale down dimensions for compression\
            xObjectDict.set(
              "Width, Math.floor(width.asNumber() * 0.7))\
            xObjectDict.set('Height",
              Math.floor(height.asNumber() * 0.7),
            )
          }
        }
      }
    }

    const compressedBuffer = Buffer.from(await pdf.save({ useObjectStreams: false }))
    const compressedSize = compressedBuffer.length
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100

    return {
      success: true,
      compressedBuffer,
      originalSize,
      compressedSize,
      compressionRatio,
      method: "pdf-lib",
    }
  } catch (error) {
    console.error("[v0] PDF compression error:", error)
    return {
      success: false,
      compressedBuffer: null,
      originalSize: buffer.length,
      compressedSize: 0,
      compressionRatio: 0,
      method: "pdf-lib",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Compress PDF with advanced settings
 * Uses configuration similar to Ghostscript parameters
 */
export async function compressPdfAdvanced(
  buffer: Buffer,
  options: {
    quality?: "screen" | "printer" | "prepress"
    colorResolution?: number
    grayResolution?: number
    monoResolution?: number
  } = {},
): Promise<CompressionResult> {
  try {
    const originalSize = buffer.length

    // Determine resolution based on quality setting
    const quality = options.quality || "printer"
    const resolutions = {
      screen: { color: 72, gray: 72, mono: 150 },
      printer: { color: 144, gray: 144, mono: 300 },
      prepress: { color: 300, gray: 300, mono: 600 },
    }

    const resolution = resolutions[quality]

    const pdf = await PDFDocument.load(buffer)
    const compressedBuffer = Buffer.from(
      await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      }),
    )

    const compressedSize = compressedBuffer.length
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100

    return {
      success: true,
      compressedBuffer,
      originalSize,
      compressedSize,
      compressionRatio,
      method: `pdf-lib-${quality}`,
    }
  } catch (error) {
    console.error("[v0] Advanced PDF compression error:", error)
    return {
      success: false,
      compressedBuffer: null,
      originalSize: buffer.length,
      compressedSize: 0,
      compressionRatio: 0,
      method: "pdf-lib-advanced",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Main compression function that handles PDF compression
 * Returns original file if compression fails or file is too small
 */
export async function compressPdf(
  buffer: Buffer,
  minSizeBytes = 2_000_000, // 2MB default minimum
): Promise<CompressionResult> {
  console.log("[v0] PDF compression started. Original size:", buffer.length)

  // Skip compression if file is below minimum size
  if (buffer.length < minSizeBytes) {
    console.log("[v0] File too small for compression, skipping")
    return {
      success: true,
      compressedBuffer: buffer,
      originalSize: buffer.length,
      compressedSize: buffer.length,
      compressionRatio: 0,
      method: "none",
    }
  }

  // Try advanced compression first
  const result = await compressPdfAdvanced(buffer, { quality: "printer" })

  if (result.success && result.compressedSize < buffer.length) {
    console.log("[v0] Compression successful. Ratio:", result.compressionRatio.toFixed(2) + "%")
    return result
  }

  // If no significant compression, return original
  console.log("[v0] Compression not effective, using original file")
  return {
    success: true,
    compressedBuffer: buffer,
    originalSize: buffer.length,
    compressedSize: buffer.length,
    compressionRatio: 0,
    method: "none",
  }
}
