"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import ReportForm from "@/components/ReportForm";
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
  avgRating: number | null;
  avgTime: number | null;
  reportCount: number;
}

export default function ServicePage() {
  const params = useParams();
  const { t, locale } = useI18n();
  const [data, setData] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const id = params.id as string;

  const loadService = () => {
    fetch(`/api/services/${id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadService(); }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto p-8 text-center text-gray-400">Loading...</div>;
  if (!data) return <div className="max-w-3xl mx-auto p-8 text-center text-red-500">Service not found</div>;

  const status = getStatusFromAvg(data.avgTime);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href={`/constituencies/${data.constituencyId}`} className="text-orange-600 hover:underline text-sm mb-4 inline-block">
        ← {locale === "np" ? data.constituency.nameNp : data.constituency.name}
      </Link>

      {/* Service Header */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl">
            {{"hospital":"🏥","government_office":"🏛️","transport":"🚌","education":"🎓","utility":"⚡","police":"👮","bank":"🏦","other":"🏢"}[data.type] || "🏢"}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900">
                {locale === "np" ? data.nameNp : data.name}
              </h1>
              <StatusBadge status={status} />
            </div>
            {data.location && <p className="text-gray-500 text-sm mt-1">📍 {data.location}</p>}
            <p className="text-xs text-gray-400 mt-1">{t(`service.type.${data.type}`)}</p>
            {(locale === "np" ? data.descriptionNp : data.description) && (
              <p className="text-gray-600 text-sm mt-2">
                {locale === "np" ? data.descriptionNp : data.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="bg-orange-50 rounded-xl p-3">
            <p className="text-2xl font-extrabold text-orange-600">
              {data.avgTime ? `${Math.round(data.avgTime)}` : "—"}
            </p>
            <p className="text-xs text-gray-500">{t("service.avgWait")} ({t("home.minutes")})</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3">
            <p className="text-2xl font-extrabold text-orange-600">
              {data.avgRating ? data.avgRating.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-gray-500">{t("service.avgRating")}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3">
            <p className="text-2xl font-extrabold text-orange-600">{data.reportCount}</p>
            <p className="text-xs text-gray-500">{t("service.reports")}</p>
          </div>
        </div>

        {/* Report Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
        >
          {showForm ? "✕ Cancel" : `📝 ${t("service.report")}`}
        </button>
      </div>

      {/* Report Form */}
      {showForm && (
        <div className="mb-6">
          <ReportForm
            serviceId={id}
            constituencyId={data.constituencyId}
            onSuccess={() => { setShowForm(false); loadService(); }}
          />
        </div>
      )}

      {/* Reports Feed */}
      <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Reports</h2>
      {data.reports.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-4xl mb-2">🗳️</p>
          <p>No reports yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.reports.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl border p-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <StarRating rating={report.rating} size="sm" />
                  <span className="text-sm font-semibold text-gray-700">
                    {report.serviceTimeMinutes} {t("home.minutes")}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {report.user?.name || "Anonymous"} · {new Date(report.createdAt).toLocaleDateString()}
                </div>
              </div>
              {report.comment && (
                <p className="text-gray-700 text-sm mt-2 leading-relaxed">{report.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
