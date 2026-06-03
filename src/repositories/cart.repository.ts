import { type mongo, Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { CartModel, type CartRecord } from "@/models/cart.model";

type CartQuery = mongo.Filter<CartRecord>;

export async function getActiveCartBySessionId(sessionId: string) {
  await connectToDatabase();
  return CartModel.findOne({ sessionId, status: "active" })
    .lean()
    .exec();
}

export async function getActiveCartByUserId(userId: string) {
  await connectToDatabase();
  return CartModel.findOne({
    userId: new Types.ObjectId(userId),
    status: "active",
  })
    .lean()
    .exec();
}

export async function createCart(payload: Partial<CartRecord>) {
  await connectToDatabase();
  return CartModel.create(payload);
}

export async function updateCartById(id: string, payload: Partial<CartRecord>) {
  await connectToDatabase();
  return CartModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .lean()
    .exec();
}

export async function attachActiveCartToUser(sessionId: string, userId: string) {
  await connectToDatabase();
  return CartModel.findOneAndUpdate(
    { sessionId, status: "active" },
    { userId: new Types.ObjectId(userId) },
    {
      new: true,
      runValidators: true,
    },
  )
    .lean()
    .exec();
}

export async function deleteCartBySessionId(sessionId: string) {
  await connectToDatabase();
  const query: CartQuery = { sessionId, status: "active" };

  return CartModel.findOneAndDelete(query).lean().exec();
}
