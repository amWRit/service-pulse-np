"use client";

import Link from "next/link";
import StarRating from "@/components/StarRating";
import { GlobalServiceEntry, ServiceEntry } from "@/components/home/types";

interface Option {
  value: string;
  label: string;
}

interface HomeInsightsTabProps {
  t: (key: string) => string;
  locale: "en" | "np";
  loading: boolean;
  stats: { constituencies: number; services: number; reports: number };
  avgWait: number;
  avgRating: number;
  bestRated: ServiceEntry | null;
  fastest: ServiceEntry | null;
  mostReported: ServiceEntry | null;
  chartProvince: string;
  setChartProvince: (value: string) => void;
  chartConstituency: string;
  setChartConstituency: (value: string) => void;
  chartServiceType: string;
  setChartServiceType: (value: string) => void;
  provinceOptions: Option[];
  constituencyOptions: Option[];
  chartServiceTypes: string[];
  filteredChartServices: GlobalServiceEntry[];
  timeMin: number;
  timeMax: number;
  ratingMin: number;
  ratingMax: number;
  reportMin: number;
  reportMax: number;
  filteredLegendTypes: string[];
  chartServicesLength: number;
  getTypeColorClass: (type: string) => string;
}

function normalize(value: number, min: number, max: number) {
  if (min === max) return 0.5;
  return (value - min) / (max - min);
}

