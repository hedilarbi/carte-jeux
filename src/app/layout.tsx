import type { Metadata } from "next";
import { Exo_2, Inter, Orbitron, Rubik } from "next/font/google";
import Script from "next/script";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";

import { PublicShell } from "@/components/site/public-shell";
import { CurrencyProvider } from "@/components/site/providers/currency-provider";
import "./globals.css";

import { GclidTracker } from "@/components/site/gclid-tracker";

const GOOGLE_TAG_MANAGER_ID = "GTM-NVN6KW9R";
const GOOGLE_ANALYTICS_ID = "G-RM7SCXRTE7";
const META_PIXEL_ID = "1392706789651661";

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

const rubik = Rubik({
  variable: "--font-rubik",
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
      className={`${exo2.variable} ${orbitron.variable} ${inter.variable} ${rubik.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground font-sans max-w-screen">
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){
              if(f.fbq)return;
              n=f.fbq=function(){
                n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)
              };
              if(!f._fbq)f._fbq=n;
              n.push=n;
              n.loaded=!0;
              n.version='2.0';
              n.queue=[];
              t=b.createElement(e);
              t.async=!0;
              t.src=v;
              s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)
            }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1" alt="" />`,
          }}
        />
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
