"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import translations from "@/lib/translations.json";
import { Language, TranslationRecord } from "@/types";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
};

const STORAGE_KEY = "sumaya-language";
const translationMap = translations as TranslationRecord;

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
    if (storedLanguage === "en" || storedLanguage === "np") {
      setLanguageState(storedLanguage);
    }
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "np" : "en");
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: (key: string) => translationMap[key]?.[language] ?? translationMap[key]?.en ?? key,
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside a LanguageProvider");
  }

  return context;
}
