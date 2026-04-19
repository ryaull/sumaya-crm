import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Sumaya Health Centre",
    template: "%s | Sumaya Health Centre",
  },
  description:
    "A modern bilingual clinic management demo for Sumaya Health Centre built with Next.js and Firebase.",
  applicationName: "Sumaya Health Centre",
  keywords: [
    "clinic management",
    "Sumaya Health Centre",
    "Next.js Firebase clinic app",
    "appointment booking",
    "Nepali clinic dashboard",
  ],
  openGraph: {
    title: "Sumaya Health Centre",
    description:
      "Patient booking, walk-in management, follow-ups, payments, and reports in a bilingual clinic workspace.",
    images: ["/images/clinic-reception.svg"],
    type: "website",
  },
  icons: {
    icon: "/images/clinic-reception.svg",
  },
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${manrope.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
