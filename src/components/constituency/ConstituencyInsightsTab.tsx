"use client";

import Link from "next/link";
import { Service, SummaryCard } from "@/components/constituency/types";

interface ConstituencyInsightsTabProps {
  t: (key: string) => string;
  serviceTypes: string[];
  summaryCards: SummaryCard[];
  bubbleServices: Service[];
  timeMin: number;
  timeMax: number;
  ratingMin: number;
  ratingMax: number;
  reportMin: number;
  reportMax: number;
  formatNumber: (value: number, maximumFractionDigits?: number) => string;
  getServiceName: (service: Service) => string;
  getTypeColorClass: (type: string) => string;
}

function normalize(value: number, min: number, max: number) {
  if (min === max) return 0.5;
  return (value - min) / (max - min);
}

export default function ConstituencyInsightsTab({
  t,
  serviceTypes,
  summaryCards,
  bubbleServices,
  timeMin,
  timeMax,
  ratingMin,
  ratingMax,
  reportMin,
  reportMax,
  formatNumber,
  getServiceName,
  getTypeColorClass,
}: ConstituencyInsightsTabProps) {
  const summaryBadgeLabel = (key: string) => {
    if (key === "best-rated") return t("constituency.summary.badges.bestRated");
    if (key === "fastest") return t("constituency.summary.badges.fastest");
    return t("constituency.summary.badges.mostReported");
  };

  const summaryBadgeEmoji = (key: string) => {
    if (key === "best-rated") return "⭐";
    if (key === "fastest") return "⚡";
    return "🔥";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t("constituency.insights.title")}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {t("constituency.insights.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.key}
            className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full bg-orange-200/40 dark:bg-orange-500/20 blur-2xl" />
            <div className="pointer-events-none absolute -left-6 -bottom-8 h-20 w-20 rounded-full bg-sky-200/40 dark:bg-sky-500/20 blur-2xl" />
            <div className={`h-1.5 bg-gradient-to-r ${card.accent}`} />
            <div className="p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900 px-2.5 py-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                  <span aria-hidden>{summaryBadgeEmoji(card.key)}</span>
                  {summaryBadgeLabel(card.key)}
                </span>
                <span className="text-lg" aria-hidden>{summaryBadgeEmoji(card.key)}</span>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.title}
              </p>
              {card.service ? (
                <>
                  <Link
                    href={`/services/${card.service.id}`}
                    className="mt-3 block text-lg font-bold text-gray-900 dark:text-white hover:text-orange-500 transition-colors"
                  >
                    {getServiceName(card.service)}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t(`service.type.${card.service.type}`)}
                  </p>
                  <p className="mt-4 text-2xl font-extrabold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(card.service.reportCount ?? 0, 0)} {t("service.reports")}
                    </p>
                    <div className="h-2 w-16 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-orange-400 to-pink-500" />
                    </div>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  {t("constituency.summary.noData")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("constituency.chart.title")}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {t("constituency.chart.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/40 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              {t("constituency.chart.fastHigh")}
            </p>
          </div>
          <div className="rounded-xl border border-orange-100 dark:border-orange-900/60 bg-orange-50/80 dark:bg-orange-950/40 px-4 py-3">
            <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
              {t("constituency.chart.slowHigh")}
            </p>
          </div>
          <div className="rounded-xl border border-sky-100 dark:border-sky-900/60 bg-sky-50/80 dark:bg-sky-950/40 px-4 py-3">
            <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">
              {t("constituency.chart.fastLow")}
            </p>
          </div>
          <div className="rounded-xl border border-rose-100 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 px-4 py-3">
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              {t("constituency.chart.slowLow")}
            </p>
          </div>
        </div>

        {bubbleServices.length > 0 ? (
          <>
            <div className="relative h-[24rem] rounded-2xl bg-gray-50 dark:bg-gray-950 border border-dashed border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
                <div className="bg-emerald-50/35 dark:bg-emerald-950/15" />
                <div className="bg-orange-50/35 dark:bg-orange-950/15" />
                <div className="bg-sky-50/35 dark:bg-sky-950/15" />
                <div className="bg-rose-50/35 dark:bg-rose-950/15" />
              </div>
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                {Array.from({ length: 16 }).map((_, index) => (
                  <div key={index} className="border border-gray-200/70 dark:border-gray-800/80" />
                ))}
              </div>

              {bubbleServices.map((service) => {
                const rating = service.avgRating as number;
                const time = service.avgTime as number;
                const reports = service.reportCount ?? 0;
                const left = 10 + normalize(time, timeMin, timeMax) * 80;
                const top = 90 - normalize(rating, ratingMin, ratingMax) * 80;
                const size = 18 + normalize(reports, reportMin, reportMax) * 28;

                return (
                  <div
                    key={service.id}
                    className="absolute"
                    style={{ left: `${left}%`, top: `${top}%`, transform: "translate(-50%, -50%)" }}
                  >
                    <div
                      className={`rounded-full border-2 shadow-lg backdrop-blur-sm ${getTypeColorClass(service.type)}`}
                      style={{ width: size, height: size }}
                      title={`${getServiceName(service)} • ${formatNumber(rating)} / 5 • ${formatNumber(time)} ${t("home.minutes")} • ${formatNumber(reports, 0)} ${t("service.reports")}`}
                      aria-label={`${getServiceName(service)} ${formatNumber(rating)} / 5 ${formatNumber(time)} ${t("home.minutes")}`}
                    />
                    <p className="hidden lg:block relative left-1/2 -translate-x-1/2 mt-2 text-[11px] whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {getServiceName(service)}
                    </p>
                  </div>
                );
              })}

              <div className="absolute left-4 bottom-3 text-xs text-gray-500 dark:text-gray-400">
                {t("constituency.chart.xAxis")}
              </div>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-xs text-gray-500 dark:text-gray-400">
                {t("constituency.chart.yAxis")}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span>{t("constituency.chart.bubbleHint")}</span>
              <span>
                {formatNumber(timeMin)}–{formatNumber(timeMax)} {t("home.minutes")}
              </span>
              <span>
                {formatNumber(ratingMin)}–{formatNumber(ratingMax)} / 5
              </span>
            </div>

            {serviceTypes.filter((type) => type !== "all").length > 0 && (
              <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-950/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                  {t("constituency.chart.legendTitle")}
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
                  {serviceTypes.filter((type) => type !== "all").map((type) => (
                    <span
                      key={type}
                      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300"
                    >
                      <span className={`h-3 w-3 rounded-full border ${getTypeColorClass(type)}`} />
                      {t(`service.type.${type}`)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl bg-gray-50 dark:bg-gray-950 px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            {t("constituency.chart.noData")}
          </div>
        )}
      </div>
    </div>
  );
}
