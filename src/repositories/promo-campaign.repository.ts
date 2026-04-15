import { connectToDatabase } from "@/lib/db/mongoose";
import { PromoCampaignModel, type PromoCampaignRecord } from "@/models/promo-campaign.model";

export async function listPromoCampaigns() {
  await connectToDatabase();
  return PromoCampaignModel.find().sort({ createdAt: -1 }).lean().exec();
}

export async function getPromoCampaignById(id: string) {
  await connectToDatabase();
  return PromoCampaignModel.findById(id).lean().exec();
}

export async function createPromoCampaign(payload: Partial<PromoCampaignRecord>) {
  await connectToDatabase();
  return PromoCampaignModel.create(payload);
}

export async function updatePromoCampaignById(
  id: string,
  payload: Partial<PromoCampaignRecord>,
) {
  await connectToDatabase();
  return PromoCampaignModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .lean()
    .exec();
}

export async function deletePromoCampaignById(id: string) {
  await connectToDatabase();
  return PromoCampaignModel.findByIdAndDelete(id).lean().exec();
}
