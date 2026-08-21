import type { NextRequest } from "next/server";

/**
 * URL publique du site, utilisée pour construire les URL de retour envoyées à
 * des services externes. `NEXT_PUBLIC_SITE_URL` prime : derrière un proxy,
 * l'origine de la requête n'est pas forcément celle vue par le client.
 */
export function getSiteBaseUrl(request: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    request.nextUrl.origin
  );
}
