import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";
import QueryProvider from "@/providers/queryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Evalora — Developer assessment platform",
    template: "%s | Evalora",
  },
  description:
    "Evalora lets your team design coding assessments, invite candidates, and review results — with proctoring built in.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("h-full", geistSans.variable, geistMono.variable)}>
      <body className="min-h-full font-sans antialiased">
        <QueryProvider>
          <div className="flex min-h-full flex-col">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}