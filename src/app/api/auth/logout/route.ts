import { logoutCustomerController } from "@/controllers/customer-auth.controller";

export async function POST() {
  return logoutCustomerController();
}
