// Helper pour upload vers Cloudinary depuis le client
"use server";

import { uploadFile } from "@/lib/cloudinary";

/**
 * Upload une image vers Cloudinary
 * Cette fonction est appelée depuis le client avec un fichier en base64
 */
export async function uploadToCloudinary(
  fileData: string,
  folder: string = "publio"
): Promise<string> {
  try {
    const result = await uploadFile(fileData, {
      folder,
      resourceType: "image",
    });

    return result.url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload image");
  }
}
