import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { DemoDialogProvider } from "@/components/demo/DemoDialogProvider";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PlacedOn — hire for how people actually think",
  description:
    "PlacedOn runs one adaptive interview and extracts the signal — the traits behind the résumé — so teams hire for how people actually think.",
  openGraph: {
    title: "PlacedOn — hire for how people actually think",
    description:
      "One adaptive interview. Real signal, not résumés. See the traits behind every candidate.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body>
        <DemoDialogProvider>{children}</DemoDialogProvider>
      </body>
    </html>
  );
}
