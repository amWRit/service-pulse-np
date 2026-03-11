"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { gDriveUrl } from "@/lib/utils";

interface ConstituencyCardProps {
  id: string;
  name: string;
  nameNp: string;
  province?: string | null;
  provinceNp?: string | null;
  imageUrl?: string | null;
  serviceCount?: number;
  reportCount?: number;
}

export default function ConstituencyCard({
  id, name, nameNp, province, provinceNp, imageUrl, serviceCount = 0, reportCount = 0,
}: ConstituencyCardProps) {
  const { t, locale } = useI18n();

  return (
    <Link
      href={`/constituencies/${id}`}
      className="block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-orange-300 transition-all group"
    >
      <div className="h-32 bg-gradient-to-br from-orange-400 to-red-500 relative overflow-hidden">
        <Image
          src={imageUrl ? gDriveUrl(imageUrl) : "/images/emblem.jpg"}
          alt={name}
          width={600}
          height={800}
          className="object-cover"
          style={{ maxWidth: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        {province && (
          <span className="absolute top-2 right-2 bg-white/90 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">
            {locale === "np" && provinceNp ? `${provinceNp} प्रदेश` : province}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-orange-600 transition-colors">
          {locale === "np" ? nameNp : name}
        </h3>
        <div className="mt-2 flex gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span>🏢 {serviceCount} {t("nav.services" as never)}</span>
          <span>📋 {reportCount} {t("service.reports" as never)}</span>
        </div>
        <div className="mt-3 text-sm font-semibold text-orange-600 group-hover:underline">
          {t("home.viewServices")} →
        </div>
      </div>
    </Link>
  );
}
