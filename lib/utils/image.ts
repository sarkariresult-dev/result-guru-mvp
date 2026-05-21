/**
 * Client-side image pre-processing utilities.
 * Resizes and converts images to WebP format using the native Canvas API
 * before uploading them to Supabase Storage.
 */

interface ProcessImageOptions {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    mimeType?: string
}

export async function processImage(
    file: File,
    options: ProcessImageOptions = {}
): Promise<File> {
    const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.8,
        mimeType = 'image/webp'
    } = options

    // Skip processing if it's an SVG
    if (file.type === 'image/svg+xml') {
        return file
    }

    return new Promise((resolve, reject) => {
        const img = new window.Image()
        img.onload = () => {
            let width = img.width
            let height = img.height

            // Calculate new dimensions
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width)
                width = maxWidth
            }
            if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height)
                height = maxHeight
            }

            // Draw to canvas
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')

            if (!ctx) {
                reject(new Error('Failed to get canvas context'))
                return
            }

            ctx.drawImage(img, 0, 0, width, height)

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Canvas to Blob failed'))
                        return
                    }
                    // Extract name without extension, add .webp
                    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
                    const ext = mimeType.split('/')[1] || 'webp'
                    const newFileName = `${nameWithoutExt}.${ext}`
                    
                    const newFile = new File([blob], newFileName, {
                        type: mimeType,
                        lastModified: Date.now(),
                    })
                    resolve(newFile)
                },
                mimeType,
                quality
            )
        }
        img.onerror = (err) => reject(err)
        img.src = URL.createObjectURL(file)
    })
}
