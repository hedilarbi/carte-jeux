import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

function getFirebaseCredentials(): ServiceAccount {
  const rawCredentials = process.env.FIREBASE_CREDENTIALS;

  if (!rawCredentials) {
    throw new Error("Variable d'environnement FIREBASE_CREDENTIALS manquante.");
  }

  const credentials = JSON.parse(rawCredentials) as {
    client_email?: string;
    private_key?: string;
    project_id?: string;
  };

  if (
    !credentials.project_id ||
    !credentials.client_email ||
    !credentials.private_key
  ) {
    throw new Error("FIREBASE_CREDENTIALS est incomplet.");
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
    throw new Error(
      "Variable d'environnement FIREBASE_STORAGE_BUCKET manquante.",
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
