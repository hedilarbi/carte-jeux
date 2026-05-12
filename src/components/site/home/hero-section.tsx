import Link from "next/link";
import { BadgeCheck, Clock3, Headphones, ShieldCheck } from "lucide-react";
import { IoGameController, IoLogoWhatsapp } from "react-icons/io5";

export function HeroSection() {
  const trustItems = [
    {
      title: "Livraison instantanée",
      description: "Codes en <2 min",
      icon: Clock3,
    },
    {
      title: "Paiement sécurisé",
      description: "D17, Flouci, e-Dinar",
      icon: ShieldCheck,
    },
    {
      title: "Support 24/7",
      description: "WhatsApp et email",
      icon: Headphones,
    },
    {
      title: "100% authentique",
      description: "Codes officiels garantis",
      icon: BadgeCheck,
    },
  ];
  return (
    <section className="relative min-h-[420px] w-full overflow-hidden" id="home">


      <div className="relative mx-auto grid min-h-[420px] max-w-[1200px]  gap-12 px-6 pt-8  lg:grid-cols-[1.2fr_0.8fr]">
        <div>


          <h1 className=" max-w-4xl font-heading text-xl font-black leading-tight text-white md:text-4xl">
            Recharges Gaming en Tunisie <br />
            <span className="text-white font-medium">
              Codes Steam, PSN, Xbox & Nintendo instantanés
              <br />
            </span>
            <span className="bg-[linear-gradient(90deg,var(--brand-lavender),var(--brand-periwinkle),var(--brand-electric-blue))] bg-clip-text font-medium text-transparent">
              Global
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base font-medium leading-8 text-white md:text-base md:max-w-[520px] ">
            La plateforme #1 en Tunisie pour acheter vos cartes gaming et codes de recharge.
            Steam, PlayStation, Xbox, Nintendo, Free Fire, PUBG — rechargez vos jeux préférés en quelques secondes.
            <strong>Livraison instantanée, paiement sécurisé en dinars tunisiens</strong>.

          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,var(--brand-orchid),var(--brand-blue-mist))] px-5 py-2 text-sm font-bold font-body uppercase text-black transition hover:bg-brand-blue-mist"
              href="#products"
            >
              <IoGameController size={24} />
              Voir les produits

            </Link>
            <Link
              className="font-body inline-flex items-center justify-center gap-2 rounded-xl border border-brand-orchid px-5 py-2 text-sm font-bold uppercase text-brand-orchid transition hover:bg-brand-lavender/10"
              href="https://wa.me/21600000000"
              target="_blank"
            >
              <IoLogoWhatsapp size={24} />
              WhatsApp
            </Link>
          </div>

          <div className="mt-6 grid max-w-[300px] grid-cols-3 gap-12">
            {[
              ["50K+", "Clients"],
              ["99.9%", "Satisfaction"],
              ["<2min", "Livraison"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="font-heading text-2xl font-black text-brand-purple-strong">
                  {value}
                </p>
                <p className=" font-body text-[11px] uppercase text-white">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>



      </div>
      <div className="mx-auto grid  px-6 md:grid-cols-2  xl:grid-cols-4 bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
        {trustItems.map((item) => (
          <div className="flex items-center gap-4 py-5 md:px-6" key={item.title}>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-brand-lavender/20 bg-brand-lavender text-black">
              <item.icon className="size-5" />
            </span>
            <div>
              <h2 className="font-body text-sm font-bold text-white">
                {item.title}
              </h2>
              <p className="mt-1 text-xs text-white">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
