import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary'

// ─── Cloudinary CDN Configuration ──────────────────────────────────────
// Handles image/document uploads with automatic optimization, CDN delivery,
// and compression. Falls back to returning placeholder URLs when
// Cloudinary is not configured (dev/local mode).
//
// Use Cases:
//   - Provider profile images
//   - Service images
//   - KYC documents (Aadhaar, PAN, etc.)
//   - Service category icons/images
//
// Environment Variables:
//   CLOUDINARY_CLOUD_NAME — Your Cloudinary cloud name
//   CLOUDINARY_API_KEY    — API key
//   CLOUDINARY_API_SECRET — API secret

// ─── Configuration ─────────────────────────────────────────────────────
const isConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Force HTTPS URLs
  })
  console.log('☁️  Cloudinary CDN configured')
} else {
  console.log('☁️  Cloudinary not configured — upload endpoints will return mock URLs')
}

// ─── Upload Folder Convention ──────────────────────────────────────────
export const CloudinaryFolders = {
  PROVIDER_PROFILE: 'bys/providers/profiles',
  SERVICE_IMAGES: 'bys/services/images',
  KYC_DOCUMENTS: 'bys/providers/kyc',
  CATEGORY_ICONS: 'bys/categories/icons',
  CATEGORY_IMAGES: 'bys/categories/images',
  MISC: 'bys/misc',
} as const

// ─── Upload Presets ────────────────────────────────────────────────────
export const UploadPresets = {
  profileImage: {
    folder: CloudinaryFolders.PROVIDER_PROFILE,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  },
  serviceImage: {
    folder: CloudinaryFolders.SERVICE_IMAGES,
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  },
  kycDocument: {
    folder: CloudinaryFolders.KYC_DOCUMENTS,
    transformation: [
      { width: 1600, height: 1200, crop: 'limit' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
  },
  categoryIcon: {
    folder: CloudinaryFolders.CATEGORY_ICONS,
    transformation: [
      { width: 128, height: 128, crop: 'fit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
    maxFileSize: 2 * 1024 * 1024, // 2MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
  },
  categoryImage: {
    folder: CloudinaryFolders.CATEGORY_IMAGES,
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  },
} as const

type UploadPresetKey = keyof typeof UploadPresets

// ─── Upload Result ─────────────────────────────────────────────────────
export interface UploadResult {
  url: string           // CDN URL (optimized)
  secureUrl: string     // HTTPS CDN URL
  publicId: string      // Cloudinary public ID for future operations
  width: number
  height: number
  format: string
  bytes: number
}

// ─── Core Upload Function ──────────────────────────────────────────────
/**
 * Upload a file buffer to Cloudinary with the specified preset.
 * Returns optimized CDN URL or a mock URL if Cloudinary is not configured.
 */
export async function uploadBuffer(
  buffer: Buffer,
  preset: UploadPresetKey,
  customFilename?: string
): Promise<UploadResult> {
  const config = UploadPresets[preset]

  // If Cloudinary is not configured, return a mock URL
  if (!isConfigured) {
    const mockPublicId = `${config.folder}/${customFilename || Date.now()}`
    return {
      url: `https://placehold.co/400x400/eee/999?text=${encodeURIComponent(preset)}`,
      secureUrl: `https://placehold.co/400x400/eee/999?text=${encodeURIComponent(preset)}`,
      publicId: mockPublicId,
      width: 400,
      height: 400,
      format: 'png',
      bytes: buffer.length,
    }
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: config.folder,
        transformation: config.transformation,
        resource_type: 'auto',
        public_id: customFilename || undefined,
        overwrite: true,
        invalidate: true,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(new Error(error?.message || 'Cloudinary upload failed'))
          return
        }
        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        })
      }
    )
    uploadStream.end(buffer)
  })
}

// ─── Upload from Base64 ────────────────────────────────────────────────
/**
 * Upload a base64-encoded image to Cloudinary.
 * Useful for frontend uploads where images are sent as data URIs.
 */
export async function uploadBase64(
  base64Data: string,
  preset: UploadPresetKey,
  customFilename?: string
): Promise<UploadResult> {
  const config = UploadPresets[preset]

  if (!isConfigured) {
    const mockPublicId = `${config.folder}/${customFilename || Date.now()}`
    return {
      url: `https://placehold.co/400x400/eee/999?text=${encodeURIComponent(preset)}`,
      secureUrl: `https://placehold.co/400x400/eee/999?text=${encodeURIComponent(preset)}`,
      publicId: mockPublicId,
      width: 400,
      height: 400,
      format: 'png',
      bytes: 0,
    }
  }

  const result = await cloudinary.uploader.upload(base64Data, {
    folder: config.folder,
    transformation: config.transformation,
    resource_type: 'auto',
    public_id: customFilename || undefined,
    overwrite: true,
    invalidate: true,
  })

  return {
    url: result.url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  }
}

// ─── Upload from URL ───────────────────────────────────────────────────
/**
 * Upload an image from a URL to Cloudinary (e.g., Google profile picture).
 * Fetches the remote image and stores it in Cloudinary with optimization.
 */
export async function uploadFromUrl(
  url: string,
  preset: UploadPresetKey,
  customFilename?: string
): Promise<UploadResult> {
  const config = UploadPresets[preset]

  if (!isConfigured) {
    return {
      url,
      secureUrl: url,
      publicId: `${config.folder}/${customFilename || Date.now()}`,
      width: 400,
      height: 400,
      format: 'jpg',
      bytes: 0,
    }
  }

  const result = await cloudinary.uploader.upload(url, {
    folder: config.folder,
    transformation: config.transformation,
    resource_type: 'auto',
    public_id: customFilename || undefined,
    overwrite: true,
    invalidate: true,
  })

  return {
    url: result.url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  }
}

// ─── Delete Image ──────────────────────────────────────────────────────
/**
 * Delete an image from Cloudinary by its public ID.
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  if (!isConfigured) return true

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    })
    return result.result === 'ok'
  } catch (err) {
    console.warn('☁️  Cloudinary delete failed:', (err as Error).message)
    return false
  }
}

// ─── Generate Optimized URL ────────────────────────────────────────────
/**
 * Generate an optimized CDN URL for an existing Cloudinary image.
 * Useful for generating different sizes/formats without re-uploading.
 */
export function getOptimizedUrl(publicId: string, options?: {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'limit' | 'scale'
  quality?: string
  format?: string
}): string {
  if (!isConfigured) return publicId

  return cloudinary.url(publicId, {
    transformation: [{
      width: options?.width || 'auto',
      height: options?.height || 'auto',
      crop: options?.crop || 'limit',
      quality: options?.quality || 'auto',
      fetch_format: options?.format || 'auto',
    }],
    secure: true,
  })
}

// ─── Health Check ──────────────────────────────────────────────────────
export function getCloudinaryStatus(): { configured: boolean; cloudName: string | null } {
  return {
    configured: isConfigured,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
  }
}
