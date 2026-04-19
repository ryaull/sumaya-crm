"use client";

import { FormEvent, useMemo, useState } from "react";
import { createAppointment } from "@/lib/clinic-firestore";
import {
  PAYMENT_MODE_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  SERVICES,
  TIME_SLOTS,
} from "@/lib/clinic-data";
import { formatCurrency, getRoundedCurrentTimeSlot, getTodayDate } from "@/lib/clinic-utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { PaymentMode, PaymentStatus, ServiceId } from "@/types";

function getDefaultWalkInTime() {
  const rounded = getRoundedCurrentTimeSlot();
  return TIME_SLOTS.includes(rounded) ? rounded : TIME_SLOTS[0];
}

export default function WalkInPage() {
  const { language, t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    confirmPhone: "",
    service: "opd" as ServiceId,
    date: getTodayDate(),
    time: getDefaultWalkInTime(),
    paymentStatus: "pending" as PaymentStatus,
    paymentMode: "cash" as PaymentMode,
  });
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState("");
  const [error, setError] = useState("");

  const selectedService = useMemo(
    () => SERVICES.find((service) => service.id === form.service) ?? SERVICES[0],
    [form.service],
  );
  const confirmPhoneLabel =
    language === "np"
      ? "\u092B\u094B\u0928 \u0928\u092E\u094D\u092C\u0930 \u092B\u0947\u0930\u093F \u0932\u0947\u0916\u094D\u0928\u0941\u0939\u094B\u0938\u094D"
      : "Confirm Phone Number";
  const phoneHelper =
    language === "np"
      ? "\u092B\u094D\u0930\u0928\u094D\u091F \u0921\u0947\u0938\u094D\u0915\u092E\u093E \u0917\u0932\u094D\u0924\u0940 \u0928\u092D\u090F\u0930 \u0928\u092E\u094D\u092C\u0930 \u0926\u0941\u0908 \u092A\u091F\u0915 \u0932\u0947\u0916\u094D\u0928\u0941\u092A\u0930\u094D\u091B\u0964"
      : "Write the number twice so the front desk can avoid mistakes.";
  const phoneMismatchMessage =
    language === "np"
      ? "\u0926\u0941\u0908\u091F\u0948 \u092B\u094B\u0928 \u0928\u092E\u094D\u092C\u0930 \u090F\u0915\u0948 \u0939\u0941\u0928\u0941\u092A\u0930\u094D\u091B\u0964"
      : "Phone numbers must match.";
  const phoneMismatch =
    Boolean(form.phone.trim() && form.confirmPhone.trim()) &&
    form.phone.trim() !== form.confirmPhone.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setBanner("");

    if (phoneMismatch) {
      setError(phoneMismatchMessage);
      setSubmitting(false);
      return;
    }

    try {
      await createAppointment({
        name: form.name,
        phone: form.phone,
        service: form.service,
        date: form.date,
        time: form.time,
        paymentStatus: form.paymentStatus,
        paymentMode: form.paymentMode,
        source: "walk-in",
        status: "confirmed",
      });
      setBanner(`Walk-in saved for ${form.name || "patient"} at ${form.time}.`);
      setForm((current) => ({
        ...current,
        name: "",
        phone: "",
        confirmPhone: "",
        service: "opd",
        paymentStatus: "pending",
        paymentMode: "cash",
      }));
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message === "slot_taken") {
        setError("That time is already in use. Please choose a different slot.");
      } else {
        setError("Walk-in could not be saved.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card-surface px-6 py-8 sm:px-8">
        <span className="eyebrow">{t("addWalkIn")}</span>
        <h1 className="mt-5 section-title">{t("addWalkIn")}</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          Capture walk-in patients in the same appointment flow so front desk and owner reports
          stay aligned.
        </p>
      </section>

      {banner ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {banner}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <form className="card-surface grid gap-5 px-6 py-8 sm:px-8" onSubmit={handleSubmit}>
          <div className="rounded-[28px] border border-[color:var(--border)] bg-slate-50/80 p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                {t("name")}
                <input
                  className="field-input"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                />
              </label>

              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  {t("phone")}
                  <input
                    className="field-input"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  {confirmPhoneLabel}
                  <input
                    className={`field-input ${phoneMismatch ? "border-rose-300" : ""}`}
                    inputMode="tel"
                    value={form.confirmPhone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, confirmPhone: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>
            </div>

            <p
              className={`mt-3 text-xs leading-6 ${
                phoneMismatch ? "text-rose-600" : "text-slate-500"
              }`}
            >
              {phoneMismatch ? phoneMismatchMessage : phoneHelper}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              {t("service")}
              <select
                className="field-select"
                value={form.service}
                onChange={(event) =>
                  setForm((current) => ({ ...current, service: event.target.value as ServiceId }))
                }
              >
                {SERVICES.map((service) => (
                  <option key={service.id} value={service.id}>
                    {t(service.key)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              {t("date")}
              <input
                type="date"
                className="field-input"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              {t("timeSlot")}
              <select
                className="field-select"
                value={form.time}
                onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              {t("payment")}
              <select
                className="field-select"
                value={form.paymentStatus}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    paymentStatus: event.target.value as PaymentStatus,
                  }))
                }
              >
                {PAYMENT_STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {t(status.key)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              {t("paymentMode")}
              <select
                className="field-select"
                value={form.paymentMode ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    paymentMode: (event.target.value || null) as PaymentMode,
                  }))
                }
              >
                {PAYMENT_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.key)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button className="btn-primary w-full" type="submit" disabled={submitting || phoneMismatch}>
            {submitting ? "Saving..." : "+ Add Walk-in Patient"}
          </button>
        </form>

        <div className="grid gap-6">
          <div className="card-surface px-6 py-8 sm:px-8">
            <span className="eyebrow">{t("service")}</span>
            <h2 className="mt-5 font-display text-4xl">{t(selectedService.key)}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{t(selectedService.descriptionKey)}</p>
            <div className="mt-5 rounded-[24px] border border-[color:var(--border)] bg-slate-50/80 px-4 py-4">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Auto price</p>
              <p className="mt-2 font-display text-4xl">{formatCurrency(selectedService.price)}</p>
            </div>
          </div>

          <div className="card-surface px-6 py-8 sm:px-8">
            <h3 className="font-display text-3xl">Unified workflow</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Walk-ins land in the same appointments collection as online bookings, so status
              changes, payment tracking, follow-ups, and reports stay consistent.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
