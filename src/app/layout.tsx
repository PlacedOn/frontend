import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { DemoDialogProvider } from "@/components/demo/DemoDialogProvider";

/**
 * Two families, matching the reference set (Harvey ships a sans + a serif;
 * Scale ships one sans). Geist is variable, so a single file covers display
 * and body weights — Sora + Inter was two families doing one family's job.
 * Instrument Serif is the editorial accent: pull quotes and eyebrows only.
 */
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif-src",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Placedon — hire for how people actually think",
  description:
    "Placedon runs one adaptive interview and extracts the signal — the traits behind the resume — so teams hire for how people actually think.",
  openGraph: {
    title: "Placedon — hire for how people actually think",
    description:
      "One adaptive interview. Real signal, not resumes. See the traits behind every candidate.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${instrumentSerif.variable}`}>
      <body>
        <AuthProvider>
          <DemoDialogProvider>{children}</DemoDialogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
