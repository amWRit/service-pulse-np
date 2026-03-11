"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import StarRating from "@/components/StarRating";

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

const TABS = ["fastest", "slowest", "best", "worst"] as const;

const TAB_EMOJI: Record<string, string> = {
  fastest: "⚡",
  slowest: "🐢",
  best: "🏆",
  worst: "😤",
};

export default function LeaderboardPage() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [active, setActive] = useState<typeof TABS[number]>("fastest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const entries = data?.[active] ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t("leaderboard.title")}</h1>
        <p className="text-gray-500 mt-1 text-sm">Based on real citizen reports</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full font-semibold text-sm transition-all border ${
              active === tab
                ? "bg-orange-500 text-white border-orange-500 shadow-md scale-105"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-orange-300"
            }`}
          >
            <span>{TAB_EMOJI[tab]}</span>
            {t(`leaderboard.${tab}`)}
          </button>
        ))}
      </div>

      {/* Table */}
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
              className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-500 transition-all"
            >
              {/* Rank */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-lg flex-shrink-0 ${
                index === 0 ? "bg-yellow-400 text-white" :
                index === 1 ? "bg-gray-300 dark:bg-gray-500 text-gray-700 dark:text-white" :
                index === 2 ? "bg-orange-300 text-white" :
                "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
              }`}>
                {index + 1}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white truncate">
                  {locale === "np" ? entry.nameNp : entry.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {locale === "np" ? entry.constituency.nameNp : entry.constituency.name}
                  {" · "}{t(`service.type.${entry.type}`)}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-center">
                  <p className="font-bold text-orange-600 text-lg">
                    {Math.round(entry.avgTime)} <span className="text-xs font-normal text-gray-500">{t("home.minutes")}</span>
                  </p>
                </div>
                <div>
                  <StarRating rating={Math.round(entry.avgRating)} size="sm" />
                </div>
                <div className="text-xs text-gray-400 text-right">
                  {entry.reportCount} {t("service.reports")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
