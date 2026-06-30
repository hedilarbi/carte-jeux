import nodemailer from "nodemailer";

import type { ContactSubmission, Order } from "@/types/entities";

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`La variable d'environnement ${name} est requise.`);
  }

  return value;
}

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: getRequiredEnv("GMAIL_USER"),
      pass: getRequiredEnv("GMAIL_APP_PASSWORD"),
    },
  });
}

function getSender() {
  const fromEmail = getRequiredEnv("TICKETS_EMAIL_FROM");
  const fromName = process.env.TICKETS_EMAIL_FROM_NAME?.trim() || "PlaySDepot";

  return `"${fromName}" <${fromEmail}>`;
}

function getAdminContactRecipient() {
  return (
    process.env.CONTACT_SUBMISSIONS_EMAIL?.trim() ||
    process.env.ADMIN_SESSION_EMAIL?.trim() ||
    process.env.ADMIN_DEV_EMAIL?.trim() ||
    getRequiredEnv("TICKETS_EMAIL_FROM")
  );
}

function formatMoney(value: number, currency: string) {
  return `${value.toFixed(3).replace(".", ",")} ${currency}`;
}

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getCustomerName(order: Order) {
  const fullName = [order.customerFirstName, order.customerLastName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");

  return fullName || "Client";
}

function buildOrderText(order: Order) {
  const itemLines = order.items
    .map(
      (item) =>
        `- ${item.quantity} x ${item.productTitle} (${item.sku}) : ${formatMoney(
          item.lineTotal,
          item.currency,
        )}`,
    )
    .join("\n");

  return [
    `Bonjour ${getCustomerName(order)},`,
    "",
    `Merci pour votre commande ${order.orderNumber}. Voici votre récapitulatif :`,
    "",
    itemLines,
    "",
    `Sous-total : ${formatMoney(order.subtotal, order.currency)}`,
    `Réduction : ${formatMoney(order.totalDiscount, order.currency)}`,
    ...(order.appliedPromoCode
      ? [
          `Code promo : ${order.appliedPromoCode.code}`,
          `Remise promo : ${formatMoney(
            order.appliedPromoCode.discountAmount ?? 0,
            order.currency,
          )}`,
        ]
      : []),
    `Total : ${formatMoney(order.total, order.currency)}`,
    "",
    "Votre commande sera traitée dans les meilleurs délais.",
    "PlaySDepot",
  ].join("\n");
}

function buildOrderHtml(order: Order) {
  const customerName = escapeHtml(getCustomerName(order));
  const orderNumber = escapeHtml(order.orderNumber);
  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #DADDFF">
            <div style="font-weight:700;color:#012D69">${escapeHtml(item.productTitle)}</div>
            <div style="margin-top:4px;font-size:12px;color:#52617d">SKU ${escapeHtml(item.sku)}</div>
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #DADDFF;text-align:center;color:#1f2a44">${escapeHtml(item.quantity)}</td>
          <td style="padding:14px 0;border-bottom:1px solid #DADDFF;text-align:right;font-weight:700;color:#00061E">${escapeHtml(
            formatMoney(item.lineTotal, item.currency),
          )}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;background:#f6f7ff;padding:24px;color:#012D69">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:18px;padding:28px;border:1px solid #DADDFF">
        <h1 style="margin:0 0 10px;font-size:24px;color:#012D69">Merci pour votre commande</h1>
        <p style="margin:0 0 22px;font-size:14px;line-height:1.6;color:#1f2a44">
          Bonjour ${customerName}, nous avons bien reçu votre commande <strong>${orderNumber}</strong>.
        </p>

        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr>
              <th style="padding:0 0 10px;text-align:left;color:#52617d;font-size:12px;text-transform:uppercase">Produit</th>
              <th style="padding:0 0 10px;text-align:center;color:#52617d;font-size:12px;text-transform:uppercase">Qté</th>
              <th style="padding:0 0 10px;text-align:right;color:#52617d;font-size:12px;text-transform:uppercase">Montant</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <div style="margin-top:22px;background:#F3F4FF;border-radius:14px;padding:18px">
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;color:#1f2a44">
            <span>Sous-total</span>
            <strong>${escapeHtml(formatMoney(order.subtotal, order.currency))}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;color:#1f2a44">
            <span>Réduction</span>
            <strong>${escapeHtml(formatMoney(order.totalDiscount, order.currency))}</strong>
          </div>
          ${
            order.appliedPromoCode
              ? `
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;color:#047857">
            <span>Code promo ${escapeHtml(order.appliedPromoCode.code)}</span>
            <strong>-${escapeHtml(
              formatMoney(
                order.appliedPromoCode.discountAmount ?? 0,
                order.currency,
              ),
            )}</strong>
          </div>
          `
              : ""
          }
          <div style="display:flex;justify-content:space-between;font-size:18px;color:#012D69">
            <span>Total</span>
            <strong>${escapeHtml(formatMoney(order.total, order.currency))}</strong>
          </div>
        </div>

        <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#52617d">
          Votre commande sera traitée dans les meilleurs délais. Vous recevrez les informations de livraison sur cette adresse e-mail.
        </p>
      </div>
    </div>
  `;
}

function buildContactNotificationText(submission: ContactSubmission) {
  return [
    "Nouvelle demande produit depuis l'accueil PlaySDepot.",
    "",
    `Produit : ${submission.productName}`,
    `Plateforme : ${submission.platform}`,
    `Type : ${submission.requestType}`,
    `Région : ${submission.region}`,
    `Budget : ${submission.budget}`,
    `Paiement : ${submission.payment}`,
    `Email : ${submission.email}`,
    `Téléphone : ${submission.phone || "Non renseigné"}`,
    "",
    `Voir dans l'admin : /admin/soumissions/${submission._id}`,
  ].join("\n");
}

