import type { z } from "zod";

import { AppError } from "@/lib/utils/app-error";
import { assertObjectId } from "@/lib/utils/object-id";
import {
  createPaginatedResult,
  resolvePagination,
} from "@/lib/utils/pagination";
import { serializeDocument } from "@/lib/utils/serialization";
import {
  contactSubmissionCreateSchema,
  contactSubmissionReplySchema,
} from "@/lib/validation/contact-submission";
import {
  addContactSubmissionReply,
  createContactSubmission,
  getContactSubmissionById,
  listContactSubmissions,
  type ContactSubmissionListFilters,
} from "@/repositories/contact-submission.repository";
import { emailService } from "@/services/email.service";
import type { ContactSubmission } from "@/types/entities";

export const contactSubmissionService = {
  async create(input: z.input<typeof contactSubmissionCreateSchema>) {
    const parsed = contactSubmissionCreateSchema.parse(input);

    const submission = await createContactSubmission({
      ...parsed,
      status: "new",
      replies: [],
    });

    const serialized = serializeDocument<ContactSubmission>(submission);

    try {
      await emailService.sendContactSubmissionNotification({
        submission: serialized,
      });
    } catch (error) {
      console.error(
        `Impossible d'envoyer la notification de soumission ${serialized._id}.`,
        error,
      );
    }

    return serialized;
  },

  async list(filters: ContactSubmissionListFilters = {}) {
    const result = await listContactSubmissions(filters);
    const pagination = resolvePagination(filters);

    return createPaginatedResult<ContactSubmission>(
      serializeDocument<ContactSubmission[]>(result.items),
      result.totalItems,
      pagination,
    );
  },

  async getById(id: string) {
    assertObjectId(id, "Identifiant de soumission");

    const submission = await getContactSubmissionById(id);

    if (!submission) {
      throw new AppError("Soumission introuvable.", 404);
    }

    return serializeDocument<ContactSubmission>(submission);
  },

  async reply(
    id: string,
    input: z.input<typeof contactSubmissionReplySchema>,
    adminEmail?: string,
  ) {
    assertObjectId(id, "Identifiant de soumission");

    const parsed = contactSubmissionReplySchema.parse(input);
    const existing = await getContactSubmissionById(id);

    if (!existing) {
      throw new AppError("Soumission introuvable.", 404);
    }

    const submission = serializeDocument<ContactSubmission>(existing);

    await emailService.sendContactSubmissionReply({
      adminEmail,
      message: parsed.message,
      submission,
    });

    const updated = await addContactSubmissionReply(id, {
      adminEmail,
      message: parsed.message,
      sentAt: new Date(),
      sentTo: submission.email,
    });

    if (!updated) {
      throw new AppError("Soumission introuvable.", 404);
    }

    return serializeDocument<ContactSubmission>(updated);
  },
};
