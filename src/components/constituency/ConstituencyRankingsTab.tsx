"use client";

import Link from "next/link";
import { Service } from "@/components/constituency/types";

interface RankingSection {
  key: string;
  title: string;
  items: Service[];
  value: (service: Service) => string;
}

interface ConstituencyRankingsTabProps {
  t: (key: string) => string;
  sections: RankingSection[];
  formatNumber: (value: number, maximumFractionDigits?: number) => string;
  getServiceName: (service: Service) => string;
}

export default function ConstituencyRankingsTab({
  t,
  sections,
  formatNumber,
  getServiceName,
}: ConstituencyRankingsTabProps) {
  const getSectionIcon = (key: string) => {
    if (key === "rating") return "⭐";
    if (key === "time") return "⚡";
    if (key === "reports") return "📣";
    return "🏁";
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return {
        label: "🥇",
        className: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200/70 dark:ring-amber-800/60",
      };
    }
    if (index === 1) {
      return {
        label: "🥈",
        className: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 ring-1 ring-slate-200/70 dark:ring-slate-700/70",
      };
    }
    if (index === 2) {
      return {
        label: "🥉",
        className: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 ring-1 ring-orange-200/70 dark:ring-orange-800/60",
      };
    }
    return {
      label: formatNumber(index + 1, 0),
      className: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200",
    };
  };

  const getRowClass = (index: number) => {
    if (index === 0) {
      return "border-amber-200/80 dark:border-amber-800/70 bg-gradient-to-r from-amber-50 to-white dark:from-amber-950/30 dark:to-gray-900";
    }
    if (index === 1) {
      return "border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/70 dark:to-gray-900";
    }
    if (index === 2) {
      return "border-orange-200/80 dark:border-orange-800/70 bg-gradient-to-r from-orange-50 to-white dark:from-orange-950/30 dark:to-gray-900";
    }
    return "border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/70";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t("constituency.rankings.title")}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {t("constituency.rankings.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <div
            key={section.key}
            className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 flex items-center justify-center text-sm">
                {getSectionIcon(section.key)}
              </span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {section.title}
              </h3>
            </div>

            {section.items.length > 0 ? (
              <div className="space-y-3">
                {section.items.map((service, index) => {
                  const badge = getRankBadge(index);
                  return (
                  <div
                    key={`${section.key}-${service.id}`}
                    className={`flex items-start gap-3 rounded-xl border px-3 py-3 transition-colors ${getRowClass(index)}`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${badge.className}`}>
                      {badge.label}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/services/${service.id}`}
                        className="font-semibold text-gray-900 dark:text-white hover:text-orange-500 transition-colors block truncate"
                      >
                        {getServiceName(service)}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t(`service.type.${service.type}`)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                        {section.value(service)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                        {formatNumber(service.reportCount ?? 0, 0)} {t("service.reports")}
                      </p>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 dark:bg-gray-950 px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                {t("constituency.rankings.empty")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
