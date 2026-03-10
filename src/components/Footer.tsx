"use client";

import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { locale, t } = useI18n();
  return (
    <footer className="bg-white border-t mt-12 py-6 text-center text-sm text-gray-500">
      <p>
        {t("admin.servicePulse")} &copy; {new Date().getFullYear()}
      </p>
      <p className="text-xs mt-1">
        {locale === "np"
          ? "नेपालमा सार्वजनिक सेवाहरूको जवाफदेहिता कायम राख्दै। 🇳🇵"
          : "Maintaining accountability of public services in Nepal 🇳🇵"}
      </p>
    </footer>
  );
}