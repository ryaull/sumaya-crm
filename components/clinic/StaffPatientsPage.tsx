"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { SERVICES } from "@/lib/clinic-data";
import {
  formatCurrency,
  formatDateLabel,
  formatTimeLabel,
  getPaymentClass,
  getStatusClass,
  getTodayDate,
  normalizeValue,
  sortAppointments,
} from "@/lib/clinic-utils";
import { useAppointments } from "@/lib/useAppointments";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { AppointmentRecord } from "@/types";

type StaffPatientRecord = {
  id: string;
  name: string;
  phone: string;
  address: string;
  appointments: AppointmentRecord[];
  totalVisits: number;
  onlineBookings: number;
  walkInVisits: number;
  lastVisit: AppointmentRecord | null;
  nextVisit: AppointmentRecord | null;
};

function buildPatientRecords(records: AppointmentRecord[], today: string) {
  const grouped = new Map<string, StaffPatientRecord>();

  for (const appointment of records) {
    const key = `${appointment.searchName}-${appointment.searchPhone}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.appointments.push(appointment);
      existing.totalVisits += 1;
      existing.onlineBookings += appointment.source === "online" ? 1 : 0;
      existing.walkInVisits += appointment.source === "walk-in" ? 1 : 0;
      if (!existing.address && appointment.address) {
        existing.address = appointment.address;
      }
      continue;
    }

    grouped.set(key, {
      id: key,
      name: appointment.name,
      phone: appointment.phone,
      address: appointment.address || "",
      appointments: [appointment],
      totalVisits: 1,
      onlineBookings: appointment.source === "online" ? 1 : 0,
      walkInVisits: appointment.source === "walk-in" ? 1 : 0,
      lastVisit: null,
      nextVisit: null,
    });
  }

  return Array.from(grouped.values())
    .map((patient) => {
      const appointments = sortAppointments(patient.appointments);
      const pastVisits = appointments.filter((appointment) => appointment.date < today);
      const upcomingAppointments = appointments.filter((appointment) => appointment.date >= today);

      return {
        ...patient,
        appointments,
        lastVisit: pastVisits.at(-1) ?? null,
        nextVisit: upcomingAppointments[0] ?? null,
      };
    })
    .sort((left, right) => {
      const leftLatest = left.appointments.at(-1);
      const rightLatest = right.appointments.at(-1);
      const leftKey = `${leftLatest?.date || ""} ${leftLatest?.time || ""}`;
      const rightKey = `${rightLatest?.date || ""} ${rightLatest?.time || ""}`;
      return rightKey.localeCompare(leftKey);
    });
}

function AppointmentHistoryColumn({
  title,
  appointments,
  language,
  translate,
}: {
  title: string;
  appointments: AppointmentRecord[];
  language: "en" | "np";
  translate: (key: string) => string;
}) {
  return (
    <div className="card-surface px-6 py-8 sm:px-8">
      <h3 className="font-display text-3xl">{title}</h3>
      <div className="mt-5 grid gap-3">
        {appointments.map((appointment) => {
          const service = SERVICES.find((item) => item.id === appointment.service);
          const paymentLabel =
            appointment.paymentStatus === "half-paid"
              ? translate("halfPaid")
              : translate(appointment.paymentStatus);

          return (
            <div key={appointment.id} className="surface-muted px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">
                    {service ? translate(service.key) : appointment.service.toUpperCase()}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatDateLabel(appointment.date, language === "np" ? "ne-NP" : "en-US")} /{" "}
                    {formatTimeLabel(appointment.time)}
                  </p>
                </div>

                <span className={`chip ${getStatusClass(appointment.status)}`}>
                  {translate(appointment.status)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`chip ${getPaymentClass(appointment.paymentStatus)}`}>
                  {paymentLabel}
                </span>
                <span className="chip status-blue">
                  {appointment.source === "walk-in" ? translate("walkIn") : translate("online")}
                </span>
              </div>

              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                {formatCurrency(appointment.price)}
              </p>
            </div>
          );
        })}

        {!appointments.length ? (
          <p className="text-sm text-slate-500">No records in this section yet.</p>
        ) : null}
      </div>
    </div>
  );
}

export default function StaffPatientsPage() {
  const { appointments, loading, error } = useAppointments();
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const today = getTodayDate();

  const patients = useMemo(
    () => buildPatientRecords(appointments, today),
    [appointments, today],
  );
  const filteredPatients = useMemo(() => {
    const normalizedTerm = normalizeValue(deferredSearchTerm);
    const digits = deferredSearchTerm.replace(/[^\d]/g, "");

    if (!normalizedTerm && !digits) {
      return patients;
    }

    return patients.filter((patient) => {
      const matchesName = patient.name.toLowerCase().includes(normalizedTerm);
      const matchesPhone = digits ? patient.phone.replace(/[^\d]/g, "").includes(digits) : false;
      return matchesName || matchesPhone;
    });
  }, [deferredSearchTerm, patients]);

  useEffect(() => {
    if (!filteredPatients.length) {
      if (selectedPatientId) {
        setSelectedPatientId("");
      }
      return;
    }

    const stillSelected = filteredPatients.some((patient) => patient.id === selectedPatientId);
    if (!stillSelected) {
      setSelectedPatientId(filteredPatients[0].id);
    }
  }, [filteredPatients, selectedPatientId]);

  const selectedPatient = useMemo(
    () => filteredPatients.find((patient) => patient.id === selectedPatientId) ?? filteredPatients[0] ?? null,
    [filteredPatients, selectedPatientId],
  );
  const pastVisits =
    selectedPatient?.appointments.filter((appointment) => appointment.date < today) ?? [];
  const upcomingAppointments =
    selectedPatient?.appointments.filter((appointment) => appointment.date >= today) ?? [];
  const returningPatients = patients.filter((patient) => patient.totalVisits > 1).length;
  const patientsWithOnlineBookings = patients.filter((patient) => patient.onlineBookings > 0).length;

  return (
    <div className="space-y-6">
      <section className="card-surface px-6 py-8 sm:px-8">
        <span className="eyebrow">{t("searchPatients")}</span>
        <h1 className="mt-5 section-title">Patient records</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
          Reception, admin, and owner accounts can review previous patients, returning visits, and
          upcoming bookings from one searchable list.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Unique patients</p>
          <p className="mt-3 font-display text-4xl">{loading ? "..." : patients.length}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Returning patients</p>
          <p className="mt-3 font-display text-4xl">{loading ? "..." : returningPatients}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
            Patients with online bookings
          </p>
          <p className="mt-3 font-display text-4xl">
            {loading ? "..." : patientsWithOnlineBookings}
          </p>
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <div className="card-surface px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="field-input flex-1"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t("searchPlaceholder")}
            />
          </div>

          <div className="mt-6 grid gap-3">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => setSelectedPatientId(patient.id)}
                className={`rounded-[26px] border px-4 py-4 text-left ${
                  selectedPatient?.id === patient.id
                    ? "border-teal-200 bg-teal-50"
                    : "border-[color:var(--border)] bg-white"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{patient.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{patient.phone}</p>
                  </div>
                  <span className="chip status-blue">{patient.totalVisits} visits</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="chip status-green">{patient.onlineBookings} online</span>
                  <span className="chip status-amber">{patient.walkInVisits} walk-in</span>
                </div>

                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                  {patient.lastVisit
                    ? `Last visit ${formatDateLabel(patient.lastVisit.date, language === "np" ? "ne-NP" : "en-US")}`
                    : patient.nextVisit
                      ? `Upcoming ${formatDateLabel(patient.nextVisit.date, language === "np" ? "ne-NP" : "en-US")}`
                      : "No dated records yet"}
                </p>
              </button>
            ))}

            {!loading && !filteredPatients.length ? (
              <div className="rounded-[26px] border border-dashed border-[color:var(--border)] px-4 py-5 text-sm text-slate-500">
                No matching patients found.
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="card-surface px-6 py-8 sm:px-8">
            {selectedPatient ? (
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="eyebrow">Selected patient</span>
                  <h2 className="mt-4 font-display text-4xl">{selectedPatient.name}</h2>
                  <p className="mt-2 text-sm text-slate-600">{selectedPatient.phone}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {selectedPatient.address || "Address not provided"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="surface-muted min-w-[11rem] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Last visit</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedPatient.lastVisit
                        ? formatDateLabel(
                            selectedPatient.lastVisit.date,
                            language === "np" ? "ne-NP" : "en-US",
                          )
                        : "No previous visit"}
                    </p>
                  </div>
                  <div className="surface-muted min-w-[11rem] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Next booking</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedPatient.nextVisit
                        ? formatDateLabel(
                            selectedPatient.nextVisit.date,
                            language === "np" ? "ne-NP" : "en-US",
                          )
                        : "No upcoming booking"}
                    </p>
                  </div>
                  <div className="surface-muted min-w-[11rem] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Online bookings</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedPatient.onlineBookings}
                    </p>
                  </div>
                  <div className="surface-muted min-w-[11rem] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Walk-ins</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedPatient.walkInVisits}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <span className="eyebrow">{t("searchPatients")}</span>
                <h2 className="mt-4 font-display text-4xl">Choose a patient</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Search by name or phone to review previous patient records and upcoming bookings.
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AppointmentHistoryColumn
              title={t("pastVisits")}
              appointments={pastVisits}
              language={language}
              translate={t}
            />
            <AppointmentHistoryColumn
              title={t("upcomingAppointments")}
              appointments={upcomingAppointments}
              language={language}
              translate={t}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
