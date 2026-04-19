"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex rounded-full border border-[color:var(--border)] bg-white/90 p-1 shadow-sm">
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-full px-3 py-2 text-xs font-semibold ${
          language === "en" ? "bg-slate-950 text-white" : "text-slate-600"
        }`}
      >
        English 🇬🇧
      </button>
      <button
        type="button"
        onClick={() => setLanguage("np")}
        className={`rounded-full px-3 py-2 text-xs font-semibold ${
          language === "np" ? "bg-slate-950 text-white" : "text-slate-600"
        }`}
      >
        Nepali 🇳🇵
      </button>
    </div>
  );
}
