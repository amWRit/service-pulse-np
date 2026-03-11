"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import StarRating from "@/components/StarRating";
import { useSession } from "next-auth/react";
import ReportModal from "@/components/ReportModal";
import { Plus, Zap, Turtle, ThumbsUp, ThumbsDown, Snail } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ServiceEntry {
  id: string;
  name: string;
  nameNp: string;
  type: string;
  avgRating: number;
  avgTime: number;
  reportCount: number;
  constituency: { name: string; nameNp: string };
}

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

const TABS = ["fastest", "slowest", "best", "worst"] as const;

const TAB_ICON: Record<string, LucideIcon> = {
  fastest: Zap,
  slowest: Snail,
  best: ThumbsUp,
  worst: ThumbsDown,
};

export default function HomePage() {
  const { t, locale } = useI18n();
  const { data: session } = useSession();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [active, setActive] = useState<(typeof TABS)[number]>("fastest");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ constituencies: 0, services: 0, reports: 0 });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));

    fetch("/api/constituencies")
      .then((r) => r.json())
      .then((constituencies: { _count: { services: number; reports: number } }[]) => {
        setStats({
          constituencies: constituencies.length,
          services: constituencies.reduce((sum, c) => sum + c._count.services, 0),
          reports: constituencies.reduce((sum, c) => sum + c._count.reports, 0),
        });
      })
      .catch(() => {});
  }, []);

  const entries = data?.[active] ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Leaderboard heading */}
      <div className="flex items-center gap-2 mb-5 sm:justify-center sm:flex-col sm:gap-1">
        <span className="text-2xl sm:text-4xl">🏆</span>
        <div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white sm:text-center">{t("leaderboard.title")}</h2>
          <p className="hidden sm:block text-sm text-gray-400 text-center">{t("leaderboard.subtitle")}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-full font-semibold text-sm transition-all border ${
              active === tab
                ? "bg-orange-500 text-white border-orange-500 shadow-md scale-105"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500"
            }`}
          >
            {(() => { const Icon = TAB_ICON[tab]; return <Icon className="w-4 h-4 flex-shrink-0" />; })()}
            <span className="hidden sm:inline">{t(`leaderboard.${tab}`)}</span>
          </button>
        ))}
      </div>

      {/* Active tab label — small screens only */}
      <p className="sm:hidden text-center text-xs font-semibold text-orange-500 mb-5 mt-2">
        {t(`leaderboard.${active}`)}
      </p>
      <div className="hidden sm:block mb-5" />

      {/* Entries */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p>No data yet. Submit some reports!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <Link
              key={entry.id}
              href={`/services/${entry.id}`}
              className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-500 transition-all"
            >
              {/* Rank */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-base flex-shrink-0 ${
                index === 0 ? "bg-yellow-400 text-white" :
                index === 1 ? "bg-gray-300 dark:bg-gray-500 text-gray-700 dark:text-white" :
                index === 2 ? "bg-orange-300 text-white" :
                "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
              }`}>
                {index + 1}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white leading-tight">
                  {locale === "np" ? entry.nameNp : entry.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {locale === "np" ? entry.constituency.nameNp : entry.constituency.name}
                  {" · "}{t(`service.type.${entry.type}`)}
                </p>
                {/* Stats: inline on sm+, stacked below on mobile */}
                <div className="flex items-center gap-3 mt-2 sm:hidden flex-wrap">
                  <span className="font-bold text-orange-600 text-sm">
                    {Math.round(entry.avgTime)} <span className="text-xs font-normal text-gray-500">{t("home.minutes")}</span>
                  </span>
                  <StarRating rating={Math.round(entry.avgRating)} size="sm" />
                  <span className="text-xs text-gray-400">{entry.reportCount} {t("service.reports")}</span>
                </div>
              </div>

              {/* Stats: right side on sm+ */}
              <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                <p className="font-bold text-orange-600 text-lg w-20 text-right">
                  {Math.round(entry.avgTime)} <span className="text-xs font-normal text-gray-500">{t("home.minutes")}</span>
                </p>
                <StarRating rating={Math.round(entry.avgRating)} size="sm" />
                <span className="text-xs text-gray-400">{entry.reportCount} {t("service.reports")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Floating report button */}
      {true && (
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold px-5 py-3.5 rounded-full shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm">{t("service.report")}</span>
        </button>
      )}

      {/* Report modal */}
      {modalOpen && <ReportModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
