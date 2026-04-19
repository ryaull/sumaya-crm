"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createAppointment, getAppointmentsForDate } from "@/lib/clinic-firestore";
import { SERVICES, TIME_SLOTS } from "@/lib/clinic-data";
import {
  formatCurrency,
  formatDateLabel,
  formatTimeLabel,
  getTodayDate,
} from "@/lib/clinic-utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useCurrentUser } from "@/lib/use-current-user";
import { ServiceId } from "@/types";

const defaultDate = getTodayDate();

function getMockBookedSlots(date: string) {
  const day = Number(date.split("-")[2] || "0");
  return [TIME_SLOTS[day % TIME_SLOTS.length], TIME_SLOTS[(day + 7) % TIME_SLOTS.length]].filter(
    Boolean,
  );
}

export default function BookingPage() {
  const { language, t } = useLanguage();
  const { user, profile } = useCurrentUser();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    confirmPhone: "",
    service: "opd" as ServiceId,
    date: defaultDate,
    time: "",
  });
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const confirmPhoneLabel =
    language === "np"
      ? "\u092B\u094B\u0928 \u0928\u092E\u094D\u092C\u0930 \u092B\u0947\u0930\u093F \u0932\u0947\u0916\u094D\u0928\u0941\u0939\u094B\u0938\u094D"
      : "Confirm Phone Number";
  const phoneHelper =
    language === "np"
      ? "\u092C\u0941\u0915\u093F\u0919 \u0924\u094D\u0930\u0941\u091F\u093F \u0928\u0939\u094B\u0938\u094D \u092D\u0928\u0947\u0930 \u0909\u0939\u0940 \u0928\u092E\u094D\u092C\u0930 \u0926\u0941\u0908 \u092A\u091F\u0915 \u0932\u0947\u0916\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964"
      : "Enter the same number twice to avoid booking mistakes.";
  const phoneMismatchMessage =
    language === "np"
      ? "\u0926\u0941\u0908\u091F\u0948 \u092B\u094B\u0928 \u0928\u092E\u094D\u092C\u0930 \u090F\u0915\u0948 \u0939\u0941\u0928\u0941\u092A\u0930\u094D\u091B\u0964"
      : "Phone numbers must match.";
  const bookingNotesLabel =
    language === "np" ? "\u092C\u0941\u0915\u093F\u0919 \u0928\u094B\u091F" : "Booking notes";
  const bookingNotesTitle =
    language === "np"
      ? "\u0938\u092B\u093E \u0930 \u0926\u094D\u0935\u093F\u092D\u093E\u0937\u093F\u0915 \u0905\u092A\u094B\u0907\u0928\u094D\u091F\u092E\u0947\u0928\u094D\u091F \u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E\u0964"
      : "Clean, bilingual appointment flow.";
  const slotHelper =
    language === "np"
      ? "\u0938\u092E\u092F \u0926\u094B\u0939\u094B\u0930\u093F\u0928 \u0928\u0926\u093F\u0928 \u092C\u0941\u0915 \u092D\u090F\u0915\u093E \u0938\u092E\u092F\u0939\u0930\u0942 \u091B\u093E\u0928\u094D\u0928 \u092E\u093F\u0932\u094D\u0926\u0948\u0928\u0964"
      : "Booked slots are disabled to avoid overlap.";
  const bookingHighlights = [
    {
      label: "Guest booking",
      value: "Open",
      note: "Patients can request appointments without creating an account.",
    },
    {
      label: "Phone double-check",
      value: "Required",
      note: "The same number must be entered twice before submission.",
    },
    {
      label: user?.uid ? "Account link" : "Optional account",
      value: user?.uid ? "Enabled" : "Available",
      note: user?.uid
        ? "This booking will appear in your personalized history after login."
        : "Sign in any time if you want future bookings linked to your own history.",
    },
  ];
  const accountName =
    profile?.name || user?.displayName || user?.email?.split("@")[0] || "Patient";

  useEffect(() => {
    const loadSlots = async () => {
      try {
        setLoadingSlots(true);
        const appointments = await getAppointmentsForDate(form.date);
        setBusySlots(appointments.map((appointment) => appointment.time));
      } catch {
        setBusySlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    void loadSlots();
  }, [form.date]);

  const selectedService = SERVICES.find((service) => service.id === form.service) ?? SERVICES[0];
  const bookedSlots = useMemo(
    () => new Set([...busySlots, ...getMockBookedSlots(form.date)]),
    [busySlots, form.date],
  );
  const phoneMismatch =
    Boolean(form.phone.trim() && form.confirmPhone.trim()) &&
    form.phone.trim() !== form.confirmPhone.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    if (phoneMismatch) {
      setError(phoneMismatchMessage);
      setSubmitting(false);
      return;
    }

    try {
      await createAppointment({
        name: form.name,
        phone: form.phone,
        bookedByUid: user?.uid ?? null,
        bookedByEmail: user?.email ?? null,
        service: form.service,
        date: form.date,
        time: form.time,
        source: "online",
        status: "pending",
        paymentStatus: "pending",
        paymentMode: null,
      });

      setMessage(
        `Appointment request submitted for ${formatDateLabel(form.date)} at ${formatTimeLabel(form.time)}.`,
      );
      setForm((current) => ({
        ...current,
        name: "",
        phone: "",
        confirmPhone: "",
        time: "",
      }));
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message === "slot_taken") {
        setError("That slot is already booked. Please choose another time.");
      } else {
        setError("Booking could not be saved right now.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-shell py-8 sm:py-12">
      <section className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <div className="card-surface px-6 py-8 sm:px-8">
          <span className="eyebrow">{t("bookingTitle")}</span>
          <h1 className="mt-5 section-title">{t("bookingTitle")}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            {t("bookingDescription")}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {bookingHighlights.map((highlight) => (
              <div key={highlight.label} className="surface-muted px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  {highlight.label}
                </p>
                <p className="mt-2 font-semibold text-slate-950">{highlight.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{highlight.note}</p>
              </div>
            ))}
          </div>

          {message ? (
            <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
            <div className="rounded-[28px] border border-[color:var(--border)] bg-slate-50/80 p-4 sm:p-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  {t("name")}
                  <input
                    className="field-input"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder={t("name")}
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
                      placeholder={t("phone")}
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
                      placeholder={confirmPhoneLabel}
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

              {profile?.role === "user" && user?.uid ? (
                <p className="mt-2 text-xs leading-6 text-teal-700">
                  This booking will be linked to your account so it appears in your personalized
                  history after login.
                </p>
              ) : null}
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
                  min={defaultDate}
                  className="field-input"
                  value={form.date}
                  onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                  required
                />
              </label>
            </div>

            <div className="rounded-[28px] border border-[color:var(--border)] bg-slate-50/80 p-4 sm:p-5">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                {t("timeSlot")}
                <select
                  className="field-select"
                  value={form.time}
                  onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                  required
                >
                  <option value="">Select a slot</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot} disabled={bookedSlots.has(slot)}>
                      {formatTimeLabel(slot)} {bookedSlots.has(slot) ? `(${t("booked")})` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-4 grid gap-3 rounded-[24px] border border-[color:var(--border)] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{t("service")}</p>
                  <span className="chip status-blue">{formatCurrency(selectedService.price)}</span>
                </div>
                <p className="font-display text-3xl">{t(selectedService.key)}</p>
                <p className="text-sm leading-7 text-slate-600">{t(selectedService.descriptionKey)}</p>
              </div>
            </div>

            <button
              className="btn-primary w-full"
              type="submit"
              disabled={submitting || !form.time || phoneMismatch}
            >
              {submitting ? "Submitting..." : t("submitBooking")}
            </button>
          </form>
        </div>

        <div className="grid gap-6">
          <div className="card-surface px-6 py-8 sm:px-8">
            <span className="eyebrow">{t("availableSlots")}</span>
            <h2 className="mt-5 font-display text-4xl">
              {formatDateLabel(form.date, language === "np" ? "ne-NP" : "en-US")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {loadingSlots ? `${t("loading")}...` : slotHelper}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {TIME_SLOTS.map((slot) => {
                const isBooked = bookedSlots.has(slot);
                const isSelected = form.time === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isBooked}
                    onClick={() => setForm((current) => ({ ...current, time: slot }))}
                    className={`rounded-[24px] border px-4 py-4 text-left ${
                      isBooked
                        ? "border-rose-100 bg-rose-50 text-rose-500"
                        : isSelected
                          ? "border-teal-200 bg-teal-50 text-slate-950"
                          : "border-[color:var(--border)] bg-white text-slate-700"
                    }`}
                  >
                    <p className="font-semibold">{formatTimeLabel(slot)}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em]">
                      {isBooked ? t("booked") : t("available")}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card-surface px-6 py-8 sm:px-8">
            <span className="eyebrow">{bookingNotesLabel}</span>
            <h2 className="mt-5 font-display text-4xl">{bookingNotesTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {user?.uid
                ? `Signed in as ${accountName}. Your booking can be linked to ${user?.email || "your account"}.`
                : "Guest booking is available now, and patients can also sign in later for personalized history."}
            </p>

            <div className="mt-6 grid gap-3">
              <div className="surface-muted px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Before you submit</p>
                <p className="mt-2 text-sm leading-7 text-slate-700">
                  Double-check the phone number, choose an available slot, and confirm the correct
                  service so reception sees a clean request.
                </p>
              </div>
              <div className="surface-muted px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">After submission</p>
                <p className="mt-2 text-sm leading-7 text-slate-700">
                  Reception can confirm, complete, reschedule, or mark payment from the shared
                  appointments dashboard.
                </p>
              </div>
              <div className="surface-muted px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Demo mode</p>
                <p className="mt-2 text-sm leading-7 text-slate-700">{t("demoModeNotice")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