export default function HomeInsightsTab({
  t,
  locale,
  loading,
  stats,
  avgWait,
  avgRating,
  bestRated,
  fastest,
  mostReported,
  chartProvince,
  setChartProvince,
  chartConstituency,
  setChartConstituency,
  chartServiceType,
  setChartServiceType,
  provinceOptions,
  constituencyOptions,
  chartServiceTypes,
  filteredChartServices,
  timeMin,
  timeMax,
  ratingMin,
  ratingMax,
  reportMin,
  reportMax,
  filteredLegendTypes,
  chartServicesLength,
  getTypeColorClass,
}: HomeInsightsTabProps) {
  const metricCards = [
    {
      key: "constituencies",
      label: t("nav.constituencies"),
      value: String(stats.constituencies),
      emoji: "🗺️",
      accent: "from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/20",
      border: "border-sky-100 dark:border-sky-900/50",
      valueColor: "text-sky-700 dark:text-sky-300",
    },
    {
      key: "services",
      label: t("nav.services"),
      value: String(stats.services),
      emoji: "🛠️",
      accent: "from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/20",
      border: "border-indigo-100 dark:border-indigo-900/50",
      valueColor: "text-indigo-700 dark:text-indigo-300",
    },
    {
      key: "reports",
      label: t("home.totalReports"),
      value: String(stats.reports),
      emoji: "📣",
      accent: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20",
      border: "border-orange-100 dark:border-orange-900/50",
      valueColor: "text-orange-700 dark:text-orange-300",
    },
    {
      key: "avgWait",
      label: t("home.avgWaitTime"),
      value: `${avgWait.toFixed(1)} ${t("home.minutes")}`,
      emoji: "⏱️",
      accent: "from-emerald-50 to-lime-50 dark:from-emerald-950/30 dark:to-lime-950/20",
      border: "border-emerald-100 dark:border-emerald-900/50",
      valueColor: "text-emerald-700 dark:text-emerald-300",
    },
    {
      key: "avgRating",
      label: t("home.avgRating"),
      value: `${avgRating.toFixed(1)} / 5`,
      emoji: "⭐",
      accent: "from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/30 dark:to-pink-950/20",
      border: "border-fuchsia-100 dark:border-fuchsia-900/50",
      valueColor: "text-fuchsia-700 dark:text-fuchsia-300",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {metricCards.map((card) => (
          <div
            key={card.key}
            className={`rounded-2xl border p-4 shadow-sm bg-gradient-to-br ${card.accent} ${card.border}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                {card.label}
              </p>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 dark:bg-gray-900/70 text-sm">
                {card.emoji}
              </span>
            </div>
            <p className={`mt-2 text-2xl font-extrabold ${card.valueColor}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("home.insights.title")}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t("home.insights.subtitle")}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-36 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !bestRated && !fastest && !mostReported ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p>{t("home.insights.noData")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: "best", label: t("home.insights.bestRated"), emoji: "⭐", service: bestRated },
              { key: "fast", label: t("home.insights.fastest"), emoji: "⚡", service: fastest },
              { key: "reported", label: t("home.insights.mostReported"), emoji: "🔥", service: mostReported },
            ].map((item) => (
              <div
                key={item.key}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {item.emoji} {item.label}
                </p>
                {item.service ? (
                  <>
                    <Link
                      href={`/services/${item.service.id}`}
                      className="mt-3 block text-lg font-bold text-gray-900 dark:text-white hover:text-orange-500 transition-colors"
                    >
                      {locale === "np" ? item.service.nameNp : item.service.name}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {locale === "np" ? item.service.constituency.nameNp : item.service.constituency.name}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-bold text-orange-600">
                        {Math.round(item.service.avgTime)} {t("home.minutes")}
                      </span>
                      <StarRating rating={Math.round(item.service.avgRating)} size="sm" />
                      <span className="text-gray-500 dark:text-gray-400">
                        {item.service.reportCount} {t("service.reports")}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t("home.insights.noData")}</p>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("home.insights.chart.title")}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t("home.insights.chart.subtitle")}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 mb-4">
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("home.insights.chart.filters.province")}</span>
                <select
                  value={chartProvince}
                  onChange={(event) => {
                    setChartProvince(event.target.value);
                    setChartConstituency("all");
                  }}
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
                >
                  <option value="all">{t("admin.allProvinces")}</option>
                  {provinceOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("home.insights.chart.filters.constituency")}</span>
                <select
                  value={chartConstituency}
                  onChange={(event) => setChartConstituency(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
                >
                  <option value="all">{t("admin.allConstituencies")}</option>
                  {constituencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("home.insights.chart.filters.serviceType")}</span>
                <select
                  value={chartServiceType}
                  onChange={(event) => setChartServiceType(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
                >
                  <option value="all">{t("admin.allServices")}</option>
                  {chartServiceTypes.map((type) => (
                    <option key={type} value={type}>{t(`service.type.${type}`)}</option>
                  ))}
                </select>
              </label>
            </div>

            <details className="mb-4 mt-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/50 p-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-between">
                <span>{t("home.insights.chart.guideTitle")}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{t("home.insights.chart.guideToggle")}</span>
              </summary>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/40 px-4 py-3">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{t("home.insights.chart.fastHigh")}</p>
                </div>
                <div className="rounded-xl border border-orange-100 dark:border-orange-900/60 bg-orange-50/80 dark:bg-orange-950/40 px-4 py-3">
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">{t("home.insights.chart.slowHigh")}</p>
                </div>
                <div className="rounded-xl border border-sky-100 dark:border-sky-900/60 bg-sky-50/80 dark:bg-sky-950/40 px-4 py-3">
                  <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">{t("home.insights.chart.fastLow")}</p>
                </div>
                <div className="rounded-xl border border-rose-100 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 px-4 py-3">
                  <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{t("home.insights.chart.slowLow")}</p>
                </div>
              </div>
            </details>

            {filteredChartServices.length > 0 ? (
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

                  {filteredChartServices.map((service) => {
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
                          title={`${locale === "np" ? service.nameNp : service.name} • ${(Math.round(rating * 10) / 10).toFixed(1)} / 5 • ${(Math.round(time * 10) / 10).toFixed(1)} ${t("home.minutes")}`}
                        />
                        <p className="hidden lg:block relative left-1/2 -translate-x-1/2 mt-2 text-[11px] whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {locale === "np" ? service.nameNp : service.name}
                        </p>
                      </div>
                    );
                  })}

                  <div className="absolute left-4 bottom-3 text-xs text-gray-500 dark:text-gray-400">
                    {t("home.insights.chart.xAxis")}
                  </div>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-xs text-gray-500 dark:text-gray-400">
                    {t("home.insights.chart.yAxis")}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>{t("home.insights.chart.bubbleHint")}</span>
                  <span>
                    {Math.round(timeMin * 10) / 10}–{Math.round(timeMax * 10) / 10} {t("home.minutes")}
                  </span>
                  <span>
                    {Math.round(ratingMin * 10) / 10}–{Math.round(ratingMax * 10) / 10} / 5
                  </span>
                </div>

                {filteredLegendTypes.length > 0 && (
                  <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-950/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                      {t("home.insights.chart.legendTitle")}
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
                      {filteredLegendTypes.map((type) => (
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
              <div className="rounded-2xl bg-gray-50 dark:bg-gray-950 px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                {chartServicesLength > 0
                  ? t("home.insights.chart.noMatch")
                  : t("home.insights.chart.noData")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
