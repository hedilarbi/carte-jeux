import type { Metadata } from "next";
import { Exo_2, Inter, Orbitron } from "next/font/google";
import Script from "next/script";

import { PublicShell } from "@/components/site/public-shell";
import "./globals.css";

const GOOGLE_TAG_MANAGER_ID = "GTM-N6TLR6P6";
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
      className={`${exo2.variable} ${orbitron.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground font-sans max-w-screen">
        <noscript>
          <iframe
            height="0"
            src={`https://www.googletagmanager.com/ns.html?id=${GOOGLE_TAG_MANAGER_ID}`}
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
            width="0"
          />
        </noscript>
        <PublicShell>{children}</PublicShell>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GOOGLE_TAG_MANAGER_ID}');`}
        </Script>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GOOGLE_ANALYTICS_ID}');`}
        </Script>
      </body>
    </html>
  );
}

