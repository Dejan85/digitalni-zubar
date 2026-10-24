import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

import { THEME_INIT_SCRIPT } from "@/lib/theme";

import { Providers } from "./providers";

import "./globals.css";

// Inter: tekst i tabele; Plus Jakarta Sans: naslovi; JetBrains Mono: ID-jevi, rokovi, cene (dizajn/DESIGN.md → Typography)
const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin", "latin-ext"], weight: ["600", "700"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin", "latin-ext"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "Digitalni zubar",
  description: "Komunikacija zubara i zubnog tehničara — porudžbine, otisci, praćenje statusa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sr" className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* ikone (Material Symbols); font se učitava sa Google Fonts */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font, @next/next/google-font-display */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0&display=block"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
