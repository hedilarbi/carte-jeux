import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

import { AppError } from "@/lib/utils/app-error";

function getFirebaseCredentials(): ServiceAccount {
  const rawCredentials = process.env.FIREBASE_CREDENTIALS;

  if (!rawCredentials) {
    throw new AppError(
      "Le stockage des images n'est pas configuré sur le serveur (FIREBASE_CREDENTIALS manquante).",
      503,
    );
  }

  let credentials: {
    client_email?: string;
    private_key?: string;
    project_id?: string;
  };

  try {
    credentials = JSON.parse(rawCredentials) as typeof credentials;
  } catch {
    throw new AppError(
      "La configuration FIREBASE_CREDENTIALS du serveur n'est pas un JSON valide.",
      503,
    );
  }

  if (
    !credentials.project_id ||
    !credentials.client_email ||
    !credentials.private_key
  ) {
    throw new AppError(
      "La configuration FIREBASE_CREDENTIALS du serveur est incomplète.",
      503,
    );
  }

  return {
    clientEmail: credentials.client_email,
    privateKey: credentials.private_key.replace(/\\n/g, "\n"),
    projectId: credentials.project_id,
  };
}

function getStorageBucketName() {
  const bucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!bucket) {
    throw new AppError(
      "Le stockage des images n'est pas configuré sur le serveur (FIREBASE_STORAGE_BUCKET manquante).",
      503,
    );
  }

  return bucket;
}

export function getFirebaseAdminApp(): App {
  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  return initializeApp({
    credential: cert(getFirebaseCredentials()),
    storageBucket: getStorageBucketName(),
  });
}

export function getFirebaseStorageBucket() {
  return getStorage(getFirebaseAdminApp()).bucket(getStorageBucketName());
}
