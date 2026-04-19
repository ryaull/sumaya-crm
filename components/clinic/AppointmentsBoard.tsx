"use client";

import { FormEvent, useMemo, useState } from "react";
import { createFollowUpAppointment, updateAppointment } from "@/lib/clinic-firestore";
import { APPOINTMENT_STATUS_OPTIONS, PAYMENT_MODE_OPTIONS, PAYMENT_STATUS_OPTIONS, SERVICES, TIME_SLOTS } from "@/lib/clinic-data";
import { buildWhatsAppUrl, formatCurrency, formatDateLabel, formatTimeLabel, getPaymentClass, getStatusClass, getTodayDate, offsetDate } from "@/lib/clinic-utils";
import { useAppointments } from "@/lib/useAppointments";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { AppointmentRecord, AppointmentStatus, PaymentMode, PaymentStatus } from "@/types";

type BoardMode = "all" | "today" | "follow-up";

type BoardConfig = {
  title: string;
  description: string;
};

const boardContent: Record<BoardMode, BoardConfig> = {
  all: {
    title: "Appointments",
    description: "Manage every patient visit from a unified queue for online bookings and walk-ins.",
  },
  today: {
    title: "Today's Patients",
    description: "A clean front-desk list for everyone scheduled today, sorted by time.",
  },
  "follow-up": {
    title: "Follow-up Queue",
    description: "Track patients who need another visit and send reminders with one click.",
  },
};

function buildConfirmMessage(appointment: AppointmentRecord, serviceLabel: string, language: "en" | "np") {
  if (language === "np") {
    return `तपाईंको ${serviceLabel} अपोइन्टमेन्ट ${formatTimeLabel(appointment.time)} मा कन्फर्म गरिएको छ।`;
  }

  return `Your ${serviceLabel} appointment at ${formatTimeLabel(appointment.time)} is confirmed.`;
}

function buildRescheduleMessage(
  appointment: AppointmentRecord,
  serviceLabel: string,
  nextDate: string,
  nextTime: string,
  language: "en" | "np",
) {
  if (language === "np") {
    return `तपाईंको ${serviceLabel} अपोइन्टमेन्ट ${formatDateLabel(nextDate, "ne-NP")} मा ${formatTimeLabel(nextTime)} का लागि सारिएको छ।`;
  }

  return `Your ${serviceLabel} appointment has been moved to ${formatDateLabel(nextDate)} at ${formatTimeLabel(nextTime)}.`;
}

function buildFollowUpMessage(
  appointment: AppointmentRecord,
  serviceLabel: string,
  nextDate: string,
  nextTime: string,
  language: "en" | "np",
) {
  if (language === "np") {
    return `तपाईंको ${serviceLabel} फलो-अप ${formatDateLabel(nextDate, "ne-NP")} मा ${formatTimeLabel(nextTime)} मा तय गरिएको छ।`;
  }

  return `Your ${serviceLabel} follow-up is scheduled for ${formatDateLabel(nextDate)} at ${formatTimeLabel(nextTime)}.`;
}

