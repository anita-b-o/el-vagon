import { del, put } from "@vercel/blob";
import { randomUUID } from "node:crypto";

export const MAX_EVENT_IMAGE_BYTES = 5 * 1024 * 1024;

const imageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type AcceptedImageType = keyof typeof imageTypes;

function typeFromSignature(bytes: Uint8Array): AcceptedImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return "image/png";
  if (bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

export async function validateEventImage(file: File) {
  if (file.size === 0) throw new Error("La imagen está vacía.");
  if (file.size > MAX_EVENT_IMAGE_BYTES) throw new Error("La imagen supera el límite de 5 MB.");
  if (!(file.type in imageTypes)) throw new Error("Formato no permitido. Elegí una imagen JPEG, PNG o WebP.");

  const detectedType = typeFromSignature(new Uint8Array(await file.slice(0, 16).arrayBuffer()));
  if (detectedType !== file.type) throw new Error("El archivo no coincide con un formato de imagen permitido.");
  return { contentType: detectedType, extension: imageTypes[detectedType] };
}

export async function uploadEventImage(file: File) {
  const { contentType, extension } = await validateEventImage(file);
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("El almacenamiento de imágenes no está configurado. Falta BLOB_READ_WRITE_TOKEN.");
  }
  const blob = await put(`event-images/${randomUUID()}.${extension}`, file, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
  return blob.url;
}

export function isManagedEventImage(url: string | null | undefined) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".blob.vercel-storage.com") && parsed.pathname.startsWith("/event-images/");
  } catch {
    return false;
  }
}

/** Deletion is best-effort: the database must not point at a discarded image. */
export async function deleteManagedEventImage(url: string | null | undefined) {
  if (!url || !isManagedEventImage(url) || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(url);
  } catch (error) {
    console.error("No se pudo eliminar la imagen anterior del evento", error);
  }
}
