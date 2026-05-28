import { uploadImageToFirebaseStorage } from "@/lib/firebase/storage";

export const mediaService = {
  uploadCategoryImage(file: File) {
    return uploadImageToFirebaseStorage(file, "categories");
  },

  uploadProductImage(file: File) {
    return uploadImageToFirebaseStorage(file, "products");
  },

  async uploadProductGallery(files: File[]) {
    return Promise.all(
      files.map((file) => uploadImageToFirebaseStorage(file, "products/gallery")),
    );
  },
};
