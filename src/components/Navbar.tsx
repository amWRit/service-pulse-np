"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useI18n } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { Activity, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const { t, locale, setLocale } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  const isActivePath = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const desktopLinkClass = (href: string) =>
    isActivePath(href)
      ? "text-orange-600 dark:text-orange-400 font-semibold transition-colors"
      : "text-gray-700 dark:text-gray-200 hover:text-orange-600 font-medium transition-colors";

  const mobileLinkClass = (href: string) =>
    isActivePath(href)
      ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 rounded-lg px-3 py-2 font-semibold"
      : "text-gray-700 dark:text-gray-200 font-medium py-2 px-3";

  // Helper to apply theme
  function applyTheme(theme: "light" | "dark" | "system") {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      // system
      localStorage.removeItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }

  // Sync theme on mount and on system change
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    let initial: "light" | "dark" | "system" = "system";
    if (saved === "light" || saved === "dark") initial = saved;
    setTheme(initial);
    applyTheme(initial);
    if (initial === "system") {
      const listener = (e: MediaQueryListEvent) => {
        applyTheme("system");
      };
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      mql.addEventListener("change", listener);
      return () => mql.removeEventListener("change", listener);
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    let next: "light" | "dark";
    if (theme === "dark") next = "light";
    else next = "dark";
    setTheme(next);
    applyTheme(next);
  };

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
          <Link href="/" className={desktopLinkClass("/")}>
            {t("nav.home")}
          </Link>
          <Link href="/constituencies" className={desktopLinkClass("/constituencies")}>
            {t("nav.constituencies")}
          </Link>
          {session?.user.role === "admin" && (
            <Link href="/admin" className={desktopLinkClass("/admin")}>
              {t("nav.admin")}
            </Link>
          )}
          {session && (
            <Link href="/badges" className={desktopLinkClass("/badges")}>
              {t("nav.myBadges")}
            </Link>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-full p-1.5 transition-colors"
            title={theme === "dark" ? t("admin.switchToLight" as never) : t("admin.switchToDark" as never)}
          >
            {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

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
          <Link href="/" onClick={() => setMenuOpen(false)} className={mobileLinkClass("/")}>{t("nav.home")}</Link>
          <Link href="/constituencies" onClick={() => setMenuOpen(false)} className={mobileLinkClass("/constituencies")}>{t("nav.constituencies")}</Link>
          {session?.user.role === "admin" && (
            <Link href="/admin" onClick={() => setMenuOpen(false)} className={mobileLinkClass("/admin")}>{t("nav.admin")}</Link>
          )}
          {session && (
            <Link href="/badges" onClick={() => setMenuOpen(false)} className={mobileLinkClass("/badges")}>{t("nav.myBadges")}</Link>
          )}
          <button
            onClick={toggleTheme}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-full p-1.5 transition-colors w-fit"
            title={theme === "dark" ? t("admin.switchToLight" as never) : t("admin.switchToDark" as never)}
          >
            {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setLocale(locale === "en" ? "np" : "en")}
            className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-full px-3 py-1 font-semibold transition-colors w-fit"
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
