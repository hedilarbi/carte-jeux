import type { mongo } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { resolvePagination } from "@/lib/utils/pagination";
import {
  ContactSubmissionModel,
  type ContactSubmissionRecord,
  type ContactSubmissionReplyRecord,
} from "@/models/contact-submission.model";
import type { SearchablePaginationInput } from "@/types/common";
import type { ContactSubmissionStatus } from "@/types/entities";

type ContactSubmissionQuery = mongo.Filter<ContactSubmissionRecord>;
type ContactSubmissionFindQuery = Parameters<
  typeof ContactSubmissionModel.find
>[0];
type ContactSubmissionCountQuery = Parameters<
  typeof ContactSubmissionModel.countDocuments
>[0];

export interface ContactSubmissionListFilters
  extends SearchablePaginationInput {
  status?: ContactSubmissionStatus;
}

export async function createContactSubmission(
  payload: Partial<ContactSubmissionRecord>,
) {
  await connectToDatabase();
  return ContactSubmissionModel.create(payload);
}

export async function listContactSubmissions(
  filters: ContactSubmissionListFilters = {},
) {
  await connectToDatabase();

  const pagination = resolvePagination(filters);
  const query: ContactSubmissionQuery = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.search?.trim()) {
    const searchRegex = new RegExp(filters.search.trim(), "i");
    query.$or = [
      { platform: searchRegex },
      { requestType: searchRegex },
      { productName: searchRegex },
      { region: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  const findQuery = query as unknown as ContactSubmissionFindQuery;
  const countQuery = query as unknown as ContactSubmissionCountQuery;

  const [items, totalItems] = await Promise.all([
    ContactSubmissionModel.find(findQuery)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean()
      .exec(),
    ContactSubmissionModel.countDocuments(countQuery),
  ]);

  return {
    items,
    totalItems,
    ...pagination,
  };
}

export async function getContactSubmissionById(id: string) {
  await connectToDatabase();
  return ContactSubmissionModel.findById(id).lean().exec();
}

export async function addContactSubmissionReply(
  id: string,
  reply: ContactSubmissionReplyRecord,
) {
  await connectToDatabase();
  return ContactSubmissionModel.findByIdAndUpdate(
    id,
    {
      $push: { replies: reply },
      $set: { status: "replied" },
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .lean()
    .exec();
}
