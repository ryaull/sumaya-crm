import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, UserRole } from "@/types";

const USERS_COLLECTION = "users";
const DEFAULT_ROLE: UserRole = "user";

type FirestoreValue = {
  toDate?: () => Date;
};

type UserProfileInput = {
  uid: string;
  name: string;
  email: string;
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

function mapUserProfile(id: string, data: Record<string, unknown>): UserProfile {
  return {
    id,
    uid: String(data.uid || id),
    name: String(data.name || "Clinic User"),
    email: String(data.email || ""),
    role: (data.role as UserRole) || DEFAULT_ROLE,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

export async function getUserProfile(uid: string) {
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));

  if (!snapshot.exists()) {
    return null;
  }

  return mapUserProfile(snapshot.id, snapshot.data());
}

export async function upsertUserProfile(input: UserProfileInput) {
  const name = input.name.trim() || input.email.split("@")[0] || "Clinic User";
  const email = input.email.trim();
  const ref = doc(db, USERS_COLLECTION, input.uid);
  const existing = await getDoc(ref);

  if (!existing.exists()) {
    await setDoc(
      ref,
      {
        uid: input.uid,
        name,
        email,
        role: DEFAULT_ROLE,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } else {
    const data = existing.data();
    const nextRole = (data.role as UserRole) || DEFAULT_ROLE;
    const currentName = String(data.name || "");
    const currentEmail = String(data.email || "");

    if (currentName !== name || currentEmail !== email || !data.role) {
      await setDoc(
        ref,
        {
          uid: input.uid,
          name,
          email,
          role: nextRole,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }
  }

  const synced = await getDoc(ref);

  if (!synced.exists()) {
    throw new Error("user_profile_sync_failed");
  }

  return mapUserProfile(synced.id, synced.data());
}
