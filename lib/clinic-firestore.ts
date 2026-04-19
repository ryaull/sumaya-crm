import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getServicePrice, getTodayDate, normalizeValue, offsetDate, sortAppointments } from "@/lib/clinic-utils";
import { AppointmentInput, AppointmentRecord, AppointmentUpdateInput } from "@/types";

const COLLECTION_NAME = "appointments";
const DEMO_STORAGE_KEY = "sumaya-demo-appointments";

type FirestoreValue = {
  toDate?: () => Date;
};

function toIsoString(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as FirestoreValue).toDate === "function"
  ) {
    return (value as FirestoreValue).toDate!().toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return new Date().toISOString();
}

function mapAppointment(id: string, data: Record<string, unknown>): AppointmentRecord {
  const service = typeof data.service === "string" ? data.service : "opd";

  return {
    id,
    name: String(data.name || ""),
    phone: String(data.phone || ""),
    bookedByUid: typeof data.bookedByUid === "string" ? data.bookedByUid : null,
    bookedByEmail: typeof data.bookedByEmail === "string" ? data.bookedByEmail : null,
    address: typeof data.address === "string" ? data.address : "",
    service: service as AppointmentRecord["service"],
    date: String(data.date || getTodayDate()),
    time: String(data.time || "09:00"),
    status: (data.status as AppointmentRecord["status"]) || "pending",
    paymentStatus: (data.paymentStatus as AppointmentRecord["paymentStatus"]) || "pending",
    paymentMode:
      data.paymentMode === "cash" || data.paymentMode === "online" ? data.paymentMode : null,
    source: data.source === "walk-in" ? "walk-in" : "online",
    tag: data.tag === "follow-up" ? "follow-up" : "standard",
    price: Number(data.price || getServicePrice(service as AppointmentRecord["service"])),
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
    parentAppointmentId:
      typeof data.parentAppointmentId === "string" ? data.parentAppointmentId : null,
    notes: typeof data.notes === "string" ? data.notes : "",
    searchName:
      typeof data.searchName === "string" ? data.searchName : normalizeValue(String(data.name || "")),
    searchPhone:
      typeof data.searchPhone === "string"
        ? data.searchPhone
        : String(data.phone || "").replace(/[^\d]/g, ""),
  };
}

function createLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildSeedAppointments() {
  const today = getTodayDate();
  const tomorrow = offsetDate(today, 1);
  const yesterday = offsetDate(today, -1);
  const lastWeek = offsetDate(today, -7);
  const twoWeeksAgo = offsetDate(today, -18);
  const earlier = offsetDate(today, -28);
  const upcoming = offsetDate(today, 2);
  const thisWeekLater = offsetDate(today, 3);
  const nextWeek = offsetDate(today, 5);
  const now = new Date().toISOString();

  return sortAppointments([
    {
      id: "demo-1",
      name: "Sita Shrestha",
      phone: "9801112233",
      address: "Tokha",
      service: "opd",
      date: today,
      time: "09:15",
      status: "confirmed",
      paymentStatus: "pending",
      paymentMode: null,
      bookedByUid: null,
      bookedByEmail: null,
      source: "online",
      tag: "standard",
      price: 500,
      createdAt: now,
      updatedAt: now,
      parentAppointmentId: null,
      notes: "First consultation",
      searchName: normalizeValue("Sita Shrestha"),
      searchPhone: "9801112233",
    },
    {
      id: "demo-2",
      name: "Ram Karki",
      phone: "9840023344",
      address: "Maharajgunj",
      service: "ecg",
      date: yesterday,
      time: "10:30",
      status: "completed",
      paymentStatus: "paid",
      paymentMode: "cash",
      bookedByUid: null,
      bookedByEmail: null,
      source: "walk-in",
      tag: "standard",
      price: 800,
      createdAt: now,
      updatedAt: now,
      parentAppointmentId: null,
      notes: "ECG completed",
      searchName: normalizeValue("Ram Karki"),
      searchPhone: "9840023344",
    },
    {
      id: "demo-3",
      name: "Maya Gurung",
      phone: "9818887766",
      address: "Boudha",
      service: "ultrasound",
      date: tomorrow,
      time: "11:00",
      status: "pending",
      paymentStatus: "half-paid",
      paymentMode: "online",
      bookedByUid: null,
      bookedByEmail: null,
      source: "online",
      tag: "follow-up",
      price: 1500,
      createdAt: now,
      updatedAt: now,
      parentAppointmentId: "demo-6",
      notes: "Follow-up review",
      searchName: normalizeValue("Maya Gurung"),
      searchPhone: "9818887766",
    },
    {
      id: "demo-4",
      name: "Anish Tamang",
      phone: "9850044455",
      address: "Balaju",
      service: "dressing",
      date: yesterday,
      time: "14:15",
      status: "completed",
      paymentStatus: "paid",
      paymentMode: "cash",
      bookedByUid: null,
      bookedByEmail: null,
      source: "walk-in",
      tag: "standard",
      price: 700,
      createdAt: now,
      updatedAt: now,
      parentAppointmentId: null,
      notes: "Daily dressing visit",
      searchName: normalizeValue("Anish Tamang"),
      searchPhone: "9850044455",
    },
    {
      id: "demo-5",
      name: "Sita Shrestha",
      phone: "9801112233",
      address: "Tokha",
      service: "pathology",
      date: nextWeek,
      time: "09:45",
      status: "pending",
      paymentStatus: "pending",
      paymentMode: null,
      bookedByUid: null,
      bookedByEmail: null,
      source: "online",
      tag: "standard",
      price: 1200,
      createdAt: now,
      updatedAt: now,
      parentAppointmentId: null,
      notes: "Lab panel follow-up",
      searchName: normalizeValue("Sita Shrestha"),
      searchPhone: "9801112233",
    },
    {
      id: "demo-6",
      name: "Maya Gurung",
      phone: "9818887766",
      address: "Boudha",
      service: "ultrasound",
      date: twoWeeksAgo,
      time: "10:45",
      status: "completed",
      paymentStatus: "paid",
      paymentMode: "online",
      bookedByUid: null,
      bookedByEmail: null,
      source: "online",
      tag: "standard",
      price: 1500,
      createdAt: now,
      updatedAt: now,
      parentAppointmentId: null,
      notes: "Initial scan completed",
      searchName: normalizeValue("Maya Gurung"),
      searchPhone: "9818887766",
    },
    {
      id: "demo-7",
      name: "Pooja Bhandari",
      phone: "9861123456",
      address: "Lazimpat",
      service: "echo",
      date: today,
      time: "12:00",
      status: "confirmed",
      paymentStatus: "paid",
      paymentMode: "online",
      bookedByUid: null,
      bookedByEmail: null,
      source: "online",
      tag: "standard",
      price: 1800,
      createdAt: now,
      updatedAt: now,
      parentAppointmentId: null,
      notes: "Echo review",
      searchName: normalizeValue("Pooja Bhandari"),
      searchPhone: "9861123456",
    },
    {
      id: "demo-8",
      name: "Dipesh Shah",
      phone: "9811234598",
      address: "New Baneshwor",
      service: "pathology",
      date: today,
      time: "13:15",
      status: "pending",
      paymentStatus: "half-paid",
      paymentMode: "cash",
      bookedByUid: null,
      bookedByEmail: null,
      source: "walk-in",
      tag: "standard",
      price: 1200,
      createdAt: now,
      updatedAt: now,
      parentAppointmentId: null,
      notes: "Blood work intake",
      searchName: normalizeValue("Dipesh Shah"),
      searchPhone: "9811234598",
    },
    {
      id: "demo-9",
      name: "Nirmala KC",
      phone: "9845678901",
      address: "Kapan",
      service: "pharmacy",
      date: offsetDate(today, -2),
      time: "15:30",
      status: "completed",
      paymentStatus: "paid",
      paymentMode: "cash",
      bookedByUid: null,
      bookedByEmail: null,
      source: "walk-in",
      tag: "standard",
      price: 300,
      createdAt: now,
      updatedAt: now,
      parentAppointmentId: null,
      notes: "Medication pickup",
      searchName: normalizeValue("Nirmala KC"),
      searchPhone: "9845678901",
    },
    {
      id: "demo-10",
      name: "Rojina Lama",
      phone: "9807766554",
      address: "Chabahil",
      service: "opd",
      date: lastWeek,
      time: "09:00",
      status: "completed",
      paymentStatus: "paid",
      paymentMode: "cash",
      bookedByUid: null,
      bookedByEmail: null,
      source: "online",
      tag: "standard",
      price: 500,
      createdAt: now,
      updatedAt: now,
      parentAppointmentId: null,
      notes: "Routine review",
      searchName: normalizeValue("Rojina Lama"),
      searchPhone: "9807766554",
    },
    {
      id: "demo-11",
      name: "Bishal Adhikari",
      phone: "9856655443",
      address: "Samakhushi",
      service: "ecg",
      date: upcoming,
      time: "10:15",
      status: "confirmed",
      paymentStatus: "pending",
      paymentMode: null,
      bookedByUid: null,
      bookedByEmail: null,
      source: "online",
      tag: "standard",
      price: 800,
      createdAt: now,
      updatedAt: now,
      parentAppointmentId: null,
      notes: "Cardiac rhythm check",
      searchName: normalizeValue("Bishal Adhikari"),
      searchPhone: "9856655443",
    },
    {
      id: "demo-12",
      name: "Kabita Rai",
      phone: "9823456712",
      address: "Gongabu",
      service: "pharmacy",
      date: tomorrow,
      time: "16:00",
      status: "confirmed",
      paymentStatus: "paid",
      paymentMode: "cash",
      bookedByUid: null,
      bookedByEmail: null,
      source: "walk-in",
      tag: "standard",
      price: 300,
      createdAt: now,
      updatedAt: now,
      parentAppointmentId: null,
      notes: "Prescription refill",
      searchName: normalizeValue("Kabita Rai"),
      searchPhone: "9823456712",
    },
    {
      id: "demo-13",
      name: "Deepak Thapa",
      phone: "9867543210",
      address: "Kalanki",
      service: "dressing",
      date: thisWeekLater,
      time: "11:45",
      status: "pending",
      paymentStatus: "pending",
      paymentMode: null,
      bookedByUid: null,
      bookedByEmail: null,
      source: "online",
      tag: "standard",
      price: 700,
      createdAt: now,
      updatedAt: now,
      parentAppointmentId: null,
      notes: "Wound dressing follow-up",
      searchName: normalizeValue("Deepak Thapa"),
      searchPhone: "9867543210",
    },
    {
      id: "demo-14",
      name: "Ram Karki",
      phone: "9840023344",
      address: "Maharajgunj",
      service: "opd",
      date: earlier,
      time: "09:00",
      status: "completed",
      paymentStatus: "paid",
      paymentMode: "cash",
      bookedByUid: null,
      bookedByEmail: null,
      source: "walk-in",
      tag: "standard",
      price: 500,
      createdAt: now,
      updatedAt: now,
      parentAppointmentId: null,
      notes: "Initial assessment visit",
      searchName: normalizeValue("Ram Karki"),
      searchPhone: "9840023344",
    },
  ]);
}

