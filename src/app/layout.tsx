import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import SessionWrapper from "@/components/SessionWrapper";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Service Pulse | सेवा पल्स",
  description: "Real-time public service experience tracker for Nepal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}>
        <SessionWrapper>
          <I18nProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <footer className="bg-white border-t mt-12 py-6 text-center text-sm text-gray-500">
              <p>Service Pulse | सेवा पल्स &copy; {new Date().getFullYear()}</p>
              <p className="text-xs mt-1">Built to hold public services accountable in Nepal 🇳🇵</p>
            </footer>
          </I18nProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
