import { randomUUID } from "node:crypto";
import path from "node:path";

import { AppError } from "@/lib/utils/app-error";
import { getFirebaseStorageBucket } from "@/lib/firebase/admin";

const STORAGE_ROOT_FOLDER = "playsdepot";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_CONTENT_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
]);

function assertImageFile(file: File) {
  if (file.size <= 0) {
    throw new AppError("Le fichier image est vide.", 400);
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new AppError("L'image ne doit pas dépasser 5 Mo.", 400);
  }

  if (!IMAGE_CONTENT_TYPES.has(file.type)) {
    throw new AppError("Le fichier doit être une image valide.", 400);
  }
}

function resolveExtension(file: File) {
  const originalExtension = path.extname(file.name).toLowerCase();

  if (originalExtension) {
    return originalExtension;
  }

  const [, subtype] = file.type.split("/");
  return subtype ? `.${subtype.replace("svg+xml", "svg")}` : "";
}

function buildDownloadUrl(bucketName: string, destination: string, token: string) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
    destination,
  )}?alt=media&token=${token}`;
}

export async function uploadImageToFirebaseStorage(
  file: File,
  folder: string,
) {
  assertImageFile(file);

  const bucket = getFirebaseStorageBucket();
  const token = randomUUID();
  const extension = resolveExtension(file);
  const destination = `${STORAGE_ROOT_FOLDER}/${folder}/${Date.now()}-${randomUUID()}${extension}`;
  const storageFile = bucket.file(destination);
  const buffer = Buffer.from(await file.arrayBuffer());

  await storageFile.save(buffer, {
    metadata: {
      cacheControl: "public, max-age=31536000, immutable",
      contentType: file.type,
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
    resumable: false,
  });

  return buildDownloadUrl(bucket.name, destination, token);
}
