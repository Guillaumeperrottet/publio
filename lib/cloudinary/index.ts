// Configuration Cloudinary pour l'upload de fichiers
import { v2 as cloudinary } from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

/**
 * Upload un fichier vers Cloudinary
 */
export async function uploadFile(
  file: Buffer | string,
  options?: {
    folder?: string;
    resourceType?: "image" | "video" | "raw" | "auto";
    publicId?: string;
  }
) {
  const { folder = "publio", resourceType = "auto", publicId } = options || {};

  try {
    // Si c'est un Buffer, on le convertit en base64 data URI
    const fileToUpload = Buffer.isBuffer(file)
      ? `data:image/jpeg;base64,${file.toString("base64")}`
      : file;

    const result = await cloudinary.uploader.upload(fileToUpload, {
      folder,
      resource_type: resourceType,
      public_id: publicId,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    throw new Error("Failed to upload file");
  }
}

/**
 * Supprimer un fichier de Cloudinary
 */
export async function deleteFile(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw new Error("Failed to delete file");
  }
}

/**
 * Obtenir une URL signée pour un fichier privé
 */
export function getSignedUrl(publicId: string, expiresIn: number = 3600) {
  return cloudinary.url(publicId, {
    sign_url: true,
    type: "private",
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
  });
}

/**
 * Optimiser une image
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  }
) {
  const { width, height, quality = 80, format = "auto" } = options || {};

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop: "fill" },
      { quality, fetch_format: format },
    ],
  });
}
