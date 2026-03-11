"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { getStatusFromAvg } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import StarRating from "./StarRating";

interface ServiceCardProps {
  id: string;
  name: string;
  nameNp: string;
  type: string;
  location?: string | null;
  avgRating?: number | null;
  avgTime?: number | null;
  reportCount?: number;
  constituencyId: string;
}

const SERVICE_ICONS: Record<string, string> = {
  hospital: "🏥",
  government_office: "🏛️",
  transport: "🚌",
  education: "🎓",
  utility: "⚡",
  police: "👮",
  bank: "🏦",
  other: "🏢",
};

export default function ServiceCard({
  id, name, nameNp, type, location, avgRating, avgTime, reportCount = 0,
}: ServiceCardProps) {
  const { t, locale } = useI18n();
  const status = getStatusFromAvg(avgTime ?? null);
  const icon = SERVICE_ICONS[type] || "🏢";

  return (
    <Link
      href={`/services/${id}`}
      className="block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 hover:shadow-md hover:border-orange-300 dark:hover:border-orange-500 transition-all p-4 group"
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-orange-600 transition-colors">
            {locale === "np" ? nameNp : name}
          </h3>
          {location && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">📍 {location}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            <span className="text-xs text-gray-500">{reportCount} {t("service.reports")}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("service.avgWait")}</p>
          <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">
            {avgTime ? `${Math.round(avgTime)} ${t("home.minutes")}` : "—"}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("service.avgRating")}</p>
          {avgRating ? (
            <StarRating rating={Math.round(avgRating)} size="sm" />
          ) : (
            <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">—</p>
          )}
        </div>
      </div>

      <div className="mt-2 text-center">
        <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">
          {t(`service.type.${type}`)}
        </span>
      </div>
    </Link>
  );
}
