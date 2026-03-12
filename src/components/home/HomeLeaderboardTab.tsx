"use client";

import Link from "next/link";
import StarRating from "@/components/StarRating";
import type { LucideIcon } from "lucide-react";
import { ServiceEntry } from "@/components/home/types";

type LeaderboardTab = "fastest" | "slowest" | "best" | "worst";

interface HomeLeaderboardTabProps {
  t: (key: string) => string;
  locale: "en" | "np";
  loading: boolean;
  leaderboardTab: LeaderboardTab;
  setLeaderboardTab: (tab: LeaderboardTab) => void;
  leaderboardTabs: readonly LeaderboardTab[];
  tabIcons: Record<string, LucideIcon>;
  entries: ServiceEntry[];
}

export default function HomeLeaderboardTab({
  t,
  locale,
  loading,
  leaderboardTab,
  setLeaderboardTab,
  leaderboardTabs,
  tabIcons,
  entries,
}: HomeLeaderboardTabProps) {
  return (
    <>
      <div className="mb-6">
        <div className="grid grid-cols-4 gap-2 w-full">
          {leaderboardTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setLeaderboardTab(tab)}
              className={`w-full px-3 sm:px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors inline-flex items-center justify-center gap-2 ${
                leaderboardTab === tab
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500"
              }`}
            >
              {(() => {
                const Icon = tabIcons[tab];
                return <Icon className="w-4 h-4" />;
              })()}
              <span className="hidden sm:inline">{t(`leaderboard.${tab}`)}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 sm:hidden text-xs font-semibold text-gray-500 dark:text-gray-400">
          {t(`leaderboard.${leaderboardTab}`)}
        </p>
      </div>

      <div className="mb-5" />

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p>{t("home.insights.noData")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <Link
              key={entry.id}
              href={`/services/${entry.id}`}
              className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-500 transition-all"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-base flex-shrink-0 ${
                  index === 0
                    ? "bg-yellow-400 text-white"
                    : index === 1
                      ? "bg-gray-300 dark:bg-gray-500 text-gray-700 dark:text-white"
                      : index === 2
                        ? "bg-orange-300 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
                }`}
              >
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white leading-tight">
                  {locale === "np" ? entry.nameNp : entry.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {locale === "np" ? entry.constituency.nameNp : entry.constituency.name}
                  {" · "}
                  {t(`service.type.${entry.type}`)}
                </p>
                <div className="flex items-center gap-3 mt-2 sm:hidden flex-wrap">
                  <span className="font-bold text-orange-600 text-sm">
                    {Math.round(entry.avgTime)}{" "}
                    <span className="text-xs font-normal text-gray-500">{t("home.minutes")}</span>
                  </span>
                  <StarRating rating={Math.round(entry.avgRating)} size="sm" />
                  <span className="text-xs text-gray-400">
                    {entry.reportCount} {t("service.reports")}
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                <p className="font-bold text-orange-600 text-lg w-20 text-right">
                  {Math.round(entry.avgTime)}{" "}
                  <span className="text-xs font-normal text-gray-500">{t("home.minutes")}</span>
                </p>
                <StarRating rating={Math.round(entry.avgRating)} size="sm" />
                <span className="text-xs text-gray-400">
                  {entry.reportCount} {t("service.reports")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
