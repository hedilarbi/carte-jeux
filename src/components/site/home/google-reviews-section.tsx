import { Star } from "lucide-react";
import Script from "next/script";

export function GoogleReviewsSection() {
  return (
    <section className="bg-brand-navy py-16">
      <div className="mx-auto max-w-[1350px] px-6 text-center">
        <div className="mb-10 inline-flex flex-col items-center gap-3">
          <span className="font-mono text-[11px] font-bold uppercase text-brand-lavender">
            // Avis Clients
          </span>
          <h2 className="font-heading text-2xl font-bold text-brand-lilac md:text-3xl">
            Ce que disent nos joueurs
          </h2>
          <div className="flex items-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="size-5 fill-current" />
            ))}
          </div>
        </div>

        {/* WIDGET GOOGLE REVIEWS CONTAINER */}
        <div className="mx-auto w-full rounded-[17px] border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.15)] backdrop-blur">
          <div className="sk-ww-google-reviews" data-embed-id="25700774"></div>
          <Script
            src="https://widgets.sociablekit.com/google-reviews/widget.js"
            strategy="lazyOnload"
          />
        </div>
      </div>
    </section>
  );
}