function mergeSeedAppointments(records: AppointmentRecord[]) {
  const nextMap = new Map(records.map((record) => [record.id, record] as const));
  let changed = false;

  for (const seed of buildSeedAppointments()) {
    if (!nextMap.has(seed.id)) {
      nextMap.set(seed.id, seed);
      changed = true;
    }
  }

  return {
    changed,
    records: sortAppointments(Array.from(nextMap.values())),
  };
}

function readDemoAppointments() {
  if (typeof window === "undefined") {
    return [] as AppointmentRecord[];
  }

  const stored = window.localStorage.getItem(DEMO_STORAGE_KEY);

  if (!stored) {
    const seeded = buildSeedAppointments();
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(stored);
    const records = Array.isArray(parsed) ? (parsed as AppointmentRecord[]) : [];
    const merged = mergeSeedAppointments(records);

    if (merged.changed) {
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(merged.records));
    }

    return merged.records;
  } catch {
    const seeded = buildSeedAppointments();
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function writeDemoAppointments(records: AppointmentRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(sortAppointments(records)));
}

function buildRecord(input: AppointmentInput, id = createLocalId()): AppointmentRecord {
  const now = new Date().toISOString();

  return {
    id,
    name: input.name.trim(),
    phone: input.phone.trim(),
    bookedByUid: input.bookedByUid ?? null,
    bookedByEmail: input.bookedByEmail ?? null,
    address: input.address?.trim() || "",
    service: input.service,
    date: input.date,
    time: input.time,
    status: input.status ?? (input.source === "walk-in" ? "confirmed" : "pending"),
    paymentStatus: input.paymentStatus ?? "pending",
    paymentMode: input.paymentMode ?? null,
    source: input.source,
    tag: input.tag ?? "standard",
    price: getServicePrice(input.service),
    createdAt: now,
    updatedAt: now,
    parentAppointmentId: input.parentAppointmentId ?? null,
    notes: input.notes?.trim() || "",
    searchName: normalizeValue(input.name),
    searchPhone: input.phone.replace(/[^\d]/g, ""),
  };
}

