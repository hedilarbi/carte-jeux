import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { FaFacebookF } from "react-icons/fa6";

import { AuthForm, type AuthFormField } from "@/components/site/auth/auth-form";

type AuthPanelProps = {
  endpoint?: string;
  eyebrow: string;
  fields?: AuthFormField[];
  form?: ReactNode;
  footer: ReactNode;
  forgotPasswordHref?: string;
  forgotPasswordLabel?: string;
  helper?: ReactNode;
  hiddenFields?: Record<string, string | undefined>;
  sideContent?: ReactNode;
  sideTitle?: ReactNode;
  showSocial?: boolean;
  submitLabel?: string;
  successRedirect?: string;
  successText?: string;
  title: string;
};

export function AuthPanel({
  endpoint,
  eyebrow,
  fields,
  form,
  footer,
  forgotPasswordHref,
  forgotPasswordLabel,
  helper,
  hiddenFields,
  sideContent,
  sideTitle,
  showSocial = true,
  submitLabel,
  successRedirect,
  successText,
  title,
}: AuthPanelProps) {
  return (
    <main className="min-h-screen bg-white text-[#00061E]">
      <section className="grid min-h-screen lg:grid-cols-[56vw_44vw]">
        <aside className="relative hidden min-h-screen overflow-hidden bg-[#012D69] px-12 py-8 text-white backdrop-blur-xl lg:block xl:px-[94px]">
          <Link aria-label="PlaySDepot" className="relative z-10 inline-block" href="/">
            <Image
              alt="PlaySDepot"
              className="h-auto w-[183px]"
              height={122}
              priority
              src="/logo_white.webp"
              width={183}
            />
          </Link>

          <div className="pointer-events-none absolute -left-[110px] -top-[190px] size-[280px] rounded-full bg-[radial-gradient(70.71%_70.71%_at_50%_50%,rgba(0,255,224,0.055)_0%,rgba(0,255,224,0)_70%)]" />

          <div className="relative z-10 mt-[130px] max-w-[780px]">
            {sideContent ?? (
              <h1 className="font-heading text-[clamp(58px,4.75vw,91px)] font-extrabold leading-[1.42] tracking-[0.03em] text-white">
                {sideTitle ?? (
                  <>
                    Bonjour !<br />
                    C&apos;est un plaisir de vous voir !
                  </>
                )}
              </h1>
            )}
          </div>
        </aside>

        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(90deg,#E3CDFF_0%,#D8E0FF_67.31%,#C9CAFF_100%)] px-6 py-24 lg:px-10">
          <div className="pointer-events-none absolute -left-[110px] -top-[190px] size-[280px] rounded-full bg-[radial-gradient(70.71%_70.71%_at_50%_50%,rgba(0,255,224,0.055)_0%,rgba(0,255,224,0)_70%)]" />

          <div className="w-full max-w-[520px] rounded-[24px] bg-white/88 p-6 shadow-[0_24px_70px_rgba(1,45,105,0.18)] backdrop-blur sm:p-8 lg:p-10">
            <Link aria-label="PlaySDepot" className="mb-8 inline-block lg:hidden" href="/">
              <Image
                alt="PlaySDepot"
                className="h-auto w-[150px]"
                height={100}
                priority
                src="/logo.webp"
                width={150}
              />
            </Link>

            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#8258CB]">
                {eyebrow}
              </p>
              <h2 className="mt-3 font-heading text-2xl font-black leading-tight text-[#012D69] sm:text-3xl">
                {title}
              </h2>
              {helper ? (
                <div className="mt-3 text-sm font-semibold leading-6 text-[#00061E]/60">
                  {helper}
                </div>
              ) : null}
            </div>

            {showSocial ? (
              <>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <SocialButton
                    href="/api/auth/oauth/google"
                    icon={<Mail className="size-4" />}
                    label="Google"
                  />
                  <SocialButton
                    href="/api/auth/oauth/facebook"
                    icon={<FaFacebookF className="size-4" />}
                    label="Facebook"
                  />
                </div>

                <div className="my-7 flex items-center gap-4">
                  <span className="h-px flex-1 bg-[#DADDFF]" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#012D69]/50">
                    ou
                  </span>
                  <span className="h-px flex-1 bg-[#DADDFF]" />
                </div>
              </>
            ) : (
              <div className="mt-8" />
            )}

            {form ??
              (endpoint && fields && submitLabel ? (
                <AuthForm
                  endpoint={endpoint}
                  fields={fields}
                  forgotPasswordHref={forgotPasswordHref}
                  forgotPasswordLabel={forgotPasswordLabel}
                  hiddenFields={hiddenFields}
                  submitLabel={submitLabel}
                  successRedirect={successRedirect}
                  successText={successText}
                />
              ) : null)}

            <div className="mt-6 text-center text-sm font-semibold text-[#00061E]/62">
              {footer}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SocialButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      className="flex h-12 items-center justify-center gap-2 rounded-[14px] border border-[#DADDFF] bg-white px-4 text-sm font-black text-[#012D69] transition hover:border-[#A582ED] hover:bg-[#F8F9FF]"
      href={href}
    >
      {icon}
      {label}
    </Link>
  );
}