export default function AppointmentsBoard({ mode }: { mode: BoardMode }) {
  const { appointments, loading, error, refresh } = useAppointments();
  const { language, t } = useLanguage();
  const [busyId, setBusyId] = useState("");
  const [banner, setBanner] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [rescheduleId, setRescheduleId] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState(getTodayDate());
  const [rescheduleTime, setRescheduleTime] = useState("09:00");
  const [followUpId, setFollowUpId] = useState("");
  const [followUpDate, setFollowUpDate] = useState(offsetDate(getTodayDate(), 7));
  const [followUpTime, setFollowUpTime] = useState("09:00");

  const today = getTodayDate();
  const records = useMemo(() => {
    const sorted = [...appointments];

    if (mode === "today") {
      return sorted.filter((record) => record.date === today);
    }

    if (mode === "follow-up") {
      return sorted.filter((record) => record.tag === "follow-up" || Boolean(record.parentAppointmentId));
    }

    return sorted;
  }, [appointments, mode, today]);

  const handleQuickStatus = async (appointment: AppointmentRecord, status: AppointmentStatus) => {
    try {
      setBusyId(appointment.id);
      setErrorMessage("");
      await updateAppointment(appointment.id, { status });
      setBanner(`Updated ${appointment.name} to ${status}.`);
      await refresh();
    } catch {
      setErrorMessage("Status update failed.");
    } finally {
      setBusyId("");
    }
  };

  const handlePaymentStatus = async (appointment: AppointmentRecord, paymentStatus: PaymentStatus) => {
    try {
      setBusyId(appointment.id);
      setErrorMessage("");
      await updateAppointment(appointment.id, { paymentStatus });
      setBanner(`Payment status updated for ${appointment.name}.`);
      await refresh();
    } catch {
      setErrorMessage("Payment status update failed.");
    } finally {
      setBusyId("");
    }
  };

  const handlePaymentMode = async (appointment: AppointmentRecord, paymentMode: PaymentMode) => {
    try {
      setBusyId(appointment.id);
      setErrorMessage("");
      await updateAppointment(appointment.id, { paymentMode });
      setBanner(`Payment mode updated for ${appointment.name}.`);
      await refresh();
    } catch {
      setErrorMessage("Payment mode update failed.");
    } finally {
      setBusyId("");
    }
  };

  const handleMarkPaid = async (appointment: AppointmentRecord) => {
    try {
      setBusyId(appointment.id);
      setErrorMessage("");
      await updateAppointment(appointment.id, {
        paymentStatus: "paid",
        paymentMode: appointment.paymentMode ?? "cash",
      });
      setBanner(`Marked ${appointment.name} as paid.`);
      await refresh();
    } catch {
      setErrorMessage("Payment update failed.");
    } finally {
      setBusyId("");
    }
  };

  const openReschedule = (appointment: AppointmentRecord) => {
    setRescheduleId(appointment.id);
    setRescheduleDate(appointment.date);
    setRescheduleTime(appointment.time);
  };

  const submitReschedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const appointment = records.find((entry) => entry.id === rescheduleId);

    if (!appointment) {
      return;
    }

    try {
      setBusyId(appointment.id);
      setErrorMessage("");
      await updateAppointment(appointment.id, {
        date: rescheduleDate,
        time: rescheduleTime,
        status: "confirmed",
      });
      setBanner(`Rescheduled ${appointment.name} to ${formatDateLabel(rescheduleDate)} at ${formatTimeLabel(rescheduleTime)}.`);
      setRescheduleId("");
      await refresh();
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message === "slot_taken") {
        setErrorMessage("That slot is already occupied.");
      } else {
        setErrorMessage("Rescheduling failed.");
      }
    } finally {
      setBusyId("");
    }
  };

  const openFollowUp = (appointment: AppointmentRecord) => {
    setFollowUpId(appointment.id);
    setFollowUpDate(offsetDate(appointment.date, 7));
    setFollowUpTime(appointment.time);
  };

  const submitFollowUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const appointment = records.find((entry) => entry.id === followUpId);

    if (!appointment) {
      return;
    }

    try {
      setBusyId(appointment.id);
      setErrorMessage("");
      await createFollowUpAppointment(appointment, followUpDate, followUpTime);
      setBanner(`Created a follow-up for ${appointment.name}.`);
      setFollowUpId("");
      await refresh();
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message === "slot_taken") {
        setErrorMessage("That follow-up slot is already occupied.");
      } else {
        setErrorMessage("Follow-up creation failed.");
      }
    } finally {
      setBusyId("");
    }
  };

  const config = boardContent[mode];

  return (
    <div className="space-y-6">
      <section className="card-surface px-6 py-8 sm:px-8">
        <span className="eyebrow">{config.title}</span>
        <h1 className="mt-5 section-title">{config.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{config.description}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Visible records</p>
          <p className="mt-3 font-display text-4xl">{records.length}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Pending</p>
          <p className="mt-3 font-display text-4xl">{records.filter((record) => record.status === "pending").length}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Paid</p>
          <p className="mt-3 font-display text-4xl">{records.filter((record) => record.paymentStatus === "paid").length}</p>
        </div>
      </section>

      {banner ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {banner}
        </div>
      ) : null}

      {errorMessage || error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage || error}
        </div>
      ) : null}

      <section className="table-shell">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] text-left text-sm">
            <thead className="bg-slate-50/95 text-slate-600">
              <tr>
                <th className="px-5 py-4 font-semibold">{t("name")}</th>
                <th className="px-5 py-4 font-semibold">{t("phone")}</th>
                <th className="px-5 py-4 font-semibold">{t("service")}</th>
                <th className="px-5 py-4 font-semibold">{t("date")} &amp; {t("timeSlot")}</th>
                <th className="px-5 py-4 font-semibold">{t("status")}</th>
                <th className="px-5 py-4 font-semibold">{t("payment")}</th>
                <th className="px-5 py-4 font-semibold">{t("source")}</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((appointment) => {
                const service = SERVICES.find((entry) => entry.id === appointment.service) ?? SERVICES[0];
                const serviceLabel = t(service.key);
                const rescheduleMessage = buildRescheduleMessage(
                  appointment,
                  serviceLabel,
                  rescheduleDate,
                  rescheduleTime,
                  language,
                );
                const followUpMessage = buildFollowUpMessage(
                  appointment,
                  serviceLabel,
                  followUpDate,
                  followUpTime,
                  language,
                );

                return (
                  <tr key={appointment.id} className="border-t border-slate-100 align-top hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-950">{appointment.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {appointment.tag === "follow-up" ? "Follow-up" : "Standard"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{appointment.phone}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{serviceLabel}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {formatCurrency(appointment.price)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <p>{formatDateLabel(appointment.date, language === "np" ? "ne-NP" : "en-US")}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{formatTimeLabel(appointment.time)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="grid gap-2">
                        <span className={`chip ${getStatusClass(appointment.status)}`}>{t(appointment.status)}</span>
                        <select
                          className="field-select min-w-[10rem] bg-white"
                          value={appointment.status}
                          onChange={(event) =>
                            void handleQuickStatus(appointment, event.target.value as AppointmentStatus)
                          }
                          disabled={busyId === appointment.id}
                        >
                          {APPOINTMENT_STATUS_OPTIONS.map((status) => (
                            <option key={status.value} value={status.value}>
                              {t(status.key)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="grid gap-2">
                        <span className={`chip ${getPaymentClass(appointment.paymentStatus)}`}>
                          {appointment.paymentStatus === "half-paid" ? t("halfPaid") : t(appointment.paymentStatus)}
                        </span>
                        <select
                          className="field-select min-w-[10rem] bg-white"
                          value={appointment.paymentStatus}
                          onChange={(event) =>
                            void handlePaymentStatus(appointment, event.target.value as PaymentStatus)
                          }
                          disabled={busyId === appointment.id}
                        >
                          {PAYMENT_STATUS_OPTIONS.map((status) => (
                            <option key={status.value} value={status.value}>
                              {t(status.key)}
                            </option>
                          ))}
                        </select>
                        <select
                          className="field-select min-w-[10rem] bg-white"
                          value={appointment.paymentMode ?? ""}
                          onChange={(event) =>
                            void handlePaymentMode(
                              appointment,
                              (event.target.value || null) as PaymentMode,
                            )
                          }
                          disabled={busyId === appointment.id}
                        >
                          <option value="">Select mode</option>
                          {PAYMENT_MODE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {t(option.key)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <p>{appointment.source === "walk-in" ? t("walkIn") : t("online")}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="grid max-w-[26rem] gap-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn-secondary px-4 py-2"
                            onClick={() => void handleQuickStatus(appointment, "confirmed")}
                            disabled={busyId === appointment.id}
                          >
                            {t("confirm")}
                          </button>
                          <button
                            type="button"
                            className="btn-secondary px-4 py-2"
                            onClick={() => void handleQuickStatus(appointment, "completed")}
                            disabled={busyId === appointment.id}
                          >
                            {t("complete")}
                          </button>
                          <button
                            type="button"
                            className="btn-secondary px-4 py-2"
                            onClick={() => openReschedule(appointment)}
                          >
                            {t("reschedule")}
                          </button>
                          <button
                            type="button"
                            className="btn-secondary px-4 py-2"
                            onClick={() => openFollowUp(appointment)}
                          >
                            {t("addFollowUp")}
                          </button>
                          <button
                            type="button"
                            className="btn-secondary px-4 py-2"
                            onClick={() => void handleMarkPaid(appointment)}
                            disabled={busyId === appointment.id}
                          >
                            {t("markAsPaid")}
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <a
                            href={buildWhatsAppUrl(appointment.phone, buildConfirmMessage(appointment, serviceLabel, language))}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-ghost rounded-full border border-[color:var(--border)] bg-white px-4 py-2"
                          >
                            {t("confirmAppointment")}
                          </a>
                          <a
                            href={buildWhatsAppUrl(appointment.phone, rescheduleMessage)}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-ghost rounded-full border border-[color:var(--border)] bg-white px-4 py-2"
                          >
                            {t("rescheduleMessage")}
                          </a>
                          <a
                            href={buildWhatsAppUrl(appointment.phone, followUpMessage)}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-ghost rounded-full border border-[color:var(--border)] bg-white px-4 py-2"
                          >
                            {t("followUpMessage")}
                          </a>
                        </div>

                        {rescheduleId === appointment.id ? (
                          <form className="grid gap-3 rounded-[24px] border border-[color:var(--border)] bg-slate-50/80 p-4" onSubmit={submitReschedule}>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <input
                                type="date"
                                min={today}
                                className="field-input"
                                value={rescheduleDate}
                                onChange={(event) => setRescheduleDate(event.target.value)}
                              />
                              <select
                                className="field-select"
                                value={rescheduleTime}
                                onChange={(event) => setRescheduleTime(event.target.value)}
                              >
                                {TIME_SLOTS.map((slot) => (
                                  <option key={slot} value={slot}>
                                    {formatTimeLabel(slot)}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button type="submit" className="btn-primary px-4 py-2" disabled={busyId === appointment.id}>
                                Save reschedule
                              </button>
                              <button type="button" className="btn-secondary px-4 py-2" onClick={() => setRescheduleId("")}>
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : null}

                        {followUpId === appointment.id ? (
                          <form className="grid gap-3 rounded-[24px] border border-[color:var(--border)] bg-slate-50/80 p-4" onSubmit={submitFollowUp}>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <input
                                type="date"
                                min={today}
                                className="field-input"
                                value={followUpDate}
                                onChange={(event) => setFollowUpDate(event.target.value)}
                              />
                              <select
                                className="field-select"
                                value={followUpTime}
                                onChange={(event) => setFollowUpTime(event.target.value)}
                              >
                                {TIME_SLOTS.map((slot) => (
                                  <option key={slot} value={slot}>
                                    {formatTimeLabel(slot)}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button type="submit" className="btn-primary px-4 py-2" disabled={busyId === appointment.id}>
                                Create follow-up
                              </button>
                              <button type="button" className="btn-secondary px-4 py-2" onClick={() => setFollowUpId("")}>
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && !records.length ? (
                <tr>
                  <td className="px-5 py-8 text-slate-500" colSpan={8}>
                    No appointments available for this view.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
