import FloatingButton from "@/components/layout/FloatingButton";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import NotificationListener from '@/components/notifications/NotificationListener';
import { getDictionary } from "@/i18n/dictionaries";
import type { Metadata } from "next";
import { Inter,Tajawal } from "next/font/google";
import { notFound } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'react-hot-toast';
import "../globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal-source",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-source",
});

export const metadata: Metadata = {
  title: "Bastha | بسطة",
  description: "تجارة بسيطة للجميع. نربطك بأفضل المتاجر المحلية.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  // Await params as required by Next.js 15+ 
  const resolvedParams = await params;
  if (!['ar','en'].includes(resolvedParams.lang)) notFound();
  const lang = resolvedParams.lang as 'en' | 'ar';
  
  const dict = await getDictionary(lang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const fontClass = lang === 'ar' ? `${tajawal.variable} font-tajawal` : `${inter.variable} font-inter`;

  return (
    <html lang={lang} dir={dir} className={`${fontClass} antialiased h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#f0f4f8] text-[#1a365d]" suppressHydrationWarning>
        <NextTopLoader color="#1a365d" showSpinner={false} shadow="0 0 10px #1a365d,0 0 5px #1a365d" />
        <Toaster position="bottom-center" />
        <NotificationListener />
        <Navbar dict={dict} lang={lang} />
        <main className="flex-1">
          {children}
        </main>
        <Footer dict={dict} lang={lang} />
        <FloatingButton dict={dict} lang={lang} />
      </body>
    </html>
  );
}
