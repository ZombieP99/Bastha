import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "Bastha | بسطة",
  description: "تجارة بسيطة للجميع. نربطك بأفضل المتاجر المحلية.",
};

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingButton from "@/components/layout/FloatingButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col font-tajawal bg-[#f0f4f8] text-[#1a365d]">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <FloatingButton />
      </body>
    </html>
  );
}
