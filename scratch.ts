import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.log(".env not found");
}

import { bestSellerService } from "./src/services/best-seller.service";
import { productService } from "./src/services/product.service";

async function run() {
  try {
    const items = await bestSellerService.list();
    console.log("bestSellerService.list() succeeded. Count:", items.length);
  } catch (e) {
    console.error("bestSellerService error:", e);
  }

  try {
    const products = await productService.listActiveForSelection();
    console.log("productService.listActiveForSelection() succeeded. Count:", products.length);
  } catch (e) {
    console.error("productService error:", e);
  }
}

run();
