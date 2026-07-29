import type { Metadata } from "next";
import { Sora, Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { DemoDialogProvider } from "@/components/demo/DemoDialogProvider";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/* Display serif for the hero. Harvey sets its headline in a serif against a
   sans body — it is the single clearest signal that a page was art-directed
   rather than assembled, and it costs one font file. */
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
    <html lang="en" className={`${sora.variable} ${inter.variable} ${instrumentSerif.variable}`}>
      <body>
        <AuthProvider>
          <DemoDialogProvider>{children}</DemoDialogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
