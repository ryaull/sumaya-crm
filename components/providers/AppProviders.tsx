"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { CurrentUserProvider } from "@/lib/use-current-user";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <CurrentUserProvider>{children}</CurrentUserProvider>
    </LanguageProvider>
  );
}