function buildContactNotificationHtml(submission: ContactSubmission) {
  const rows = [
    ["Produit", submission.productName],
    ["Plateforme", submission.platform],
    ["Type", submission.requestType],
    ["Région", submission.region],
    ["Budget", submission.budget],
    ["Paiement", submission.payment],
    ["Email", submission.email],
    ["Téléphone", submission.phone || "Non renseigné"],
  ]
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:11px 0;border-bottom:1px solid #DADDFF;color:#52617d">${escapeHtml(label)}</td>
          <td style="padding:11px 0;border-bottom:1px solid #DADDFF;text-align:right;font-weight:700;color:#012D69">${escapeHtml(value)}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;background:#f6f7ff;padding:24px;color:#012D69">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:18px;padding:28px;border:1px solid #DADDFF">
        <h1 style="margin:0 0 10px;font-size:22px;color:#012D69">Nouvelle demande produit</h1>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#1f2a44">
          Une nouvelle soumission a été envoyée depuis le formulaire de l'accueil.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tbody>${rows}</tbody>
        </table>
        <p style="margin:20px 0 0;font-size:13px;color:#52617d">
          Identifiant de soumission : ${escapeHtml(submission._id)}
        </p>
      </div>
    </div>
  `;
}

function buildContactReplyText(input: {
  message: string;
  submission: ContactSubmission;
}) {
  return [
    "Bonjour,",
    "",
    `Nous revenons vers vous concernant votre demande : ${input.submission.productName}.`,
    "",
    input.message,
    "",
    "PlaySDepot",
  ].join("\n");
}

function buildContactReplyHtml(input: {
  message: string;
  submission: ContactSubmission;
}) {
  return `
    <div style="font-family:Arial,sans-serif;background:#f6f7ff;padding:24px;color:#012D69">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:18px;padding:28px;border:1px solid #DADDFF">
        <h1 style="margin:0 0 10px;font-size:22px;color:#012D69">Réponse à votre demande</h1>
        <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#1f2a44">
          Nous revenons vers vous concernant votre demande :
          <strong>${escapeHtml(input.submission.productName)}</strong>.
        </p>
        <div style="white-space:pre-line;background:#F3F4FF;border-radius:14px;padding:18px;font-size:14px;line-height:1.7;color:#1f2a44">
          ${escapeHtml(input.message)}
        </div>
        <p style="margin:20px 0 0;font-size:13px;color:#52617d">
          PlaySDepot
        </p>
      </div>
    </div>
  `;
}

export const emailService = {
  async sendRegistrationOtp(input: {
    email: string;
    expiresInMinutes: number;
    otp: string;
  }) {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: getSender(),
      to: input.email,
      subject: "Votre code de vérification PlaySDepot",
      text: `Votre code de vérification PlaySDepot est ${input.otp}. Il expire dans ${input.expiresInMinutes} minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;background:#f6f7ff;padding:24px;color:#012D69">
          <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:18px;padding:28px;border:1px solid #DADDFF">
            <h1 style="margin:0 0 12px;font-size:22px;color:#012D69">Vérification de votre compte</h1>
            <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#1f2a44">
              Utilisez ce code pour finaliser votre inscription PlaySDepot.
            </p>
            <div style="font-size:34px;letter-spacing:8px;font-weight:800;background:#E3CDFF;color:#012D69;border-radius:14px;padding:18px;text-align:center">
              ${input.otp}
            </div>
            <p style="margin:20px 0 0;font-size:13px;color:#52617d">
              Ce code expire dans ${input.expiresInMinutes} minutes. Si vous n'avez pas demandé cette inscription, ignorez cet e-mail.
            </p>
          </div>
        </div>
      `,
    });
  },

  async sendOrderConfirmation(input: { order: Order }) {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: getSender(),
      to: input.order.customerEmail,
      subject: `Récapitulatif de votre commande ${input.order.orderNumber}`,
      text: buildOrderText(input.order),
      html: buildOrderHtml(input.order),
    });
  },

  async sendContactSubmissionNotification(input: {
    submission: ContactSubmission;
  }) {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: getSender(),
      to: getAdminContactRecipient(),
      replyTo: input.submission.email,
      subject: `Nouvelle demande produit: ${input.submission.productName}`,
      text: buildContactNotificationText(input.submission),
      html: buildContactNotificationHtml(input.submission),
    });
  },

  async sendContactSubmissionReply(input: {
    adminEmail?: string;
    message: string;
    submission: ContactSubmission;
  }) {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: getSender(),
      to: input.submission.email,
      replyTo: input.adminEmail || getAdminContactRecipient(),
      subject: `Réponse à votre demande PlaySDepot - ${input.submission.productName}`,
      text: buildContactReplyText(input),
      html: buildContactReplyHtml(input),
    });
  },
};
