"use client";

import { CLINIC_CONTACT } from "@/lib/clinic-data";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function SettingsPage() {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-6">
      <section className="card-surface px-6 py-8 sm:px-8">
        <span className="eyebrow">{t("settings")}</span>
        <h1 className="mt-5 section-title">{t("settings")}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{t("settingsDescription")}</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface px-6 py-8 sm:px-8">
          <h2 className="font-display text-3xl">Clinic contact</h2>
          <div className="mt-5 grid gap-3 text-sm text-slate-600">
            <p>Phone: {CLINIC_CONTACT.phone}</p>
            <p>WhatsApp: {CLINIC_CONTACT.whatsapp}</p>
            <p>Location: {CLINIC_CONTACT.location}</p>
          </div>
        </div>

        <div className="card-surface px-6 py-8 sm:px-8">
          <h2 className="font-display text-3xl">Firebase project</h2>
          <div className="mt-5 grid gap-3 text-sm text-slate-600">
            <p>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</p>
            <p>Auth domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}</p>
            <p>Language preference: {language === "en" ? "English" : "Nepali"}</p>
          </div>
        </div>
      </section>

      <section className="card-panel px-6 py-8 sm:px-8">
        <h2 className="font-display text-3xl">Implementation notes</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Email/password authentication protects the dashboard through Firebase Authentication.
          When a user signs in, the app creates or updates a Firestore document in the `users`
          collection with a default `user` role. Normal users can log in and view only their own
          linked history, while elevated roles such as `reception`, `admin`, and `owner` can open
          the dashboard. You can manually edit that role in Firestore later.
        </p>
      </section>
    </div>
  );
}
