import { AppointmentRecord, AppointmentStatus, PaymentStatus, ServiceId } from "@/types";

export function normalizeValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function createTimeSlots(start: string, end: string, intervalMinutes: number) {
  const slots: string[] = [];
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  let current = startHour * 60 + startMinute;
  const finish = endHour * 60 + endMinute;

  while (current < finish) {
    const hour = String(Math.floor(current / 60)).padStart(2, "0");
    const minute = String(current % 60).padStart(2, "0");
    slots.push(`${hour}:${minute}`);
    current += intervalMinutes;
  }

  return slots;
}

export function formatTimeLabel(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${formattedHour}:${String(minute).padStart(2, "0")} ${period}`;
}

export function formatDateLabel(date: string, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function offsetDate(baseDate: string, offsetDays: number) {
  const date = new Date(`${baseDate}T00:00:00`);
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getRoundedCurrentTimeSlot() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const rounded = Math.ceil(minutes / 15) * 15;
  const hour = String(Math.floor(rounded / 60)).padStart(2, "0");
  const minute = String(rounded % 60).padStart(2, "0");
  return `${hour}:${minute}`;
}

export function sortAppointments(records: AppointmentRecord[]) {
  return [...records].sort((left, right) => {
    const leftKey = `${left.date} ${left.time}`;
    const rightKey = `${right.date} ${right.time}`;
    return leftKey.localeCompare(rightKey);
  });
}

export function getStatusClass(status: AppointmentStatus) {
  if (status === "confirmed") {
    return "status-blue";
  }

  if (status === "completed") {
    return "status-green";
  }

  return "status-amber";
}

export function getPaymentClass(status: PaymentStatus) {
  if (status === "paid") {
    return "status-green";
  }

  if (status === "half-paid") {
    return "status-blue";
  }

  return "status-rose";
}

export function calculatePaidAmount(record: AppointmentRecord) {
  if (record.paymentStatus === "paid") {
    return record.price;
  }

  if (record.paymentStatus === "half-paid") {
    return record.price / 2;
  }

  return 0;
}

export function calculatePendingAmount(record: AppointmentRecord) {
  return Math.max(record.price - calculatePaidAmount(record), 0);
}

export function buildWhatsAppUrl(phone: string, message: string) {
  const digits = phone.replace(/[^\d]/g, "");
  const target = digits || "9779800000000";
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}

export function getRangeLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function getServicePrice(serviceId: ServiceId) {
  const pricing: Record<ServiceId, number> = {
    opd: 500,
    ecg: 800,
    ultrasound: 1500,
    echo: 1800,
    pathology: 1200,
    pharmacy: 300,
    dressing: 700,
  };

  return pricing[serviceId];
}
