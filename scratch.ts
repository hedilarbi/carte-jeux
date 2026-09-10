import { bestSellerService } from "./src/services/best-seller.service";
import { productService } from "./src/services/product.service";

async function main() {
  try {
    const products = await productService.listActiveForSelection();
    console.log("products fetched", products.length);
  } catch (e) {
    console.error("productService error:", e);
  }
  
  try {
    const bestSellers = await bestSellerService.list();
    console.log("bestSellers fetched", bestSellers.length);
  } catch (e) {
    console.error("bestSellerService error:", e);
  }
}
main();