function assertSlotAvailable(records: AppointmentRecord[], date: string, time: string, excludeId?: string) {
  const hasConflict = records.some(
    (record) => record.date === date && record.time === time && record.id !== excludeId,
  );

  if (hasConflict) {
    throw new Error("slot_taken");
  }
}

export async function getAppointments() {
  try {
    const appointmentsQuery = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(appointmentsQuery);
    const mapped = snapshot.docs.map((entry) => mapAppointment(entry.id, entry.data()));

    if (!mapped.length && typeof window !== "undefined") {
      return readDemoAppointments();
    }

    return sortAppointments(mapped);
  } catch {
    return readDemoAppointments();
  }
}

export async function getAppointmentsForDate(date: string) {
  try {
    const appointmentsQuery = query(collection(db, COLLECTION_NAME), where("date", "==", date));
    const snapshot = await getDocs(appointmentsQuery);
    return sortAppointments(snapshot.docs.map((entry) => mapAppointment(entry.id, entry.data())));
  } catch {
    return readDemoAppointments().filter((record) => record.date === date);
  }
}

export async function getAppointmentsForUser(uid: string) {
  try {
    const appointmentsQuery = query(collection(db, COLLECTION_NAME), where("bookedByUid", "==", uid));
    const snapshot = await getDocs(appointmentsQuery);
    return sortAppointments(snapshot.docs.map((entry) => mapAppointment(entry.id, entry.data())));
  } catch {
    return readDemoAppointments().filter((record) => record.bookedByUid === uid);
  }
}

export async function createAppointment(input: AppointmentInput) {
  const record = buildRecord(input);
  const dateAppointments = await getAppointmentsForDate(input.date);

  assertSlotAvailable(dateAppointments, input.date, input.time);

  try {
    const ref = await addDoc(collection(db, COLLECTION_NAME), {
      ...record,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      ...record,
      id: ref.id,
    };
  } catch {
    const records = readDemoAppointments();
    records.push(record);
    writeDemoAppointments(records);
    return record;
  }
}

export async function updateAppointment(id: string, updates: AppointmentUpdateInput) {
  const currentAppointments = await getAppointments();
  const existing = currentAppointments.find((record) => record.id === id);

  if (!existing) {
    throw new Error("appointment_not_found");
  }

  const nextRecord: AppointmentRecord = {
    ...existing,
    ...updates,
    price: getServicePrice(updates.service ?? existing.service),
    searchName: normalizeValue(updates.name ?? existing.name),
    searchPhone: (updates.phone ?? existing.phone).replace(/[^\d]/g, ""),
    updatedAt: new Date().toISOString(),
  };

  assertSlotAvailable(currentAppointments, nextRecord.date, nextRecord.time, id);

  try {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      ...updates,
      price: nextRecord.price,
      searchName: nextRecord.searchName,
      searchPhone: nextRecord.searchPhone,
      updatedAt: serverTimestamp(),
    });
  } catch {
    const records = currentAppointments.map((record) => (record.id === id ? nextRecord : record));
    writeDemoAppointments(records);
  }

  return nextRecord;
}

export async function createFollowUpAppointment(
  parent: AppointmentRecord,
  date: string,
  time: string,
) {
  return createAppointment({
    name: parent.name,
    phone: parent.phone,
    address: parent.address,
    service: parent.service,
    date,
    time,
    source: parent.source,
    status: "pending",
    paymentStatus: "pending",
    paymentMode: null,
    tag: "follow-up",
    parentAppointmentId: parent.id,
    notes: "Follow-up visit",
  });
}
