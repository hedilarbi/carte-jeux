import type { Metadata } from "next";
import { Exo_2, Inter, Orbitron } from "next/font/google";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";

import { PublicShell } from "@/components/site/public-shell";
import { CurrencyProvider } from "@/components/site/providers/currency-provider";
import "./globals.css";

import { GclidTracker } from "@/components/site/gclid-tracker";

const GOOGLE_TAG_MANAGER_ID = "GTM-NVN6KW9R";
const GOOGLE_ANALYTICS_ID = "G-RM7SCXRTE7";

const exo2 = Exo_2({
  variable: "--font-exo-2",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter-family",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PlayDepot | Jeux Vidéo & Cartes Cadeaux en Dinar",
    template: "%s | PlayDepot",
  },
  description:
    "La référence en Tunisie pour acheter des jeux vidéo, cartes PSN, Steam, Xbox, Nintendo et abonnements gaming. Paiement rapide en dinars.",
  verification: {
    google: "sS1D7_f2AaqxymBvXZeIAPloqL00G9_dyHExx6RZAbw",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      data-theme="dark"
      lang="fr"
      className={`${exo2.variable} ${orbitron.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground font-sans max-w-screen">
        <GclidTracker />
        <CurrencyProvider>
          <PublicShell>{children}</PublicShell>
        </CurrencyProvider>
        <GoogleTagManager gtmId={GOOGLE_TAG_MANAGER_ID} />
        <GoogleAnalytics gaId={GOOGLE_ANALYTICS_ID} />
      </body>
    </html>
  );
}
