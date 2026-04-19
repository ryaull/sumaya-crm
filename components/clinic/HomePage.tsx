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
    <div className="section-shell py-8 sm:py-12">
      <section className="relative overflow-hidden rounded-[38px] border border-[color:var(--border)] bg-white/92 px-6 py-10 shadow-[var(--shadow-soft)] sm:px-10 sm:py-14">
        <div className="hero-glow left-[-8rem] top-[-8rem] bg-teal-200" />
        <div className="hero-glow right-[-6rem] top-[-4rem] bg-sky-200" />
        <div className="relative grid gap-10 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="eyebrow">{t("clinicName")}</span>
              <span className="eyebrow">English + Nepali</span>
            </div>
            <h1 className="mt-6 max-w-3xl font-display text-5xl leading-tight text-slate-950 sm:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              {t("heroDescription")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book" className="btn-primary">
                {t("bookAppointment")}
              </Link>
              <a href={`tel:${CLINIC_CONTACT.phone}`} className="btn-secondary">
                {t("callNow")}
              </a>
              <a
                href={`https://wa.me/${CLINIC_CONTACT.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                {t("whatsApp")}
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {highlights.map((highlight) => (
                <div key={highlight.label} className="surface-muted px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    {highlight.label}
                  </p>
                  <p className="mt-2 font-display text-3xl">{highlight.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{highlight.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="card-surface overflow-hidden">
              <img
                src={featuredImage.src}
                alt={t(featuredImage.titleKey)}
                className="h-72 w-full object-cover sm:h-80"
              />
              <div className="grid gap-4 px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Front desk ready
                    </p>
                    <p className="mt-2 font-display text-3xl">{t(featuredImage.titleKey)}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {t(featuredImage.descriptionKey)}
                    </p>
                  </div>

                  <div className="surface-muted min-w-[11rem] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Today</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      Online + walk-in queue
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      One system for booking, payment, follow-up, and reports.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {SERVICES.slice(0, 4).map((service) => (
                    <div key={service.id} className="surface-muted px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900">{t(service.key)}</p>
                        <span className="chip status-blue">{formatCurrency(service.price)}</span>
                      </div>
                      <p className="mt-2 text-xs leading-6 text-slate-500">
                        {t(service.descriptionKey)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {previewImages.map((image) => (
                <div key={image.src} className="card-surface overflow-hidden">
                  <img src={image.src} alt={t(image.titleKey)} className="h-40 w-full object-cover" />
                  <div className="px-4 py-4">
                    <p className="font-display text-2xl">{t(image.titleKey)}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {t(image.descriptionKey)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
                className="overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-slate-50"
              >
                <img src={image.src} alt={t(image.titleKey)} className="h-36 w-full object-cover" />
                <div className="px-4 py-4">
                  <p className="font-semibold text-slate-900">{t(image.titleKey)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
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
