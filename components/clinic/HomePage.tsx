"use client";

import Link from "next/link";
import { CLINIC_CONTACT, GALLERY_IMAGES, SERVICES } from "@/lib/clinic-data";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatCurrency } from "@/lib/clinic-utils";

export default function HomePage() {
  const { t } = useLanguage();
  const featuredImage = GALLERY_IMAGES[0];
  const previewImages = GALLERY_IMAGES.slice(1);
  const highlights = [
    {
      label: "Services",
      value: "7",
      note: "OPD, scans, pharmacy, and dressing in one place.",
    },
    {
      label: "Slot length",
      value: "15 min",
      note: "Short, structured appointments with no overlap.",
    },
    {
      label: "Access",
      value: "Guest + login",
      note: "Patients can book directly and staff can manage the queue.",
    },
  ];
  const workflowSteps = [
    {
      step: "01",
      title: "Book online or walk in",
      description:
        "Patients can send appointment requests without login, while reception can add walk-ins from the same queue.",
    },
    {
      step: "02",
      title: "Confirm, complete, and collect payment",
      description:
        "Front desk staff manage appointment status, payment mode, and payment status from one table.",
    },
    {
      step: "03",
      title: "Follow up and review reports",
      description:
        "Owners and admins can track follow-ups, today's patients, and revenue trends without leaving the dashboard.",
    },
  ];

  return (
    <div className="section-shell py-8 sm:py-16">
      {/* Hero Bento Box */}
      <section className="relative grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        
        {/* Main CTA Panel */}
        <div className="card-surface px-6 py-10 sm:px-14 sm:py-20 flex flex-col justify-center border-none bg-slate-50">
          <div className="flex flex-wrap gap-2">
            <span className="eyebrow bg-sky-100 text-sky-800">{t("clinicName")}</span>
            <span className="eyebrow bg-emerald-100 text-emerald-800">English + Nepali</span>
          </div>
          <h1 className="mt-8 font-display text-4xl sm:text-5xl lg:text-[4rem] font-medium tracking-tight text-slate-900 leading-none">
            {t("heroTitle")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {t("heroDescription")}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/book" className="btn-primary flex-1 sm:flex-none text-center">
              {t("bookAppointment")}
            </Link>
            <a href={`tel:${CLINIC_CONTACT.phone}`} className="btn-secondary">
              {t("callNow")}
            </a>
          </div>
        </div>

        {/* Floating Side Panels */}
        <div className="grid gap-6">
          <div className="card-panel px-8 py-10 flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wider text-teal-200 uppercase">Featured Service</p>
              <h2 className="mt-3 font-display text-3xl font-medium text-white">{t(featuredImage.titleKey)}</h2>
              <p className="mt-3 text-teal-100 leading-relaxed text-sm">
                {t(featuredImage.descriptionKey)}
              </p>
            </div>
            
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {SERVICES.slice(0, 4).map((service) => (
                <div key={service.id} className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur-sm border border-white/10">
                  <p className="text-sm font-medium text-white">{t(service.key)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {highlights.slice(0, 2).map((highlight) => (
              <div key={highlight.label} className="card-surface px-6 py-6 border-none bg-slate-50 flex flex-col justify-center items-center text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {highlight.label}
                </p>
                <p className="mt-3 font-display text-4xl font-medium text-sky-600">{highlight.value}</p>
              </div>
            ))}
          </div>
        </div>

      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">{t("servicesTitle")}</span>
            <h2 className="section-title mt-4">{t("servicesTitle")}</h2>
          </div>
          <Link href="/history" className="btn-ghost">
            {t("navHistory")}
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {SERVICES.map((service) => (
            <div key={service.id} className="card-surface px-6 py-6">
              <div className="flex items-start justify-between gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold text-slate-950"
                  style={{ backgroundColor: service.accent }}
                >
                  {t(service.key)}
                </div>
                <span className="chip status-blue">{formatCurrency(service.price)}</span>
              </div>
              <p className="mt-4 font-display text-3xl">{t(service.key)}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{t(service.descriptionKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="card-surface px-6 py-10 sm:px-10">
          <div>
            <span className="eyebrow">Clinic workflow</span>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl">
              A cleaner way to run the clinic
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Booking, payments, follow-ups, and reports all stay connected, which keeps the patient
              journey simple and the front desk calm.
            </p>
          </div>

          <div className="mt-8 grid gap-4">
            {workflowSteps.map((step) => (
              <div key={step.step} className="surface-muted flex gap-4 px-5 py-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                  {step.step}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-950">{step.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface px-6 py-10 sm:px-8">
          <div>
            <span className="eyebrow">{t("galleryTitle")}</span>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl">{t("galleryTitle")}</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              {t("gallerySubtitle")}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {GALLERY_IMAGES.map((image) => (
              <div
                key={image.titleKey}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
              >
                <img src={image.src} alt={t(image.titleKey)} className="h-40 w-full object-cover" />
                <div className="px-5 py-5">
                  <p className="font-semibold text-zinc-900">{t(image.titleKey)}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {t(image.descriptionKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 surface-muted px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Reach the clinic</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{CLINIC_CONTACT.location}</p>
              </div>
              <a href={`tel:${CLINIC_CONTACT.phone}`} className="btn-secondary px-4 py-2">
                {t("callNow")}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
