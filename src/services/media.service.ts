import { uploadImageToFirebaseStorage } from "@/lib/firebase/storage";

export const mediaService = {
  uploadPlatformLogo(file: File) {
    return uploadImageToFirebaseStorage(file, "platforms");
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
