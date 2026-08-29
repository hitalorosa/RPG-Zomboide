import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

const display = Anton({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const corpo = Inter({
  variable: "--font-corpo",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RPG Zomboide",
  description: "Painel de mesa — sobrevivência em Campinas, cinco anos depois.",
};

export const viewport: Viewport = {
  themeColor: "#0b0d09",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${corpo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
