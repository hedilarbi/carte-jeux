import { subscriptions } from "@/components/site/home/home-data";
import { HomeIcon } from "@/components/site/home/home-icons";
import { SectionHeading } from "@/components/site/home/section-heading";

export function SubscriptionsSection() {
  return (

    <div className="mx-auto max-w-[1400px] lg:ml-[100px] lg:mr-[50px] px-6 mt-16">
      <SectionHeading
        actionHref="#products"
        actionLabel="Voir tout"
        eyebrow="// Pass & Sub"
        title="Abonnements gaming"
      />

      <div className="scrollbar-none -mx-6 overflow-x-auto px-6 py-3">
        <div className="flex gap-4">

          {subscriptions.map((subscription) => (
            <article
              className="group w-[190px] shrink-0 rounded-2xl border border-brand-ice/14 bg-[#0F0F28] p-5 text-center transition hover:-translate-y-1 hover:border-brand-lavender/45 hover:bg-[#4848c3] sm:w-[210px]"
              key={subscription.name}
            >
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-lavender/12 text-brand-lavender">
                <HomeIcon
                  className="size-6 transition group-hover:scale-110"
                  name={subscription.icon}
                />
              </span>
              <h3 className="mt-4 min-h-10 font-heading text-xs font-bold leading-5 text-white">
                {subscription.name}
              </h3>

              <p className="font-mono text-sm font-bold text-[#CABEE4]">
                {subscription.price} TND
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>

  );
}
