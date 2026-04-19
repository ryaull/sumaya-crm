"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import LanguageToggle from "@/components/clinic/LanguageToggle";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { auth } from "@/lib/firebase";
import { clearSessionCookies, isElevatedRole } from "@/lib/session-utils";
import { useCurrentUser } from "@/lib/use-current-user";

const links = [
  { href: "/", labelKey: "navHome" },
  { href: "/book", labelKey: "navBook" },
  { href: "/history", labelKey: "navHistory" },
];

export default function PublicSiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, t } = useLanguage();
  const { user, profile, loading } = useCurrentUser();
  const loginLabel =
    pathname === "/login"
      ? language === "np"
        ? "\u0916\u093e\u0924\u093e"
        : "Account"
      : language === "np"
        ? "\u0932\u0917\u0907\u0928"
        : "Login";
  const logoutLabel =
    language === "np" ? "\u0932\u0917\u0906\u0909\u091f" : "Logout";
  const myHistoryLabel =
    language === "np" ? "\u092e\u0947\u0930\u094b \u0907\u0924\u093f\u0939\u093e\u0938" : "My History";
  const checkingAccountLabel =
    language === "np"
      ? "\u0916\u093e\u0924\u093e \u091c\u093e\u0901\u091a \u0939\u0941\u0901\u0926\u0948"
      : "Checking account";
  const elevatedRole = isElevatedRole(profile?.role);
  const accountName =
    profile?.name || user?.displayName || user?.email?.split("@")[0] || "Clinic user";

  const handleLogout = async () => {
    await signOut(auth);
    clearSessionCookies();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-transparent backdrop-blur-xl">
      <div className="section-shell py-4">
        <div className="flex flex-col gap-4 rounded-[32px] border border-[color:var(--border)] bg-white/88 px-4 py-4 shadow-[var(--shadow-soft)] lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-sky-700 text-lg font-bold text-white">
                S
              </div>
              <div>
                <p className="font-display text-2xl leading-none">{t("clinicName")}</p>
                <p className="mt-1 hidden text-xs uppercase tracking-[0.18em] text-slate-500 sm:block">
                  {t("clinicTagline")}
                </p>
              </div>
            </Link>
            <div className="lg:hidden">
              <LanguageToggle />
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <nav className="flex flex-wrap items-center gap-2 rounded-full bg-slate-50/90 p-1.5">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    {t(link.labelKey)}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden lg:block">
              <LanguageToggle />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {loading ? (
                <div className="inline-flex min-h-[46px] items-center rounded-full border border-[color:var(--border)] bg-slate-50/90 px-4 text-sm font-semibold text-slate-500">
                  {checkingAccountLabel}
                </div>
              ) : user ? (
                <>
                  <div className="hidden items-center gap-2 rounded-full border border-[color:var(--border)] bg-slate-50/90 px-4 py-2 text-sm text-slate-700 xl:inline-flex">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-900">{accountName}</span>
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {profile?.role || "user"}
                    </span>
                  </div>

                  <Link
                    href={elevatedRole ? "/dashboard/appointments" : "/history?view=mine"}
                    className="btn-secondary"
                  >
                    {elevatedRole ? t("navDashboard") : myHistoryLabel}
                  </Link>

                  <button type="button" className="btn-ghost" onClick={() => void handleLogout()}>
                    {logoutLabel}
                  </button>
                </>
              ) : (
                <Link href="/login" className="btn-secondary">
                  {loginLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
