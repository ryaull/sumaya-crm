"use client";

import { startTransition, useEffect, useState } from "react";
import { getAppointments } from "@/lib/clinic-firestore";
import { AppointmentRecord } from "@/types";

export function useAppointments() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      setError("");
      const records = await getAppointments();
      startTransition(() => {
        setAppointments(records);
      });
    } catch {
      setError("Appointments could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return {
    appointments,
    loading,
    error,
    refresh,
  };
}
