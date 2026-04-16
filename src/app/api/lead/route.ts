import { NextRequest, NextResponse } from "next/server";

const HASOFFERS_POSTBACK_BASE =
  "https://tracking.gototrackers.com/aff_lsr?offer_id=331";

// Anti-duplication simple (mémoire)
// ⚠️ en prod → utiliser DB
const sentTransactions = new Set<string>();

interface LeadRequestBody {
  transaction_id?: unknown;
  email?: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LeadRequestBody;

    const transactionId =
      typeof body.transaction_id === "string" ? body.transaction_id.trim() : "";
    const email = typeof body.email === "string" ? body.email : undefined;

    // 1. Validation
    if (!transactionId) {
      return NextResponse.json(
        { success: false, message: "transaction_id manquant" },
        { status: 400 },
      );
    }

    // 2. Anti-duplication
    if (sentTransactions.has(transactionId)) {
      return NextResponse.json({
        success: true,
        message: "Déjà envoyé",
        transaction_id: transactionId,
      });
    }

    // 3. (Optionnel) Sauvegarde du lead
    console.log("Lead reçu:", {
      email,
      transaction_id: transactionId,
    });

    // 4. Construire URL postback
    const postbackUrl = `${HASOFFERS_POSTBACK_BASE}&transaction_id=${encodeURIComponent(transactionId)}`;

    console.log("Postback URL:", postbackUrl);

    // 5. Envoyer postback à HasOffers
    const response = await fetch(postbackUrl, {
      method: "GET",
      cache: "no-store",
    });

    const text = await response.text();

    console.log("HasOffers status:", response.status);
    console.log("HasOffers response:", text);

    // 6. Marquer comme envoyé
    sentTransactions.add(transactionId);

    return NextResponse.json({
      success: true,
      transaction_id: transactionId,
      hasoffers_status: response.status,
      hasoffers_response: text,
    });
  } catch (error: unknown) {
    console.error("Erreur API:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 },
    );
  }
}
