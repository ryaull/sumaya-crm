export type Language = "en" | "np";

export type ServiceId =
  | "opd"
  | "ecg"
  | "ultrasound"
  | "echo"
  | "pathology"
  | "pharmacy"
  | "dressing";

export type AppointmentStatus = "pending" | "confirmed" | "completed";
export type PaymentStatus = "pending" | "half-paid" | "paid";
export type PaymentMode = "cash" | "online" | null;
export type AppointmentSource = "online" | "walk-in";
export type AppointmentTag = "standard" | "follow-up";
export type UserRole = "user" | "reception" | "owner" | "admin";

export type TranslationRecord = Record<
  string,
  {
    en: string;
    np: string;
  }
>;

export type ClinicService = {
  id: ServiceId;
  key: string;
  descriptionKey: string;
  price: number;
  accent: string;
};

export type GalleryImage = {
  src: string;
  titleKey: string;
  descriptionKey: string;
};

export type AppointmentRecord = {
  id: string;
  name: string;
  phone: string;
  bookedByUid?: string | null;
  bookedByEmail?: string | null;
  address?: string;
  service: ServiceId;
  date: string;
  time: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  paymentMode: PaymentMode;
  source: AppointmentSource;
  tag: AppointmentTag;
  price: number;
  createdAt: string;
  updatedAt?: string;
  parentAppointmentId?: string | null;
  notes?: string;
  searchName: string;
  searchPhone: string;
};

export type AppointmentInput = {
  name: string;
  phone: string;
  bookedByUid?: string | null;
  bookedByEmail?: string | null;
  service: ServiceId;
  date: string;
  time: string;
  source: AppointmentSource;
  status?: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  paymentMode?: PaymentMode;
  tag?: AppointmentTag;
  address?: string;
  parentAppointmentId?: string | null;
  notes?: string;
};

export type AppointmentUpdateInput = Partial<
  Pick<
    AppointmentRecord,
    | "name"
    | "phone"
    | "address"
    | "service"
    | "date"
    | "time"
    | "status"
    | "paymentStatus"
    | "paymentMode"
    | "tag"
    | "parentAppointmentId"
    | "notes"
  >
>;

export type PatientMatch = {
  id: string;
  name: string;
  phone: string;
  address?: string;
  appointments: AppointmentRecord[];
};

export type DashboardSummary = {
  totalPatientsToday: number;
  totalRevenueToday: number;
  pendingPayments: number;
  pendingPaymentsCount: number;
};

export type UserProfile = {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};
