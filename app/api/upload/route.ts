import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est authentifié
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    let base64File: string;
    let folder: string;

    // Gérer les deux formats : FormData ET JSON
    if (contentType.includes("application/json")) {
      // Format JSON (ancien format pour les logos)
      const body = await request.json();
      base64File = body.file;
      folder = body.folder || "publio/logos";
    } else {
      // Format FormData (nouveau format pour les documents)
      const formData = await request.formData();
      const file = formData.get("file") as File;
      folder = (formData.get("folder") as string) || "publio/offers";

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      // Convertir le File en base64 pour Cloudinary
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      base64File = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    if (!base64File) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload vers Cloudinary
    const url = await uploadToCloudinary(base64File, folder);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
