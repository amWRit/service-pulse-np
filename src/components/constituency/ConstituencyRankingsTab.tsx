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
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {section.title}
            </h3>

            {section.items.length > 0 ? (
              <div className="space-y-3">
                {section.items.map((service, index) => (
                  <div
                    key={`${section.key}-${service.id}`}
                    className="flex items-start gap-3 rounded-xl border border-gray-100 dark:border-gray-800 px-3 py-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 flex items-center justify-center text-sm font-bold shrink-0">
                      {formatNumber(index + 1, 0)}
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
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {section.value(service)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatNumber(service.reportCount ?? 0, 0)} {t("service.reports")}
                      </p>
                    </div>
                  </div>
                ))}
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
