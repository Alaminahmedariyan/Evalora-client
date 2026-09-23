import type { ReactNode } from "react";

import { Header } from "@/components/layout/public/Header";
import { Footer } from "@/components/layout/public/Footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}