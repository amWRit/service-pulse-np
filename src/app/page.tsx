"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useSession } from "next-auth/react";
import ReportModal from "@/components/ReportModal";
import AnonGateModal from "@/components/AnonGateModal";
import { Plus, Zap, ThumbsUp, ThumbsDown, Snail, Trophy, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import HomeInsightsTab from "@/components/home/HomeInsightsTab";
import HomeLeaderboardTab from "@/components/home/HomeLeaderboardTab";
import { ConstituencyEntry, GlobalServiceEntry, ServiceEntry } from "@/components/home/types";

interface LeaderboardData {
  fastest: ServiceEntry[];
  slowest: ServiceEntry[];
  best: ServiceEntry[];
  worst: ServiceEntry[];
}

interface Stats {
  constituencies: number;
  services: number;
  reports: number;
}

const LEADERBOARD_TABS = ["fastest", "slowest", "best", "worst"] as const;
const HOME_TABS = ["leaderboard", "insights"] as const;

type HomeTab = (typeof HOME_TABS)[number];

type LeaderboardTab = (typeof LEADERBOARD_TABS)[number];

const TAB_ICON: Record<string, LucideIcon> = {
  fastest: Zap,
  slowest: Snail,
  best: ThumbsUp,
  worst: ThumbsDown,
};

const HOME_TAB_ICON: Record<HomeTab, LucideIcon> = {
  leaderboard: Trophy,
  insights: BarChart3,
};

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

export default function HomePage() {
  const { t, locale } = useI18n();
  const { data: session } = useSession();

  const [data, setData] = useState<LeaderboardData | null>(null);
  const [allServices, setAllServices] = useState<GlobalServiceEntry[]>([]);
  const [constituencies, setConstituencies] = useState<ConstituencyEntry[]>([]);
  const [homeTab, setHomeTab] = useState<HomeTab>("leaderboard");
  const [leaderboardTab, setLeaderboardTab] = useState<LeaderboardTab>("fastest");
  const [chartProvince, setChartProvince] = useState("all");
  const [chartConstituency, setChartConstituency] = useState("all");
  const [chartServiceType, setChartServiceType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ constituencies: 0, services: 0, reports: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);

  const handleReportClick = () => {
    if (session) {
      setModalOpen(true);
    } else {
      setGateOpen(true);
    }
  };

  const handleGateVerified = (token: string) => {
    setChallengeToken(token);
    setGateOpen(false);
    setModalOpen(true);
  };

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((response) => response.json())
      .then((leaderboardData) => {
        setData(leaderboardData);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/constituencies")
      .then((response) => response.json())
      .then((constituencyList: ConstituencyEntry[]) => {
        setConstituencies(constituencyList);
        setStats({
          constituencies: constituencyList.length,
          services: constituencyList.reduce((sum, constituency) => sum + constituency._count.services, 0),
          reports: constituencyList.reduce((sum, constituency) => sum + constituency._count.reports, 0),
        });
      })
      .catch(() => {});

    fetch("/api/services")
      .then((response) => response.json())
      .then((services: GlobalServiceEntry[]) => setAllServices(services))
      .catch(() => {});
  }, []);

  const leaderboardEntries = data?.[leaderboardTab] ?? [];
  const allEntries = data
    ? Array.from(
        new Map(
          [...data.fastest, ...data.slowest, ...data.best, ...data.worst].map((entry) => [entry.id, entry])
        ).values()
      )
    : [];

  const bestRated = data?.best?.[0] ?? null;
  const fastest = data?.fastest?.[0] ?? null;
  const mostReported = allEntries.length
    ? [...allEntries].sort((a, b) => b.reportCount - a.reportCount)[0]
    : null;

  const constituencyMetaMap = new Map(
    constituencies.map((constituency) => [
      constituency.id,
      {
        provinceKey: constituency.province ?? "unknown",
        provinceLabel: locale === "np"
          ? constituency.provinceNp ?? constituency.province ?? t("home.insights.chart.unknownProvince")
          : constituency.province ?? constituency.provinceNp ?? t("home.insights.chart.unknownProvince"),
        constituencyLabel: locale === "np" ? constituency.nameNp : constituency.name,
      },
    ])
  );

  const provinceOptions = Array.from(
    new Map(
      constituencies.map((constituency) => {
        const provinceKey = constituency.province ?? "unknown";
        const provinceLabel = locale === "np"
          ? constituency.provinceNp ?? constituency.province ?? t("home.insights.chart.unknownProvince")
          : constituency.province ?? constituency.provinceNp ?? t("home.insights.chart.unknownProvince");
        return [provinceKey, provinceLabel];
      })
    ).entries()
  ).map(([value, label]) => ({ value, label }));

  const chartServices = allServices.filter(
    (service) => hasNumber(service.avgRating) && hasNumber(service.avgTime)
  );

  const constituencyOptions = constituencies
    .filter((constituency) => chartProvince === "all" || (constituency.province ?? "unknown") === chartProvince)
    .map((constituency) => ({
      value: constituency.id,
      label: locale === "np" ? constituency.nameNp : constituency.name,
    }));

  const filteredChartServices = chartServices.filter((service) => {
    if (chartServiceType !== "all" && service.type !== chartServiceType) return false;
    if (chartConstituency !== "all" && service.constituencyId !== chartConstituency) return false;
    if (chartProvince !== "all") {
      const serviceProvince = service.constituencyId
        ? constituencyMetaMap.get(service.constituencyId)?.provinceKey
        : undefined;
      if (serviceProvince !== chartProvince) return false;
    }
    return true;
  });

  const chartServiceTypes = Array.from(new Set(chartServices.map((service) => service.type)));
  const filteredLegendTypes = Array.from(new Set(filteredChartServices.map((service) => service.type)));
  const typeColorMap = new Map<string, string>();
  chartServiceTypes.forEach((type, index) => {
    typeColorMap.set(type, BUBBLE_COLORS[index % BUBBLE_COLORS.length]);
  });

  const timeValues = filteredChartServices.map((service) => service.avgTime as number);
  const ratingValues = filteredChartServices.map((service) => service.avgRating as number);
  const reportValues = filteredChartServices.map((service) => service.reportCount ?? 0);

  const timeMin = timeValues.length ? Math.min(...timeValues) : 0;
  const timeMax = timeValues.length ? Math.max(...timeValues) : 0;
  const ratingMin = ratingValues.length ? Math.min(...ratingValues) : 0;
  const ratingMax = ratingValues.length ? Math.max(...ratingValues) : 0;
  const reportMin = reportValues.length ? Math.min(...reportValues) : 0;
  const reportMax = reportValues.length ? Math.max(...reportValues) : 0;
  const avgWait = chartServices.length
    ? chartServices.reduce((sum, service) => sum + (service.avgTime ?? 0), 0) / chartServices.length
    : 0;
  const avgRating = chartServices.length
    ? chartServices.reduce((sum, service) => sum + (service.avgRating ?? 0), 0) / chartServices.length
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-8 pt-2">

      <div className="mb-6 rounded-3xl border border-gray-200/70 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900/90 dark:to-gray-950/70 p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          {HOME_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setHomeTab(tab)}
              className={`px-3 sm:px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2 border ${
                homeTab === tab
                  ? "border-orange-300/80 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 shadow-sm ring-1 ring-orange-200/70 dark:ring-orange-900/60"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-900/80"
              }`}
            >
              {(() => {
                const Icon = HOME_TAB_ICON[tab];
                return (
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                      homeTab === tab
                        ? "bg-orange-100 dark:bg-orange-900/40"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                );
              })()}
              <span>{t(`home.tabs.${tab}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {homeTab === "insights" && (
        <HomeInsightsTab
          t={t}
          locale={locale}
          loading={loading}
          stats={stats}
          avgWait={avgWait}
          avgRating={avgRating}
          bestRated={bestRated}
          fastest={fastest}
          mostReported={mostReported}
          chartProvince={chartProvince}
          setChartProvince={setChartProvince}
          chartConstituency={chartConstituency}
          setChartConstituency={setChartConstituency}
          chartServiceType={chartServiceType}
          setChartServiceType={setChartServiceType}
          provinceOptions={provinceOptions}
          constituencyOptions={constituencyOptions}
          chartServiceTypes={chartServiceTypes}
          filteredChartServices={filteredChartServices}
          timeMin={timeMin}
          timeMax={timeMax}
          ratingMin={ratingMin}
          ratingMax={ratingMax}
          reportMin={reportMin}
          reportMax={reportMax}
          filteredLegendTypes={filteredLegendTypes}
          chartServicesLength={chartServices.length}
          getTypeColorClass={(type) => typeColorMap.get(type) ?? BUBBLE_COLORS[0]}
        />
      )}

      {homeTab === "leaderboard" && (
        <HomeLeaderboardTab
          t={t}
          locale={locale}
          loading={loading}
          leaderboardTab={leaderboardTab}
          setLeaderboardTab={setLeaderboardTab}
          leaderboardTabs={LEADERBOARD_TABS}
          tabIcons={TAB_ICON}
          entries={leaderboardEntries}
        />
      )}

      <button
        onClick={handleReportClick}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold px-5 py-3.5 rounded-full shadow-lg transition-all"
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm">{t("service.report")}</span>
      </button>

      {gateOpen && <AnonGateModal onVerified={handleGateVerified} onClose={() => setGateOpen(false)} />}

      {modalOpen && (
        <ReportModal
          challengeToken={challengeToken ?? undefined}
          onClose={() => {
            setModalOpen(false);
            setChallengeToken(null);
          }}
        />
      )}
    </div>
  );
}
