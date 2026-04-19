"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SERVICES } from "@/lib/clinic-data";
import { calculatePaidAmount, calculatePendingAmount, formatCurrency, getTodayDate } from "@/lib/clinic-utils";
import { useAppointments } from "@/lib/useAppointments";
import { useLanguage } from "@/components/providers/LanguageProvider";

const chartColors = ["#0f766e", "#0f4c81", "#f59e0b", "#8b5cf6", "#ef4444", "#22c55e", "#14b8a6"];

export default function ReportsPage() {
  const { appointments, loading } = useAppointments();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const today = getTodayDate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const todayAppointments = appointments.filter((appointment) => appointment.date === today);
  const totalPatientsToday = todayAppointments.length;
  const totalRevenueToday = todayAppointments.reduce(
    (sum, appointment) => sum + calculatePaidAmount(appointment),
    0,
  );
  const pendingPayments = appointments.reduce(
    (sum, appointment) => sum + calculatePendingAmount(appointment),
    0,
  );
  const pendingPaymentsCount = appointments.filter(
    (appointment) => appointment.paymentStatus !== "paid",
  ).length;

  const revenueOverTime = Object.values(
    appointments.reduce<Record<string, { date: string; revenue: number }>>((accumulator, appointment) => {
      if (!accumulator[appointment.date]) {
        accumulator[appointment.date] = { date: appointment.date, revenue: 0 };
      }

      accumulator[appointment.date].revenue += calculatePaidAmount(appointment);
      return accumulator;
    }, {}),
  );

  const serviceDistribution = SERVICES.map((service) => ({
    name: t(service.key),
    value: appointments.filter((appointment) => appointment.service === service.id).length,
  })).filter((entry) => entry.value > 0);

  const paymentStatusData = [
    {
      name: t("pending"),
      value: appointments.filter((appointment) => appointment.paymentStatus === "pending").length,
    },
    {
      name: t("halfPaid"),
      value: appointments.filter((appointment) => appointment.paymentStatus === "half-paid").length,
    },
    {
      name: t("paid"),
      value: appointments.filter((appointment) => appointment.paymentStatus === "paid").length,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="card-surface px-6 py-8 sm:px-8">
        <span className="eyebrow">{t("reports")}</span>
        <h1 className="mt-5 section-title">{t("reports")}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
          Owner-ready summaries from the same live appointment data used by the reception desk.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{t("totalPatientsToday")}</p>
          <p className="mt-3 font-display text-4xl">{loading ? "..." : totalPatientsToday}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{t("totalRevenueToday")}</p>
          <p className="mt-3 font-display text-4xl">{loading ? "..." : formatCurrency(totalRevenueToday)}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{t("pendingPayments")}</p>
          <p className="mt-3 font-display text-4xl">{loading ? "..." : formatCurrency(pendingPayments)}</p>
          <p className="mt-2 text-sm text-slate-500">{pendingPaymentsCount} records outstanding</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card-surface px-4 py-4 sm:px-6 sm:py-6">
          <div className="mb-4">
            <h2 className="font-display text-3xl">{t("revenueOverTime")}</h2>
          </div>
          <div className="h-80">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueOverTime}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                  <Line type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-[24px] bg-slate-50" />
            )}
          </div>
        </div>

        <div className="card-surface px-4 py-4 sm:px-6 sm:py-6">
          <div className="mb-4">
            <h2 className="font-display text-3xl">{t("serviceDistribution")}</h2>
          </div>
          <div className="h-80">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-[24px] bg-slate-50" />
            )}
          </div>
        </div>
      </section>

      <section className="card-surface px-4 py-4 sm:px-6 sm:py-6">
        <div className="mb-4">
          <h2 className="font-display text-3xl">{t("paymentStatusChart")}</h2>
        </div>
        <div className="h-80">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentStatusData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full rounded-[24px] bg-slate-50" />
          )}
        </div>
      </section>
    </div>
  );
}
