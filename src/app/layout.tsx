import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SessionWrapper from "@/components/SessionWrapper";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sewasuchak.vercel.app";
const socialImage = "/opengraph-image";

export const metadata: Metadata = {
  title: "Service Pulse | सेवा सूचक",
  description: "नेपालका सार्वजनिक सेवाहरूको अनुभव ट्र्याक गर्ने प्लेटफर्म",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Service Pulse | सेवा सूचक",
    description: "नेपालका सार्वजनिक सेवाहरूको अनुभव ट्र्याक गर्ने प्लेटफर्म",
    url: "/",
    siteName: "Service Pulse",
    type: "website",
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: "Service Pulse",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Service Pulse | सेवा सूचक",
    description: "नेपालका सार्वजनिक सेवाहरूको अनुभव ट्र्याक गर्ने प्लेटफर्म",
    images: [socialImage],
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon.ico" },
    ],
    apple: { url: "/icons/apple-touch-icon.png" },
  },
  manifest: "/icons/site.webmanifest",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-gray-50 dark:bg-gray-900">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <SessionWrapper>
          <I18nProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </I18nProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
