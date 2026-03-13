"use client";

import { useCallback, useEffect, useState } from "react";
import AnonGateModal from "@/components/AnonGateModal";
import ServiceReportFormModal from "../../../components/service/ServiceReportFormModal";
import ServiceInsightsTab from "@/components/service/ServiceInsightsTab";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useSession } from "next-auth/react";
import { BarChart3, MessageSquare, Plus } from "lucide-react";
import StarRating from "@/components/StarRating";
import StatusBadge from "@/components/StatusBadge";
import { getStatusFromAvg } from "@/lib/utils";
import Link from "next/link";

interface Report {
  id: string;
  serviceTimeMinutes: number;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: { name: string } | null;
}

interface InsightReport {
  serviceTimeMinutes: number;
  rating: number;
  createdAt: string;
}

interface ComparisonAverage {
  avgRating: number | null;
  avgTime: number | null;
  reportCount: number;
}

interface ServiceDetail {
  id: string;
  name: string;
  nameNp: string;
  type: string;
  location?: string;
  description?: string;
  descriptionNp?: string;
  constituencyId: string;
  constituency: { name: string; nameNp: string };
  reports: Report[];
  insightReports: InsightReport[];
  avgRating: number | null;
  avgTime: number | null;
  reportCount: number;
  comparisons: {
    constituency: ComparisonAverage;
    similarServices: ComparisonAverage;
  };
}

type TabKey = "recentReports" | "insights";

export default function ServicePage() {
  const params = useParams();
  const { t, locale } = useI18n();
  const { data: session } = useSession();
  const [data, setData] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("recentReports");
  const [gateOpen, setGateOpen] = useState(false);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [serviceReportModalOpen, setServiceReportModalOpen] = useState(false);

  const id = params.id as string;

  const loadService = useCallback(() => {
    fetch(`/api/services/${id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => { loadService(); }, [loadService]);

  if (loading) return <div className="max-w-3xl mx-auto p-8 text-center text-gray-400">Loading...</div>;
  if (!data) return <div className="max-w-3xl mx-auto p-8 text-center text-red-500">Service not found</div>;

  const status = getStatusFromAvg(data.avgTime);
  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "recentReports", label: t("service.tabs.recentReports"), icon: MessageSquare },
    { key: "insights", label: t("service.tabs.insights"), icon: BarChart3 },
  ];

  const canOpenReportForm = Boolean(session) || Boolean(challengeToken);

  const handleReportClick = () => {
    if (canOpenReportForm) {
      setServiceReportModalOpen(true);
      return;
    }
    setGateOpen(true);
  };

  const handleGateVerified = (token: string) => {
    setChallengeToken(token);
    setGateOpen(false);
    setServiceReportModalOpen(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href={`/constituencies/${data.constituencyId}`} className="text-orange-600 hover:underline text-sm mb-4 inline-block">
        ← {locale === "np" ? data.constituency.nameNp : data.constituency.name}
      </Link>

      {/* Service Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl">
            {{"hospital":"🏥","government_office":"🏛️","transport":"🚌","education":"🎓","utility":"⚡","police":"👮","bank":"🏦","other":"🏢"}[data.type] || "🏢"}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {locale === "np" ? data.nameNp : data.name}
              </h1>
              <StatusBadge status={status} />
            </div>
            {data.location && <p className="text-gray-500 text-sm mt-1">📍 {data.location}</p>}
            <p className="text-xs text-gray-400 mt-1">{t(`service.type.${data.type}`)}</p>
            {(locale === "np" ? data.descriptionNp : data.description) && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                {locale === "np" ? data.descriptionNp : data.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="bg-orange-50 dark:bg-orange-950/40 rounded-xl p-3">
            <p className="text-2xl font-extrabold text-orange-600">
              {data.avgTime ? `${Math.round(data.avgTime)}` : "—"}
            </p>
            <p className="text-xs text-gray-500">{t("service.avgWait")} ({t("home.minutes")})</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/40 rounded-xl p-3">
            <p className="text-2xl font-extrabold text-orange-600">
              {data.avgRating ? data.avgRating.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-gray-500">{t("service.avgRating")}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/40 rounded-xl p-3">
            <p className="text-2xl font-extrabold text-orange-600">{data.reportCount}</p>
            <p className="text-xs text-gray-500">{t("service.reports")}</p>
          </div>
        </div>

      </div>

      <div className="mb-6 rounded-3xl border border-gray-200/70 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900/90 dark:to-gray-950/70 p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
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
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === "insights" ? (
        <ServiceInsightsTab
          locale={locale}
          t={t}
          reports={data.insightReports}
          avgRating={data.avgRating}
          avgTime={data.avgTime}
          reportCount={data.reportCount}
          constituencyAverage={data.comparisons.constituency}
          similarServicesAverage={data.comparisons.similarServices}
        />
      ) : (
        <>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{t("service.recentReports")}</h2>
          {data.reports.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-2">🗳️</p>
              <p>{t("service.noReportsYet")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.reports.map((report) => (
                <div key={report.id} className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <StarRating rating={report.rating} size="sm" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {report.serviceTimeMinutes} {t("home.minutes")}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {report.user?.name || "Anonymous"} · {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {report.comment && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm mt-2 leading-relaxed">{report.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <button
        onClick={handleReportClick}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold px-5 py-3.5 rounded-full shadow-lg transition-all"
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm">{t("service.report")}</span>
      </button>

      {gateOpen && <AnonGateModal onVerified={handleGateVerified} onClose={() => setGateOpen(false)} />}

      {serviceReportModalOpen && (
        <ServiceReportFormModal
          serviceId={data.id}
          constituencyId={data.constituencyId}
          challengeToken={challengeToken ?? undefined}
          onClose={() => setServiceReportModalOpen(false)}
          onSuccess={loadService}
        />
      )}
    </div>
  );
}
