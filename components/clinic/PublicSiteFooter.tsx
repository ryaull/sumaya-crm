"use client";

import Link from "next/link";
import { CLINIC_CONTACT, SERVICES } from "@/lib/clinic-data";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function PublicSiteFooter() {
  const { language, t } = useLanguage();
  const quickLinksLabel =
    language === "np" ? "\u0926\u094d\u0930\u0941\u0924 \u0932\u093f\u0919\u094d\u0915" : "Quick links";
  const contactLabel =
    language === "np" ? "\u0938\u092e\u094d\u092a\u0930\u094d\u0915" : "Contact";
  const servicesLabel =
    language === "np"
      ? "\u0932\u094b\u0915\u092a\u094d\u0930\u093f\u092f \u0938\u0947\u0935\u093e"
      : "Popular services";

  return (
    <footer className="pb-8 pt-4">
      <div className="section-shell">
        <div className="card-surface px-6 py-8 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.75fr_0.85fr]">
            <div>
              <p className="font-display text-3xl">{t("clinicName")}</p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                {t("clinicTagline")}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/book" className="btn-secondary px-4 py-2">
                  {t("bookAppointment")}
                </Link>
                <Link
                  href="/history"
                  className="btn-ghost rounded-full border border-[color:var(--border)] bg-slate-50/90 px-4 py-2"
                >
                  {t("navHistory")}
                </Link>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                {quickLinksLabel}
              </p>
              <div className="mt-4 grid gap-2 text-sm text-slate-700">
                <Link href="/" className="hover:text-slate-950">
                  {t("navHome")}
                </Link>
                <Link href="/book" className="hover:text-slate-950">
                  {t("navBook")}
                </Link>
                <Link href="/history" className="hover:text-slate-950">
                  {t("navHistory")}
                </Link>
              </div>
            </div>

            <div className="grid gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {contactLabel}
                </p>
                <div className="mt-4 grid gap-2 text-sm text-slate-700">
                  <p>{CLINIC_CONTACT.location}</p>
                  <a href={`tel:${CLINIC_CONTACT.phone}`} className="hover:text-slate-950">
                    {CLINIC_CONTACT.phone}
                  </a>
                  <a
                    href={`https://wa.me/${CLINIC_CONTACT.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-slate-950"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {servicesLabel}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SERVICES.slice(0, 4).map((service) => (
                    <span
                      key={service.id}
                      className="rounded-full border border-[color:var(--border)] bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {t(service.key)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
