"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import { gDriveUrl } from "@/lib/utils";
import ConstituencyInsightsTab from "@/components/constituency/ConstituencyInsightsTab";
import ConstituencyServicesTab from "@/components/constituency/ConstituencyServicesTab";
import ConstituencyRankingsTab from "@/components/constituency/ConstituencyRankingsTab";
import { Service, SummaryCard } from "@/components/constituency/types";
import { BarChart3, ListChecks, Trophy } from "lucide-react";

type TabKey = "insights" | "services" | "rankings";

const BUBBLE_COLORS = [
  "bg-orange-500/80 border-orange-300",
  "bg-sky-500/80 border-sky-300",
  "bg-emerald-500/80 border-emerald-300",
  "bg-fuchsia-500/80 border-fuchsia-300",
  "bg-amber-500/80 border-amber-300",
  "bg-violet-500/80 border-violet-300",
];

function hasNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

interface Constituency {
  id: string;
  name: string;
  nameNp: string;
  province?: string;
  provinceNp?: string | null;
  imageUrl?: string;
  description?: string;
  district?: { province?: { name: string; nameNp: string } | null } | null;
  services: Service[];
}

interface ConstituencyStats {
  totalReports: number;
  avgRating: number | null;
  avgWaitTime: number | null;
}

export default function ConstituencyPage() {
  const params = useParams();
  const { t, locale } = useI18n();
  const [data, setData] = useState<Constituency | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("insights");
  const [filter, setFilter] = useState("all");

  const id = params.id as string;

  useEffect(() => {
    Promise.all([
      fetch(`/api/constituencies/${id}`).then((r) => r.json()),
      fetch(`/api/services?constituencyId=${id}`).then((r) => r.json()),
      fetch(`/api/services`).then((r) => r.json()),
    ]).then(([constituency, svcs, globalSvcs]) => {
      setData(constituency);
      setServices(svcs);
      setAllServices(globalSvcs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const serviceTypes = ["all", ...Array.from(new Set(services.map((s) => s.type)))];
  const filtered = filter === "all" ? services : services.filter((s) => s.type === filter);
  const servicesWithRatings = services.filter((service) => hasNumber(service.avgRating));
  const servicesWithTime = services.filter((service) => hasNumber(service.avgTime));
  const servicesWithReports = services.filter((service) => (service.reportCount ?? 0) > 0);
  const bubbleServices = services.filter(
    (service) => hasNumber(service.avgRating) && hasNumber(service.avgTime)
  );
  const typeColorMap = new Map<string, string>();

  serviceTypes
    .filter((type) => type !== "all")
    .forEach((type, index) => {
      typeColorMap.set(type, BUBBLE_COLORS[index % BUBBLE_COLORS.length]);
    });

  const bestRated = [...servicesWithRatings].sort(
    (a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0) || (b.reportCount ?? 0) - (a.reportCount ?? 0)
  )[0] ?? null;
  const fastest = [...servicesWithTime].sort(
    (a, b) => (a.avgTime ?? Number.MAX_SAFE_INTEGER) - (b.avgTime ?? Number.MAX_SAFE_INTEGER)
  )[0] ?? null;
  const mostReported = [...servicesWithReports].sort(
    (a, b) => (b.reportCount ?? 0) - (a.reportCount ?? 0) || (b.avgRating ?? 0) - (a.avgRating ?? 0)
  )[0] ?? null;

  const ratingRanking = [...servicesWithRatings].sort(
    (a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0) || (b.reportCount ?? 0) - (a.reportCount ?? 0)
  );
  const timeRanking = [...servicesWithTime].sort(
    (a, b) => (a.avgTime ?? Number.MAX_SAFE_INTEGER) - (b.avgTime ?? Number.MAX_SAFE_INTEGER)
  );
  const reportRanking = [...services].sort(
    (a, b) => (b.reportCount ?? 0) - (a.reportCount ?? 0) || (b.avgRating ?? 0) - (a.avgRating ?? 0)
  ).filter((service) => (service.reportCount ?? 0) > 0);

  const timeValues = bubbleServices.map((service) => service.avgTime as number);
  const ratingValues = bubbleServices.map((service) => service.avgRating as number);
  const reportValues = bubbleServices.map((service) => service.reportCount ?? 0);

  const timeMin = timeValues.length ? Math.min(...timeValues) : 0;
  const timeMax = timeValues.length ? Math.max(...timeValues) : 0;
  const ratingMin = ratingValues.length ? Math.min(...ratingValues) : 0;
  const ratingMax = ratingValues.length ? Math.max(...ratingValues) : 0;
  const reportMin = reportValues.length ? Math.min(...reportValues) : 0;
  const reportMax = reportValues.length ? Math.max(...reportValues) : 0;

  const totalReports = services.reduce((sum, service) => sum + (service.reportCount ?? 0), 0);
  const ratingWeightedTotal = services.reduce((sum, service) => {
    if (!hasNumber(service.avgRating) || !service.reportCount) return sum;
    return sum + service.avgRating * service.reportCount;
  }, 0);
  const ratingWeight = services.reduce((sum, service) => {
    if (!hasNumber(service.avgRating) || !service.reportCount) return sum;
    return sum + service.reportCount;
  }, 0);
  const timeWeightedTotal = services.reduce((sum, service) => {
    if (!hasNumber(service.avgTime) || !service.reportCount) return sum;
    return sum + service.avgTime * service.reportCount;
  }, 0);
  const timeWeight = services.reduce((sum, service) => {
    if (!hasNumber(service.avgTime) || !service.reportCount) return sum;
    return sum + service.reportCount;
  }, 0);

  const constituencyStats: ConstituencyStats = {
    totalReports,
    avgRating: ratingWeight > 0 ? ratingWeightedTotal / ratingWeight : null,
    avgWaitTime: timeWeight > 0 ? timeWeightedTotal / timeWeight : null,
  };

  const formatNumber = (value: number, maximumFractionDigits = 1) => new Intl.NumberFormat(
    locale === "np" ? "ne-NP" : "en-US",
    { maximumFractionDigits, minimumFractionDigits: maximumFractionDigits === 0 ? 0 : 1 }
  ).format(value);

  const getServiceName = (service: Service) => (locale === "np" ? service.nameNp : service.name);
  const getTypeLabel = (type: string) => type === "all" ? t("constituency.allTypes") : t(`service.type.${type}`);
  const getTypeColorClass = (type: string) => typeColorMap.get(type) ?? BUBBLE_COLORS[0];
  const getGlobalRank = (key: string, service: Service) => {
    if (key === "best-rated") {
      if (!hasNumber(service.avgRating)) return null;
      const values = allServices
        .map((item) => item.avgRating)
        .filter((value): value is number => hasNumber(value));
      if (values.length === 0) return null;
      const betterCount = values.filter((value) => value > service.avgRating!).length;
      return { rank: betterCount + 1, total: values.length };
    }

    if (key === "fastest") {
      if (!hasNumber(service.avgTime)) return null;
      const values = allServices
        .map((item) => item.avgTime)
        .filter((value): value is number => hasNumber(value));
      if (values.length === 0) return null;
      const betterCount = values.filter((value) => value < service.avgTime!).length;
      return { rank: betterCount + 1, total: values.length };
    }

    const reportCount = service.reportCount ?? 0;
    if (reportCount <= 0) return null;
    const values = allServices
      .map((item) => item.reportCount ?? 0)
      .filter((value) => value > 0);
    if (values.length === 0) return null;
    const betterCount = values.filter((value) => value > reportCount).length;
    return { rank: betterCount + 1, total: values.length };
  };

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "insights", label: t("constituency.tabs.insights"), icon: BarChart3 },
    { key: "services", label: t("constituency.tabs.services"), icon: ListChecks },
    { key: "rankings", label: t("constituency.tabs.rankings"), icon: Trophy },
  ];

  const summaryCards: SummaryCard[] = [
    {
      key: "best-rated",
      title: t("constituency.summary.bestRated"),
      service: bestRated,
      value: bestRated && hasNumber(bestRated.avgRating)
        ? `${formatNumber(bestRated.avgRating)} / 5`
        : null,
      accent: "from-amber-400 to-orange-500",
    },
    {
      key: "fastest",
      title: t("constituency.summary.fastest"),
      service: fastest,
      value: fastest && hasNumber(fastest.avgTime)
        ? `${formatNumber(fastest.avgTime)} ${t("home.minutes")}`
        : null,
      accent: "from-sky-400 to-cyan-500",
    },
    {
      key: "most-reported",
      title: t("constituency.summary.mostReported"),
      service: mostReported,
      value: mostReported
        ? `${formatNumber(mostReported.reportCount ?? 0, 0)} ${t("service.reports")}`
        : null,
      accent: "from-emerald-400 to-green-500",
    },
  ];

  const rankingSections = [
    {
      key: "rating",
      title: t("constituency.rankings.bestRated"),
      items: ratingRanking,
      value: (service: Service) => hasNumber(service.avgRating)
        ? `${formatNumber(service.avgRating)} / 5`
        : "—",
    },
    {
      key: "time",
      title: t("constituency.rankings.fastest"),
      items: timeRanking,
      value: (service: Service) => hasNumber(service.avgTime)
        ? `${formatNumber(service.avgTime)} ${t("home.minutes")}`
        : "—",
    },
    {
      key: "reports",
      title: t("constituency.rankings.mostReported"),
      items: reportRanking,
      value: (service: Service) => `${formatNumber(service.reportCount ?? 0, 0)} ${t("service.reports")}`,
    },
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-red-500">{t("constituency.notFound")}</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href="/" className="text-orange-600 hover:underline text-sm mb-4 inline-block">← {t("nav.home")}</Link>

      {/* Header */}
      <div className="rounded-2xl overflow-hidden mb-6 relative h-48 bg-gradient-to-br from-orange-400 to-red-500">
        <Image
          src={data.imageUrl ? gDriveUrl(data.imageUrl) : "/images/emblem.jpg"}
          alt={data.name}
          fill
          className="object-cover"
          style={{ objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-black/40 flex items-end p-6">
          <div>
            {data.province && (
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full mb-2 inline-block">
                {locale === "np" && data.provinceNp
                  ? `${data.provinceNp} प्रदेश`
                  : data.province}
              </span>
            )}
            <h1 className="text-3xl font-extrabold text-white">
              {locale === "np" ? data.nameNp : data.name}
            </h1>
            {data.description && (
              <p className="text-white/80 text-sm mt-1">{data.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-3xl border border-gray-200/70 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900/90 dark:to-gray-950/70 p-2 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              aria-label={tab.label}
              className={`px-3 sm:px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2 border ${
                activeTab === tab.key
                  ? "border-orange-300/80 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 shadow-sm ring-1 ring-orange-200/70 dark:ring-orange-900/60"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-900/80"
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                  activeTab === tab.key
                    ? "bg-orange-100 dark:bg-orange-900/40"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
              </span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === "insights" && (
        <ConstituencyInsightsTab
          t={t}
          getGlobalRank={getGlobalRank}
          constituencyStats={constituencyStats}
          serviceTypes={serviceTypes}
          summaryCards={summaryCards}
          bubbleServices={bubbleServices}
          timeMin={timeMin}
          timeMax={timeMax}
          ratingMin={ratingMin}
          ratingMax={ratingMax}
          reportMin={reportMin}
          reportMax={reportMax}
          formatNumber={formatNumber}
          getServiceName={getServiceName}
          getTypeColorClass={getTypeColorClass}
        />
      )}

      {activeTab === "services" && (
        <ConstituencyServicesTab
          t={t}
          serviceTypes={serviceTypes}
          filter={filter}
          setFilter={setFilter}
          filtered={filtered}
          getTypeLabel={getTypeLabel}
          constituencyId={id}
        />
      )}

      {activeTab === "rankings" && (
        <ConstituencyRankingsTab
          t={t}
          sections={rankingSections}
          formatNumber={formatNumber}
          getServiceName={getServiceName}
        />
      )}
    </div>
  );
}
