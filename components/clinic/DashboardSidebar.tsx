"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { DASHBOARD_LINKS } from "@/lib/clinic-data";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { clearSessionCookies } from "@/lib/session-utils";
import { useCurrentUser } from "@/lib/use-current-user";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { user, profile } = useCurrentUser();

  const handleLogout = async () => {
    await signOut(auth);
    clearSessionCookies();
    router.push("/login");
  };

  return (
    <aside className="card-panel h-full min-h-screen px-4 py-6 lg:sticky lg:top-0">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold">
          S
        </div>
        <div>
          <p className="font-display text-xl tracking-[0.04em]">{t("clinicName")}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Admin Workspace</p>
        </div>
      </div>

      <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
        <p className="font-semibold">{profile?.name || user?.displayName || "Clinic user"}</p>
        <p className="mt-1 text-xs text-slate-300">{user?.email || "Awaiting sign-in state"}</p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-slate-400">Role</p>
        <p className="mt-1 text-sm capitalize text-white">{profile?.role || "user"}</p>
        <p className="mt-3 text-xs leading-6 text-slate-400">
          Edit the matching document in Firestore `users/{user?.uid || "uid"}` to change this
          role label.
        </p>
      </div>

      <nav className="mt-8 grid gap-2 rounded-[24px] border border-white/10 bg-white/5 p-2">
        {DASHBOARD_LINKS.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                active
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-100 hover:bg-white/10"
              }`}
            >
              {t(link.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
        Patient bookings, walk-ins, payments, and follow-ups all share the same appointments collection.
      </div>

      <div className="mt-8 grid gap-3">
        <Link href="/" className="btn-secondary w-full">
          Back to site
        </Link>
        <button type="button" className="btn-secondary w-full" onClick={() => void handleLogout()}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
