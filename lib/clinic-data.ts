import { createTimeSlots } from "@/lib/clinic-utils";
import { ClinicService, GalleryImage } from "@/types";

export const CLINIC_NAME = "Sumaya Health Centre";

export const CLINIC_CONTACT = {
  phone: "+9779800000000",
  whatsapp: "9779800000000",
  location: "Kathmandu, Nepal",
};

export const SERVICES: ClinicService[] = [
  {
    id: "opd",
    key: "serviceOpd",
    descriptionKey: "serviceOpdDesc",
    price: 500,
    accent: "#d9f3ef",
  },
  {
    id: "ecg",
    key: "serviceEcg",
    descriptionKey: "serviceEcgDesc",
    price: 800,
    accent: "#e0edff",
  },
  {
    id: "ultrasound",
    key: "serviceUltrasound",
    descriptionKey: "serviceUltrasoundDesc",
    price: 1500,
    accent: "#fff0db",
  },
  {
    id: "echo",
    key: "serviceEcho",
    descriptionKey: "serviceEchoDesc",
    price: 1800,
    accent: "#efe5ff",
  },
  {
    id: "pathology",
    key: "servicePathology",
    descriptionKey: "servicePathologyDesc",
    price: 1200,
    accent: "#ffe3e5",
  },
  {
    id: "pharmacy",
    key: "servicePharmacy",
    descriptionKey: "servicePharmacyDesc",
    price: 300,
    accent: "#ecf8df",
  },
  {
    id: "dressing",
    key: "serviceDressing",
    descriptionKey: "serviceDressingDesc",
    price: 700,
    accent: "#eef7ff",
  },
];

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: "/images/clinic-reception.svg",
    titleKey: "receptionDesk",
    descriptionKey: "galleryReceptionDesc",
  },
  {
    src: "/images/clinic-interior.svg",
    titleKey: "clinicInterior",
    descriptionKey: "galleryInteriorDesc",
  },
  {
    src: "/images/clinic-equipment.svg",
    titleKey: "equipmentZone",
    descriptionKey: "galleryEquipmentDesc",
  },
];

export const TIME_SLOTS = createTimeSlots("09:00", "17:00", 15);

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: "pending", key: "pending" },
  { value: "confirmed", key: "confirmed" },
  { value: "completed", key: "completed" },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", key: "pending" },
  { value: "half-paid", key: "halfPaid" },
  { value: "paid", key: "paid" },
] as const;

export const PAYMENT_MODE_OPTIONS = [
  { value: "cash", key: "cash" },
  { value: "online", key: "online" },
] as const;

export const DASHBOARD_LINKS = [
  { href: "/dashboard/appointments", labelKey: "appointments" },
  { href: "/dashboard/hospital-history", labelKey: "hospitalHistory" },
  { href: "/dashboard/patients", labelKey: "searchPatients" },
  { href: "/dashboard/today", labelKey: "todaysPatients" },
  { href: "/dashboard/follow-ups", labelKey: "followUps" },
  { href: "/dashboard/reports", labelKey: "reports" },
  { href: "/dashboard/walk-in", labelKey: "addWalkIn" },
  { href: "/dashboard/settings", labelKey: "settings" },
];
