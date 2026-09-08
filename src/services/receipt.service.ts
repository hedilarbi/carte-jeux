import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  PDFDocument,
  rgb,
  StandardFonts,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

import type { Order, OrderItem, PaymentStatus } from "@/types/entities";

const VAT_RATE = 0.19;
const TEMPLATE_PATH = path.join(process.cwd(), "Recu_Playsdepot_Vierge.pdf");
const MAX_ITEM_ROWS = 3;
const TEXT_COLOR = rgb(5 / 255, 31 / 255, 67 / 255);

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "En attente",
  paid: "Payé",
  failed: "Échoué",
  refunded: "Remboursé",
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace(/[\u00a0\u202f]/g, " ");
}

function formatReceiptDate(value?: string) {
  if (!value) {
    return "—";
  }

  const parts = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Tunis",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value ?? "";

  return `${part("day")}.${part("month")}.${part("year")}, ${part("hour")}:${part("minute")}`;
}

function normalizePaymentProvider(provider?: string) {
  const normalized = provider?.trim().toLowerCase();

  if (!normalized) return "—";
  if (normalized === "clictopay") return "Clictopay";
  if (normalized === "stripe") return "Stripe";
  if (normalized === "whatsapp") return "WhatsApp";

  return provider!.trim();
}

function receiptNumber(order: Order) {
  const year = new Date(order.paidAt ?? order.createdAt).getFullYear();
  return `R-${year}-${order.orderNumber}`;
}

function fitText(font: PDFFont, text: string, size: number, maxWidth: number) {
  const encodableText = Array.from(text, (character) => {
    try {
      font.encodeText(character);
      return character;
    } catch {
      return "?";
    }
  }).join("");

  if (font.widthOfTextAtSize(encodableText, size) <= maxWidth) {
    return encodableText;
  }

  let fitted = encodableText;
  while (
    fitted.length > 1 &&
    font.widthOfTextAtSize(`${fitted}…`, size) > maxWidth
  ) {
    fitted = fitted.slice(0, -1);
  }

  return `${fitted}…`;
}

function drawFittedText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  options: { x: number; y: number; size?: number; maxWidth: number },
) {
  const size = options.size ?? 9.3;
  page.drawText(fitText(font, text || "—", size, options.maxWidth), {
    x: options.x,
    y: options.y,
    size,
    font,
    color: TEXT_COLOR,
  });
}

function drawRightAligned(
  page: PDFPage,
  font: PDFFont,
  text: string,
  right: number,
  y: number,
  size = 9.4,
) {
  page.drawText(text, {
    x: right - font.widthOfTextAtSize(text, size),
    y,
    size,
    font,
    color: TEXT_COLOR,
  });
}

function getReceiptLines(order: Order) {
  const itemTotal = order.items.reduce((sum, item) => sum + item.lineTotal, 0);
  let allocated = 0;

  return order.items.map((item, index) => {
    const lineTotal =
      index === order.items.length - 1
        ? roundMoney(order.total - allocated)
        : roundMoney(
            itemTotal > 0
              ? (item.lineTotal / itemTotal) * order.total
              : order.total / order.items.length,
          );
    allocated = roundMoney(allocated + lineTotal);

    const unitTtc = roundMoney(lineTotal / item.quantity);
    const unitHt = roundMoney(unitTtc / (1 + VAT_RATE));

    return {
      item,
      lineTotal,
      unitTtc,
      unitHt,
      unitVat: roundMoney(unitTtc - unitHt),
    };
  });
}

function summarizedLines(order: Order) {
  const lines = getReceiptLines(order);
  if (lines.length <= MAX_ITEM_ROWS) return lines;

  const displayed = lines.slice(0, MAX_ITEM_ROWS - 1);
  const remaining = lines.slice(MAX_ITEM_ROWS - 1);
  const quantity = remaining.reduce((sum, line) => sum + line.item.quantity, 0);
  const lineTotal = roundMoney(
    remaining.reduce((sum, line) => sum + line.lineTotal, 0),
  );
  const unitTtc = roundMoney(lineTotal / quantity);
  const unitHt = roundMoney(unitTtc / (1 + VAT_RATE));

  return [
    ...displayed,
    {
      item: {
        ...remaining[0].item,
        productTitle: `${remaining.length} autres articles`,
        sku: "Détail dans la commande",
        quantity,
      } satisfies OrderItem,
      lineTotal,
      unitTtc,
      unitHt,
      unitVat: roundMoney(unitTtc - unitHt),
    },
  ];
}

export async function generateReceiptPdf(order: Order) {
  const template = await readFile(TEMPLATE_PATH);
  const document = await PDFDocument.load(template);
  const page = document.getPage(0);
  const font = await document.embedFont(StandardFonts.Helvetica);
  const boldFont = await document.embedFont(StandardFonts.HelveticaBold);
  const customerName =
    [order.customerFirstName, order.customerLastName]
      .map((value) => value?.trim())
      .filter(Boolean)
      .join(" ") || "Client";

  drawFittedText(page, boldFont, receiptNumber(order), {
    x: 691.89,
    y: 473.28,
    size: 8.5,
    maxWidth: 122,
  });
  drawFittedText(page, font, customerName, {
    x: 173,
    y: 383.28,
    maxWidth: 210,
  });
  drawFittedText(page, font, order.customerEmail, {
    x: 173,
    y: 358.28,
    maxWidth: 210,
  });
  drawFittedText(page, font, order.customerPhone ?? "—", {
    x: 173,
    y: 333.28,
    maxWidth: 210,
  });

  const metadata = [
    order.orderNumber,
    formatReceiptDate(order.createdAt),
    normalizePaymentProvider(order.paymentProvider),
    order.paymentReference ?? "—",
    formatReceiptDate(order.paidAt),
    PAYMENT_STATUS_LABELS[order.paymentStatus],
  ];
  metadata.forEach((value, index) => {
    drawFittedText(page, font, value, {
      x: 576.51,
      y: 414.28 - index * 17,
      maxWidth: 225,
    });
  });

  summarizedLines(order).forEach((line, index) => {
    const titleY = 240.28 - index * 36;
    const valueY = 233.28 - index * 36;
    drawFittedText(page, font, line.item.productTitle, {
      x: 37,
      y: titleY,
      maxWidth: 255,
    });
    drawFittedText(page, font, line.item.sku, {
      x: 37,
      y: titleY - 14,
      size: 8.3,
      maxWidth: 255,
    });
    drawRightAligned(page, font, String(line.item.quantity), 337, valueY);
    drawRightAligned(page, font, formatMoney(line.unitHt), 447, valueY);
    drawRightAligned(page, font, formatMoney(line.unitVat), 557, valueY);
    drawRightAligned(page, font, formatMoney(line.unitTtc), 667, valueY);
    drawRightAligned(page, font, formatMoney(line.lineTotal), 781, valueY);
  });

  const totalHt = roundMoney(order.total / (1 + VAT_RATE));
  const totalVat = roundMoney(order.total - totalHt);
  drawRightAligned(
    page,
    boldFont,
    formatMoney(totalHt),
    777,
    145.28,
    10,
  );
  drawRightAligned(
    page,
    boldFont,
    formatMoney(totalVat),
    777,
    115.28,
    10,
  );
  drawRightAligned(
    page,
    boldFont,
    formatMoney(order.total),
    777,
    85.28,
    11,
  );

  document.setTitle(`Reçu ${order.orderNumber}`);
  document.setSubject(`Reçu de la commande ${order.orderNumber}`);
  document.setCreator("Playsdepot");

  return document.save();
}
