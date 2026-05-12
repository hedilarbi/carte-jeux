import type { Metadata } from "next";
import { Exo_2, Orbitron } from "next/font/google";
import { PublicShell } from "@/components/site/public-shell";
import "./globals.css";

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

export const metadata: Metadata = {
  title: {
    default: "GameZone TN - Recharges & Gift Cards",
    template: "%s | GameZone TN",
  },
  description:
    "Plateforme tunisienne de recharges gaming, gift cards et abonnements avec paiement en TND.",
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
      className={`${exo2.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground font-sans max-w-screen">
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}
