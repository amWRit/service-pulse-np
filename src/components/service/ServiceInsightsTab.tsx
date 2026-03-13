"use client";

import { useMemo, useState } from "react";
import { BarChart3, CalendarRange, ChartLine, Clock3, GitCompareArrows, Group, Maximize2, Minimize2, Star, TrendingUp } from "lucide-react";

type InsightMetric = "rating" | "wait";
type InsightGrouping = "month" | "year";
type InsightRange = "1w" | "3m" | "12m" | "all";
type TrendState = "improving" | "stable" | "declining" | "insufficient";

interface InsightReport {
  createdAt: string;
  rating: number;
  serviceTimeMinutes: number;
}

interface ComparisonAverage {
  avgRating: number | null;
  avgTime: number | null;
  reportCount: number;
}

interface ServiceInsightsTabProps {
  locale: "en" | "np";
  t: (key: string) => string;
  reports: InsightReport[];
  avgRating: number | null;
  avgTime: number | null;
  reportCount: number;
  constituencyAverage: ComparisonAverage;
  similarServicesAverage: ComparisonAverage;
}

interface AggregatedPoint {
  key: string;
  label: string;
  avgRating: number | null;
  avgWait: number | null;
  reportCount: number;
  start: Date;
}

const METRICS: InsightMetric[] = ["rating", "wait"];
const GROUPINGS: InsightGrouping[] = ["month", "year"];
const RANGES: InsightRange[] = ["1w", "3m", "12m", "all"];

function formatLocale(locale: "en" | "np") {
  return locale === "np" ? "ne-NP" : "en-US";
}

function formatNumber(locale: "en" | "np", value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat(formatLocale(locale), {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits > 0 ? 0 : 0,
  }).format(value);
}

function formatSigned(locale: "en" | "np", value: number, maximumFractionDigits = 1) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatNumber(locale, Math.abs(value), maximumFractionDigits)}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1);
}

function subtractMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() - months, 1);
}

function subtractDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() - days);
  return next;
}

function getPeriodStart(date: Date, grouping: InsightGrouping) {
  return grouping === "year" ? startOfYear(date) : startOfMonth(date);
}

