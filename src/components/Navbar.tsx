"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { Activity } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const { t, locale, setLocale } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-orange-600">
          <Activity className="w-6 h-6" />
          <span className="hidden sm:block">{t("admin.servicePulse")}</span>
          <span className="block sm:hidden"></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/" className="text-gray-700 dark:text-gray-200 hover:text-orange-600 font-medium transition-colors">
            {t("nav.home")}
          </Link>
          <Link href="/constituencies" className="text-gray-700 dark:text-gray-200 hover:text-orange-600 font-medium transition-colors">
            {t("nav.constituencies")}
          </Link>
          {session?.user.role === "admin" && (
            <Link href="/admin" className="text-gray-700 dark:text-gray-200 hover:text-orange-600 font-medium transition-colors">
              {t("nav.admin")}
            </Link>
          )}
          {session && (
            <Link href="/badges" className="text-gray-700 dark:text-gray-200 hover:text-orange-600 font-medium transition-colors">
              {t("nav.myBadges")}
            </Link>
          )}

          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === "en" ? "np" : "en")}
            className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-full px-3 py-1 font-semibold transition-colors"
          >
            {locale === "en" ? "नेपाली" : "English"}
          </button>

          {session ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">{session.user.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-red-100 hover:bg-red-200 text-red-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
              >
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            >
              {t("nav.login")}
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="text-xl">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-700 px-4 py-3 flex flex-col gap-3">
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-gray-700 dark:text-gray-200 font-medium py-2">{t("nav.home")}</Link>
          <Link href="/constituencies" onClick={() => setMenuOpen(false)} className="text-gray-700 dark:text-gray-200 font-medium py-2">{t("nav.constituencies")}</Link>
          {session?.user.role === "admin" && (
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-gray-700 dark:text-gray-200 font-medium py-2">{t("nav.admin")}</Link>
          )}
          {session && (
            <Link href="/badges" onClick={() => setMenuOpen(false)} className="text-gray-700 dark:text-gray-200 font-medium py-2">{t("nav.myBadges")}</Link>
          )}
          <button
            onClick={() => { setLocale(locale === "en" ? "np" : "en"); setMenuOpen(false); }}
            className="text-sm bg-orange-100 text-orange-700 rounded-full px-3 py-1.5 font-semibold w-fit"
          >
            {locale === "en" ? "नेपाली" : "English"}
          </button>
          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-red-100 text-red-700 rounded-lg px-3 py-2 text-sm font-medium w-fit"
            >
              {t("nav.logout")}
            </button>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="bg-orange-500 text-white rounded-lg px-4 py-2 text-sm font-semibold w-fit">
              {t("nav.login")}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
