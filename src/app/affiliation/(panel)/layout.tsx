import { AffiliateShell } from "@/components/affiliate/affiliate-shell";
import { requireAffiliatePageAccess } from "@/lib/auth/affiliate";

export default async function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAffiliatePageAccess();

  return <AffiliateShell session={session}>{children}</AffiliateShell>;
}
