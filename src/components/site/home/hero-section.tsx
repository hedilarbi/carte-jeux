import Link from "next/link";
import { BadgeCheck, Clock3, Headphones, ShieldCheck } from "lucide-react";
import { IoGameController, IoLogoWhatsapp } from "react-icons/io5";
import Image from "next/image";

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
    <div>

      <section className="relative min-h-[420px] w-full overflow-hidden py-10" id="home" >


        <div className="relative mx-auto grid min-h-[420px] max-w-[1200px]  gap-20 px-6 pt-8  lg:grid-cols-[1.4fr_0.6fr]">
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
              Steam, PlayStation, Xbox, Nintendo, Free Fire, PUBG — rechargez vos jeux préférés en quelques secondes. <br />


            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,var(--brand-orchid),var(--brand-blue-mist))] px-5 py-2 text-sm font-bold font-body uppercase text-black transition hover:shadow-[0_8px_28px_rgba(243,252,255,0.58)]"
                href="/produits"
              >
                <IoGameController size={24} />
                Voir les produits

              </Link>
              <Link
                className="font-body inline-flex items-center justify-center gap-2 rounded-xl border border-brand-orchid px-5 py-2 text-sm font-bold uppercase text-brand-orchid transition hover:bg-brand-lavender/30"
                href="https://wa.me/21600000000"
                target="_blank"
              >
                <IoLogoWhatsapp size={24} />
                WhatsApp
              </Link>
            </div>


          </div>
          <div className="grid grid-cols-2 gap-4">
            <Image
              alt="Carte PSN"
              className="h-auto w-full"
              src="/psnhero1.png"
              width={150}
              height={200}
            />
            <Image
              alt="Carte PSN"
              className="h-auto w-full"
              src="/psnhero2.png"
              width={207}
              height={256}
            />
            <Image
              alt="Carte PSN"
              className="h-auto w-full"
              src="/psnhero3.png"
              width={207}
              height={256}
            />
            <Image
              alt="Carte PSN"
              className="h-auto w-full"
              src="/psnhero4.png"
              width={207}
              height={256}
            />


          </div>



        </div>

      </section>
      <div className="bg-brand-navy/88  w-full">

        <div className="mx-auto grid  px-6 md:grid-cols-2  xl:grid-cols-4 max-w-[1200px] justify-between ">
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
      </div>
    </div>
  );
}
