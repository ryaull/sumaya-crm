"use client";

import { useEffect, useState, useMemo } from "react";
import { getAppointments } from "@/lib/clinic-firestore";
import { useCurrentUser } from "@/lib/use-current-user";
import { AppointmentRecord } from "@/types";
import { formatCurrency, formatDateLabel, formatTimeLabel, getPaymentClass, getStatusClass } from "@/lib/clinic-utils";
import { SERVICES } from "@/lib/clinic-data";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function HospitalHistory() {
  const { profile, loading: loadingUser } = useCurrentUser();
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "today" | "past-week" | "this-month" | "unpaid">("all");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const records = await getAppointments();
      setAppointments(records);
      setLoading(false);
    }
    
    if (!loadingUser && profile && (profile.role === "admin" || profile.role === "reception" || profile.role === "owner")) {
      void loadData();
    } else if (!loadingUser) {
      setLoading(false);
    }
  }, [loadingUser, profile]);

  const filteredAppointments = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    
    return appointments.filter(app => {
      if (filter === "all") return true;
      if (filter === "unpaid") return app.paymentStatus !== "paid";
      if (filter === "today") return app.date === todayStr;
      
      const appDate = new Date(app.date);
      const diffTime = Math.abs(today.getTime() - appDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (filter === "past-week") return diffDays <= 7 && app.date <= todayStr;
      if (filter === "this-month") return appDate.getMonth() === today.getMonth() && appDate.getFullYear() === today.getFullYear();
      
      return true;
    });
  }, [appointments, filter]);

  // General Stats
  const revenue = filteredAppointments.reduce((acc, curr) => curr.paymentStatus === 'paid' ? acc + curr.price : acc, 0);
  const pendingPayments = filteredAppointments.filter(app => app.paymentStatus !== "paid").length;

  if (loadingUser || loading) {
    return (
      <div className="section-shell py-8 sm:py-12">
        <div className="card-surface px-6 py-8">
          <div className="flex animate-pulse space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || (profile.role !== "admin" && profile.role !== "reception" && profile.role !== "owner")) {
    return (
      <div className="section-shell py-8 sm:py-12 flex justify-center">
         <div className="card-surface px-8 py-10 text-center max-w-md w-full">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-6 border border-rose-100">
               <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
            </div>
            <h2 className="text-2xl font-display text-slate-800 mb-2">Access Denied</h2>
            <p className="text-slate-500 text-sm">You do not have permission to view the global hospital records.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="section-shell py-8 sm:py-12 space-y-8">
        
      {/* Header section with Glassmorphism */}
      <div className="card-surface px-8 py-8 sm:py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="hero-glow -top-10 -right-10 opacity-30"></div>
        <div className="relative z-10">
          <span className="eyebrow mb-3">System Records</span>
          <h1 className="section-title text-[2rem] sm:text-[2.75rem]">Hospital History</h1>
          <p className="mt-3 text-slate-600 max-w-xl">Review all historical visits, manage unbilled sessions, and analyze periodic clinic activity.</p>
        </div>
        
        <div className="relative z-10 w-full md:w-auto">
           <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className="field-select font-medium text-primary shadow-sm hover:border-primary/40 transition-colors w-full md:w-56"
           >
              <option value="all">All Time Records</option>
              <option value="today">Today's Visits</option>
              <option value="past-week">Past 7 Days</option>
              <option value="this-month">This Month</option>
              <option value="unpaid">Unpaid / Pending</option>
           </select>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="metric-card bg-gradient-to-br from-white/80 to-primary-soft/30">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Total Visits (Filtered)</p>
          <p className="font-display text-4xl text-slate-900">{filteredAppointments.length}</p>
        </div>
        <div className="metric-card">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Total Revenue (Paid)</p>
          <p className="font-display text-4xl text-primary">{formatCurrency(revenue)}</p>
        </div>
        <div className="metric-card">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Pending / Open</p>
          <p className="font-display text-4xl text-rose-600">{pendingPayments}</p>
        </div>
      </div>

      {/* Data Table View */}
      <div className="table-shell w-full overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50/50 text-slate-500 border-b border-white/40">
            <tr>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Patient</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Date & Time</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Service</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Status</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px] text-right">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/40 bg-white/30 backdrop-blur-md">
            {filteredAppointments.length > 0 ? (
               filteredAppointments.map((app) => {
                  const service = SERVICES.find((item) => item.id === app.service);
                  const serviceName = service ? t(service.key) : app.service.toUpperCase();
                  
                  return (
                     <tr key={app.id} className="hover:bg-white/60 transition-colors">
                        <td className="px-6 py-4">
                           <p className="font-semibold text-slate-900">{app.name}</p>
                           <p className="text-xs text-slate-500">{app.phone}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                           {formatDateLabel(app.date, "en-US")} <br/>
                           <span className="text-xs text-slate-500">{formatTimeLabel(app.time)}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                           {serviceName}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                           <span className={`chip ${getStatusClass(app.status)}`}>
                             {app.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className={`chip mb-1 ${getPaymentClass(app.paymentStatus)}`}>
                              {app.paymentStatus}
                           </span>
                           <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{formatCurrency(app.price)}</p>
                        </td>
                     </tr>
                  );
               })
            ) : (
               <tr>
                 <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                   No appointments found for this filter.
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
