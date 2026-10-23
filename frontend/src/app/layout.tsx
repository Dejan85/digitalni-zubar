import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemePicker } from "@/components/dev/ThemePicker";

import { THEME_INIT_SCRIPT } from "@/lib/theme";

import { Providers } from "./providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digitalni zubar",
  description: "Komunikacija zubara i zubnog tehničara — porudžbine, otisci, praćenje statusa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        {/* color picker teme postoji samo u devu, ne ide u produkcijski build */}
        {process.env.NODE_ENV !== "production" && <ThemePicker />}
      </body>
    </html>
  );
}
