"use client";

import { UserRole } from "@/types";

const ONE_DAY_SECONDS = 60 * 60 * 24;
const ELEVATED_ROLES: UserRole[] = ["reception", "admin", "owner"];

export function isElevatedRole(role?: UserRole | null) {
  return Boolean(role && ELEVATED_ROLES.includes(role));
}

export function setSessionCookies(role: UserRole) {
  document.cookie = `sumaya_auth=1; max-age=${ONE_DAY_SECONDS}; path=/; samesite=lax`;
  document.cookie = `sumaya_role=${role}; max-age=${ONE_DAY_SECONDS}; path=/; samesite=lax`;
}

export function clearSessionCookies() {
  document.cookie = "sumaya_auth=; max-age=0; path=/; samesite=lax";
  document.cookie = "sumaya_role=; max-age=0; path=/; samesite=lax";
  document.cookie = "sumaya_admin=; max-age=0; path=/; samesite=lax";
}
