"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SERVICES } from "@/lib/clinic-data";
import { getAppointments, getAppointmentsForUser } from "@/lib/clinic-firestore";
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
import { useCurrentUser } from "@/lib/use-current-user";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { isElevatedRole } from "@/lib/session-utils";
import { AppointmentRecord, PatientMatch } from "@/types";

function buildMatches(term: string, records: AppointmentRecord[]) {
  const normalizedTerm = normalizeValue(term);
  const digits = term.replace(/[^\d]/g, "");
  const matchingAppointments = records.filter((record) => {
    const matchesName = record.searchName.includes(normalizedTerm);
    const matchesPhone = digits ? record.searchPhone.includes(digits) : false;
    return matchesName || matchesPhone;
  });

  const grouped = new Map<string, PatientMatch>();

  for (const appointment of matchingAppointments) {
    const key = `${appointment.searchName}-${appointment.searchPhone}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.appointments.push(appointment);
      continue;
    }

    grouped.set(key, {
      id: key,
      name: appointment.name,
      phone: appointment.phone,
      address: appointment.address || "",
      appointments: [appointment],
    });
  }

  return Array.from(grouped.values()).map((match) => ({
    ...match,
    appointments: sortAppointments(match.appointments),
  }));
}

function AppointmentsColumn({
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
                {appointment.tag === "follow-up" ? (
                  <span className="chip status-blue">Follow-up</span>
                ) : null}
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

export default function HistoryPage() {
  const { language, t } = useLanguage();
  const { user, profile, loading: loadingUser } = useCurrentUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [matches, setMatches] = useState<PatientMatch[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [myAppointments, setMyAppointments] = useState<AppointmentRecord[]>([]);
  const [loadingMine, setLoadingMine] = useState(false);

  const selectedPatient = useMemo(
    () => matches.find((match) => match.id === selectedPatientId) ?? matches[0],
    [matches, selectedPatientId],
  );
  const isNormalUser = profile?.role === "user";

  useEffect(() => {
    if (!user?.uid || !isNormalUser) {
      setMyAppointments([]);
      return;
    }

    const loadMine = async () => {
      setLoadingMine(true);
      const records = await getAppointmentsForUser(user.uid);
      setMyAppointments(records);
      setLoadingMine(false);
    };

    void loadMine();
  }, [user?.uid, isNormalUser]);

  const today = getTodayDate();
  const pastVisits =
    selectedPatient?.appointments.filter((appointment) => appointment.date < today) ?? [];
  const upcomingAppointments =
    selectedPatient?.appointments.filter((appointment) => appointment.date >= today) ?? [];
  const myPastVisits = myAppointments.filter((appointment) => appointment.date < today);
  const myUpcomingAppointments = myAppointments.filter((appointment) => appointment.date >= today);
  const searchButtonLabel =
    language === "np" ? "\u0916\u094B\u091C\u094D\u0928\u0941\u0939\u094B\u0938\u094D" : "Search";
  const addressLabel =
    language === "np" ? "\u0920\u0947\u0917\u093E\u0928\u093E" : "Address";
  const addressFallback =
    language === "np" ? "\u0909\u092A\u0932\u092C\u094D\u0927 \u091B\u0948\u0928" : "Not provided";
  const selectPatientLabel =
    language === "np"
      ? "\u092C\u093F\u0930\u093E\u092E\u0940 \u091B\u093E\u0928\u094D\u0928\u0941\u0939\u094B\u0938\u094D"
      : "Select a patient";
  const samplePatients = [
    { label: "Sita Shrestha", value: "Sita Shrestha" },
    { label: "Ram Karki", value: "9840023344" },
    { label: "Maya Gurung", value: "9818887766" },
  ];
  const accountName =
    profile?.name || user?.displayName || user?.email?.split("@")[0] || "Patient";

  const runSearch = async (term: string) => {
    setLoading(true);
    const records = await getAppointments();
    const nextMatches = buildMatches(term, records);
    setMatches(nextMatches);
    setSelectedPatientId(nextMatches[0]?.id || "");
    setLoading(false);
  };

  const handleSearch = async () => {
    await runSearch(searchTerm);
  };

  if (loadingUser) {
    return (
      <div className="section-shell py-8 sm:py-12">
        <div className="card-surface px-6 py-8 text-sm text-slate-500">Loading account...</div>
      </div>
    );
  }

  if (!loadingUser && isNormalUser) {
    return (
      <div className="section-shell py-8 sm:py-12">
        <section className="space-y-6">
          <div className="card-surface px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <span className="eyebrow">My History</span>
                <h1 className="mt-5 section-title">Your appointment history</h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                  This section shows appointments linked to your logged-in account. Guest booking
                  is still available from the public booking page.
                </p>
              </div>

              <div className="surface-muted min-w-[16rem] px-5 py-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Signed in as</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{accountName}</p>
                <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
                <Link href="/book" className="btn-secondary mt-4 w-full">
                  {t("bookAppointment")}
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="metric-card">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Linked records</p>
              <p className="mt-3 font-display text-4xl">{loadingMine ? "..." : myAppointments.length}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Upcoming</p>
              <p className="mt-3 font-display text-4xl">{loadingMine ? "..." : myUpcomingAppointments.length}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Past visits</p>
              <p className="mt-3 font-display text-4xl">{loadingMine ? "..." : myPastVisits.length}</p>
            </div>
          </div>

          {!loadingMine && !myAppointments.length ? (
            <div className="card-surface px-6 py-8 sm:px-8">
              <h2 className="font-display text-3xl">No personalized history yet</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                When you book an appointment while logged in, it will appear here automatically.
              </p>
              <Link href="/book" className="btn-primary mt-6">
                {t("bookAppointment")}
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              <AppointmentsColumn
                title={t("pastVisits")}
                appointments={myPastVisits}
                language={language}
                translate={t}
              />
              <AppointmentsColumn
                title={t("upcomingAppointments")}
                appointments={myUpcomingAppointments}
                language={language}
                translate={t}
              />
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="section-shell py-8 sm:py-12">
      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="card-surface px-6 py-8 sm:px-8">
          <span className="eyebrow">{t("searchPatients")}</span>
          <h1 className="mt-5 section-title">{t("searchPatients")}</h1>
          <p className="mt-4 text-base leading-8 text-slate-600">
            {isElevatedRole(profile?.role)
              ? "Search by patient name or phone to review visits from the clinic record."
              : "Guest users can search by patient name or phone to review visits from the clinic record."}
          </p>

          <div className="mt-6 rounded-[28px] border border-[color:var(--border)] bg-slate-50/80 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                className="field-input flex-1"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t("searchPlaceholder")}
              />
              <button
                type="button"
                className="btn-primary"
                onClick={() => void handleSearch()}
                disabled={!searchTerm || loading}
              >
                {loading ? `${t("loading")}...` : searchButtonLabel}
              </button>
            </div>
          </div>

          <div className="mt-6 surface-muted px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Demo records</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Try a sample patient name or phone number to preview the seeded history view.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {samplePatients.map((patient) => (
                <button
                  key={patient.label}
                  type="button"
                  onClick={() => {
                    setSearchTerm(patient.value);
                    void runSearch(patient.value);
                  }}
                  className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-teal-200 hover:bg-teal-50"
                >
                  {patient.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {matches.map((match) => (
              <button
                key={match.id}
                type="button"
                onClick={() => setSelectedPatientId(match.id)}
                className={`rounded-[26px] border px-4 py-4 text-left ${
                  selectedPatient?.id === match.id
                    ? "border-teal-200 bg-teal-50"
                    : "border-[color:var(--border)] bg-white"
                }`}
              >
                <p className="font-semibold text-slate-950">{match.name}</p>
                <p className="mt-1 text-sm text-slate-600">{match.phone}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                  {match.address || addressFallback}
                </p>
              </button>
            ))}

            {!loading && searchTerm && !matches.length ? (
              <div className="rounded-[26px] border border-dashed border-[color:var(--border)] px-4 py-5 text-sm text-slate-500">
                {t("noMatches")}
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="card-surface px-6 py-8 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="eyebrow">
                  {selectedPatient ? selectedPatient.name : t("navHistory")}
                </span>
                <h2 className="mt-4 font-display text-4xl">
                  {selectedPatient ? selectedPatient.phone : selectPatientLabel}
                </h2>
              </div>
              {selectedPatient ? (
                <div className="rounded-[24px] border border-[color:var(--border)] bg-slate-50/80 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{addressLabel}</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {selectedPatient.address || addressFallback}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AppointmentsColumn
              title={t("pastVisits")}
              appointments={pastVisits}
              language={language}
              translate={t}
            />
            <AppointmentsColumn
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
