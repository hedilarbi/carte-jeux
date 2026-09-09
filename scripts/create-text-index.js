const mongoose = require("mongoose");
const path = require("path");

const fs = require("fs");
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      process.env[match[1]] = (match[2] || "").replace(/^["']|["']$/g, "");
    }
  });
}

async function createIndexes() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI est manquant.");
    process.exit(1);
  }

  console.log("Connexion à MongoDB...");
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME,
  });
  console.log("Connecté.");

  const db = mongoose.connection.db;
  const productsCollection = db.collection("products");

  console.log("Création de l'index textuel en arrière-plan (sans bloquer la prod)...");
  
  try {
    await productsCollection.createIndex(
      { 
        title: "text", 
        slug: "text", 
        sku: "text", 
        shortDescription: "text" 
      },
      {
        name: "product_text_search_index",
        weights: {
          title: 10,
          sku: 8,
          slug: 5,
          shortDescription: 2
        },
        default_language: "french",
        background: true // CRITIQUE: Empêche de bloquer la base de données en production
      }
    );
    console.log("✅ Index textuel créé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'index :", error.message);
  }

  console.log("Fermeture de la connexion.");
  await mongoose.disconnect();
}

createIndexes();