function getPeriodKey(date: Date, grouping: InsightGrouping) {
  if (grouping === "year") return `${date.getFullYear()}`;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getPeriodLabel(locale: "en" | "np", date: Date, grouping: InsightGrouping) {
  if (grouping === "year") {
    return new Intl.DateTimeFormat(formatLocale(locale), { year: "numeric" }).format(date);
  }

  return new Intl.DateTimeFormat(formatLocale(locale), {
    month: "short",
    year: "numeric",
  }).format(date);
}

function buildLinePath(
  points: AggregatedPoint[],
  getValue: (point: AggregatedPoint) => number | null,
  xForIndex: (index: number) => number,
  yForValue: (value: number) => number
) {
  let path = "";

  points.forEach((point, index) => {
    const value = getValue(point);
    if (value === null) return;
    const command = path ? "L" : "M";
    path += `${command}${xForIndex(index)},${yForValue(value)} `;
  });

  return path.trim();
}

export default function ServiceInsightsTab({
  locale,
  t,
  reports,
  avgRating,
  avgTime,
  reportCount,
  constituencyAverage,
  similarServicesAverage,
}: ServiceInsightsTabProps) {
  const [metric, setMetric] = useState<InsightMetric>("rating");
  const [grouping, setGrouping] = useState<InsightGrouping>("month");
  const [range, setRange] = useState<InsightRange>("12m");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isChartExpanded, setIsChartExpanded] = useState(false);

  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [reports]
  );

  const filteredReports = useMemo(() => {
    if (range === "all") return sortedReports;
    if (range === "1w") {
      const cutoff = subtractDays(new Date(), 6);
      return sortedReports.filter((report) => new Date(report.createdAt) >= cutoff);
    }
    const months = range === "3m" ? 3 : 12;
    const cutoff = subtractMonths(new Date(), months - 1);
    return sortedReports.filter((report) => new Date(report.createdAt) >= cutoff);
  }, [range, sortedReports]);

  const aggregatedPoints = useMemo(() => {
    const groups = new Map<string, { start: Date; totalRating: number; totalWait: number; count: number }>();

    filteredReports.forEach((report) => {
      const date = new Date(report.createdAt);
      const start = getPeriodStart(date, grouping);
      const key = getPeriodKey(start, grouping);
      const current = groups.get(key) ?? { start, totalRating: 0, totalWait: 0, count: 0 };
      current.totalRating += report.rating;
      current.totalWait += report.serviceTimeMinutes;
      current.count += 1;
      groups.set(key, current);
    });

    return Array.from(groups.entries())
      .map(([key, value]) => ({
        key,
        label: getPeriodLabel(locale, value.start, grouping),
        avgRating: value.count > 0 ? value.totalRating / value.count : null,
        avgWait: value.count > 0 ? value.totalWait / value.count : null,
        reportCount: value.count,
        start: value.start,
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [filteredReports, grouping, locale]);

  const activePointIndex = hoveredIndex ?? Math.max(aggregatedPoints.length - 1, 0);
  const activePoint = aggregatedPoints[activePointIndex] ?? null;
  const populatedPoints = aggregatedPoints.filter((point) => point.reportCount > 0);
  const selectedReports = populatedPoints.reduce((sum, point) => sum + point.reportCount, 0);
  const avgReportsPerPeriod = populatedPoints.length > 0 ? selectedReports / populatedPoints.length : 0;

  const trend = useMemo(() => {
    const resolveState = (ratingDelta: number, waitDelta: number): TrendState => {
      if (metric === "rating") {
        if (ratingDelta > 0.2) return "improving";
        if (ratingDelta < -0.2) return "declining";
        return "stable";
      }

      if (waitDelta < -5) return "improving";
      if (waitDelta > 5) return "declining";
      return "stable";
    };

    if (populatedPoints.length >= 2) {
      const current = populatedPoints[populatedPoints.length - 1];
      const previous = populatedPoints[populatedPoints.length - 2];
      const ratingDelta = (current.avgRating ?? 0) - (previous.avgRating ?? 0);
      const waitDelta = (current.avgWait ?? 0) - (previous.avgWait ?? 0);
      return { state: resolveState(ratingDelta, waitDelta), ratingDelta, waitDelta };
    }

    if (filteredReports.length >= 2) {
      const current = filteredReports[filteredReports.length - 1];
      const previous = filteredReports[filteredReports.length - 2];
      const ratingDelta = current.rating - previous.rating;
      const waitDelta = current.serviceTimeMinutes - previous.serviceTimeMinutes;
      return { state: resolveState(ratingDelta, waitDelta), ratingDelta, waitDelta };
    }

    return {
      state: "insufficient" as TrendState,
      ratingDelta: 0,
      waitDelta: 0,
    };
  }, [filteredReports, metric, populatedPoints]);

  const ratingMax = 5;
  const ratingMin = 1;
  const waitMax = Math.max(...aggregatedPoints.map((point) => point.avgWait ?? 0), avgTime ?? 0, 5);
  const waitMin = 0;

  const chartWidth = isChartExpanded ? 1100 : 920;
  const chartHeight = isChartExpanded ? 460 : 360;
  const leftPadding = 44;
  const rightPadding = 20;
  const topPadding = 20;
  const bottomPadding = 42;
  const innerWidth = chartWidth - leftPadding - rightPadding;
  const innerHeight = chartHeight - topPadding - bottomPadding;

  const xForIndex = (index: number) => {
    if (aggregatedPoints.length <= 1) return leftPadding + innerWidth / 2;
    return leftPadding + (index / (aggregatedPoints.length - 1)) * innerWidth;
  };

  const yForRating = (value: number) => {
    const ratio = (value - ratingMin) / (ratingMax - ratingMin || 1);
    return topPadding + innerHeight - ratio * innerHeight;
  };

  const yForWait = (value: number) => {
    const ratio = (value - waitMin) / (waitMax - waitMin || 1);
    return topPadding + innerHeight - ratio * innerHeight;
  };

  const ratingPath = buildLinePath(aggregatedPoints, (point) => point.avgRating, xForIndex, yForRating);
  const waitPath = buildLinePath(aggregatedPoints, (point) => point.avgWait, xForIndex, yForWait);
  const selectedPath = metric === "rating" ? ratingPath : waitPath;

  const trendColorClass = {
    improving: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/70",
    stable: "bg-slate-100 text-slate-800 dark:bg-slate-900/60 dark:text-slate-300 border-slate-200 dark:border-slate-800",
    declining: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900/70",
    mixed: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/70",
    insufficient: "bg-gray-100 text-gray-700 dark:bg-gray-900/60 dark:text-gray-300 border-gray-200 dark:border-gray-800",
  }[trend.state];

  const compareRating = (base: number | null, comparison: number | null) => {
    if (base === null || comparison === null) return "—";
    const delta = base - comparison;
    if (Math.abs(delta) < 0.05) return t("service.insights.comparison.same");
    return `${formatSigned(locale, delta)} ${t(delta > 0 ? "service.insights.comparison.higher" : "service.insights.comparison.lower")}`;
  };

  const compareWait = (base: number | null, comparison: number | null) => {
    if (base === null || comparison === null) return "—";
    const delta = base - comparison;
    if (Math.abs(delta) < 1) return t("service.insights.comparison.same");
    return `${formatNumber(locale, Math.abs(delta), 0)} ${t(delta < 0 ? "service.insights.comparison.faster" : "service.insights.comparison.slower")}`;
  };

  const takeaway = useMemo(() => {
    if (trend.state === "insufficient") {
      return t("service.insights.takeaway.noData");
    }

    const parts = [t(`service.insights.trend.${trend.state}`), t("service.insights.trend.vsPrevious")];

    if (avgTime !== null && constituencyAverage.avgTime !== null) {
      parts.push(
        avgTime <= constituencyAverage.avgTime
          ? t("service.insights.takeaway.fasterThanConstituency")
          : t("service.insights.takeaway.slowerThanConstituency")
      );
    }

    if (avgRating !== null && similarServicesAverage.avgRating !== null) {
      parts.push(
        avgRating >= similarServicesAverage.avgRating
          ? t("service.insights.takeaway.aboveSimilarRating")
          : t("service.insights.takeaway.belowSimilarRating")
      );
    }

    return parts.join(" · ");
  }, [avgRating, avgTime, constituencyAverage.avgTime, similarServicesAverage.avgRating, t, trend.state]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/30 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1.5">
                <span aria-hidden>📈</span>
                {t("service.insights.summary.trend")}
              </p>
              <p className="mt-2 text-xl font-extrabold text-gray-900 dark:text-white">{t(`service.insights.trend.${trend.state}`)}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {trend.state === "insufficient"
                  ? t("service.insights.trend.insufficient")
                  : metric === "wait"
                    ? `${formatSigned(locale, trend.waitDelta, 0)} ${t("home.minutes")}`
                    : metric === "rating"
                      ? `${formatSigned(locale, trend.ratingDelta)} / 5`
                      : `${formatSigned(locale, trend.ratingDelta)} / 5 • ${formatSigned(locale, trend.waitDelta, 0)} ${t("home.minutes")}`}
              </p>
            </div>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${trendColorClass}`}>
              <TrendingUp className="h-3.5 w-3.5" />
              {t(`service.insights.trend.${trend.state}`)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-100 dark:border-violet-900/60 bg-violet-50/80 dark:bg-violet-950/30 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300 inline-flex items-center gap-1.5">
            <span aria-hidden>💡</span>
            {t("service.insights.takeaway.title")}
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-300">{takeaway}</p>
        </div>

      </div>

       {isChartExpanded && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsChartExpanded(false)}
        />
      )}

      <div
        className={`${isChartExpanded ? "fixed inset-4 z-50 overflow-y-auto rounded-3xl" : "rounded-2xl"} border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="inline-flex items-center gap-2.5 text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300">
                <ChartLine className="h-4.5 w-4.5" />
              </span>
              <span>{t("service.insights.chart.title")}</span>
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t("service.insights.chart.subtitle")}</p>
          </div>
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => setIsChartExpanded((value) => !value)}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:border-orange-300 hover:text-orange-600 dark:hover:border-orange-700 dark:hover:text-orange-300 transition-colors"
            >
              {isChartExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span className="hidden sm:inline">
                {isChartExpanded ? t("service.insights.chart.closeExpanded") : t("service.insights.chart.expand")}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <span className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <GitCompareArrows className="h-3.5 w-3.5" />
                {t("service.insights.metric")}
              </span>
              <select
                value={metric}
                onChange={(event) => setMetric(event.target.value as InsightMetric)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
              >
                {METRICS.map((option) => (
                  <option key={option} value={option}>
                    {t(`service.insights.metrics.${option}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <Group className="h-3.5 w-3.5" />
                {t("service.insights.groupBy")}
              </span>
              <select
                value={grouping}
                onChange={(event) => setGrouping(event.target.value as InsightGrouping)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
              >
                {GROUPINGS.map((option) => (
                  <option key={option} value={option}>
                    {t(`service.insights.grouping.${option}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <CalendarRange className="h-3.5 w-3.5" />
                {t("service.insights.range")}
              </span>
              <select
                value={range}
                onChange={(event) => setRange(event.target.value as InsightRange)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
              >
                {RANGES.map((option) => (
                  <option key={option} value={option}>
                    {t(`service.insights.rangeOptions.${option}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {aggregatedPoints.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/50 px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              {t("service.insights.chart.noData")}
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/40 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("service.insights.chart.activePeriod")}</p>
                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{activePoint?.label}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatNumber(locale, activePoint?.reportCount ?? 0, 0)} {t("service.insights.chart.reportsLegend")}
                  </p>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white/90 dark:bg-gray-900/80 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("service.avgRating")}</p>
                    <p className="mt-1 text-xl font-bold text-orange-600 dark:text-orange-300">
                      {activePoint?.avgRating !== null && activePoint?.avgRating !== undefined
                        ? `${formatNumber(locale, activePoint.avgRating)} / 5`
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/90 dark:bg-gray-900/80 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("service.avgWait")}</p>
                    <p className="mt-1 text-xl font-bold text-sky-600 dark:text-sky-300">
                      {activePoint?.avgWait !== null && activePoint?.avgWait !== undefined
                        ? `${formatNumber(locale, activePoint.avgWait, 0)} ${t("home.minutes")}`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className={`w-full ${isChartExpanded ? "min-w-[960px]" : "min-w-[760px]"}`}>
                  {[0, 1, 2, 3, 4].map((tick) => {
                    const y = topPadding + (tick / 4) * innerHeight;
                    return (
                      <g key={tick}>
                        <line x1={leftPadding} x2={chartWidth - rightPadding} y1={y} y2={y} stroke="currentColor" className="text-gray-200 dark:text-gray-800" strokeDasharray="4 4" />
                      </g>
                    );
                  })}

                  {[0, 1, 2, 3, 4].map((tick) => {
                    const y = topPadding + (tick / 4) * innerHeight;
                    const value = metric === "rating"
                      ? ratingMax - ((ratingMax - ratingMin) / 4) * tick
                      : waitMax - ((waitMax - waitMin) / 4) * tick;
                    return (
                      <text key={`y-${tick}`} x={leftPadding - 10} y={y + 4} textAnchor="end" className="fill-gray-400 text-[11px]">
                        {metric === "rating" ? formatNumber(locale, value) : formatNumber(locale, value, 0)}
                      </text>
                    );
                  })}

                  <text x={leftPadding} y={14} className={`text-[11px] font-semibold ${metric === "rating" ? "fill-orange-500" : "fill-sky-500"}`}>
                    {metric === "rating" ? t("service.insights.chart.yAxisRating") : t("service.insights.chart.yAxisWait")}
                  </text>

                  {selectedPath && (
                    <path
                      d={selectedPath}
                      fill="none"
                      stroke={metric === "rating" ? "#f97316" : "#0ea5e9"}
                      strokeWidth="3"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  )}

                  {aggregatedPoints.map((point, index) => {
                    const x = xForIndex(index);
                    const showLabel = aggregatedPoints.length <= 6 || index % Math.ceil(aggregatedPoints.length / 6) === 0 || index === aggregatedPoints.length - 1;

                    return (
                      <g key={point.key}>
                        {metric === "rating" && point.avgRating !== null && (
                          <>
                            <circle cx={x} cy={yForRating(point.avgRating)} r={hoveredIndex === index ? 6 : 4} fill="#f97316" />
                            <circle
                              cx={x}
                              cy={yForRating(point.avgRating)}
                              r={14}
                              fill="transparent"
                              onMouseEnter={() => setHoveredIndex(index)}
                              onFocus={() => setHoveredIndex(index)}
                            />
                          </>
                        )}

                        {metric === "wait" && point.avgWait !== null && (
                          <>
                            <circle cx={x} cy={yForWait(point.avgWait)} r={hoveredIndex === index ? 6 : 4} fill="#0ea5e9" />
                            <circle
                              cx={x}
                              cy={yForWait(point.avgWait)}
                              r={14}
                              fill="transparent"
                              onMouseEnter={() => setHoveredIndex(index)}
                              onFocus={() => setHoveredIndex(index)}
                            />
                          </>
                        )}

                        {showLabel && (
                          <text x={x} y={chartHeight - 14} textAnchor="middle" className="fill-gray-400 text-[11px]">
                            {point.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${metric === "rating" ? "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300" : "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300"}`}>
                  <span className={`h-2 w-2 rounded-full ${metric === "rating" ? "bg-orange-500" : "bg-sky-500"}`} />
                  {metric === "rating" ? t("service.insights.chart.ratingLegend") : t("service.insights.chart.waitLegend")}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-amber-100 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300 inline-flex items-center gap-1.5">
            <span aria-hidden>🗓️</span>
            {t("service.insights.summary.periods")}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-xl bg-white/90 dark:bg-gray-900/80 p-3 border border-amber-100/80 dark:border-amber-900/40">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("service.insights.summary.periods")}</p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{formatNumber(locale, populatedPoints.length, 0)}</p>
            </div>
            <div className="rounded-xl bg-white/90 dark:bg-gray-900/80 p-3 border border-amber-100/80 dark:border-amber-900/40">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("service.insights.summary.avgReports")}</p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{formatNumber(locale, avgReportsPerPeriod, 1)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-sky-50/80 dark:bg-sky-950/30 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300 inline-flex items-center gap-1.5">
            <span aria-hidden>🏛️</span>
            {t("service.insights.summary.vsConstituency")}
          </p>
          <div className="mt-3 space-y-3">
            <div className="rounded-xl bg-white/90 dark:bg-gray-900/80 p-3 border border-sky-100/80 dark:border-sky-900/40">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("service.avgRating")}</p>
              <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">{compareRating(avgRating, constituencyAverage.avgRating)}</p>
            </div>
            <div className="rounded-xl bg-white/90 dark:bg-gray-900/80 p-3 border border-sky-100/80 dark:border-sky-900/40">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("service.avgWait")}</p>
              <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">{compareWait(avgTime, constituencyAverage.avgTime)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-fuchsia-100 dark:border-fuchsia-900/60 bg-fuchsia-50/80 dark:bg-fuchsia-950/30 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-700 dark:text-fuchsia-300 inline-flex items-center gap-1.5">
            <span aria-hidden>🧭</span>
            {t("service.insights.summary.vsSimilar")}
          </p>
          <div className="mt-3 space-y-3">
            <div className="rounded-xl bg-white/90 dark:bg-gray-900/80 p-3 border border-fuchsia-100/80 dark:border-fuchsia-900/40">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("service.avgRating")}</p>
              <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">{compareRating(avgRating, similarServicesAverage.avgRating)}</p>
            </div>
            <div className="rounded-xl bg-white/90 dark:bg-gray-900/80 p-3 border border-fuchsia-100/80 dark:border-fuchsia-900/40">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("service.avgWait")}</p>
              <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">{compareWait(avgTime, similarServicesAverage.avgTime)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
