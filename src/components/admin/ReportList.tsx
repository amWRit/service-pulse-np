"use client";

import { useI18n } from "@/lib/i18n";
import type { Report } from "./types";

interface ReportListProps {
  reports: Report[];
  onModerate: (id: string, isHidden: boolean) => void;
  onDelete: (id: string) => void;
}

export default function ReportList({ reports, onModerate, onDelete }: ReportListProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      {reports.map((r) => (
        <div
          key={r.id}
          className={`bg-white rounded-xl border p-4 ${r.isHidden ? "opacity-50" : ""}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {r.publicService?.name} · ⭐{r.rating} · {r.serviceTimeMinutes}min
              </p>
              {r.comment && (
                <p className="text-gray-600 text-sm mt-0.5">"{r.comment}"</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {r.user?.name ?? "Anonymous"} · {new Date(r.createdAt).toLocaleDateString()}
                {r.isHidden && " · [Hidden]"}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => onModerate(r.id, !r.isHidden)}
                className={`text-xs font-medium px-2 py-1 rounded border ${
                  r.isHidden
                    ? "text-green-600 border-green-300 hover:bg-green-50"
                    : "text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                }`}
              >
                {r.isHidden ? t("admin.approve") : t("admin.hide")}
              </button>
              <button
                onClick={() => onDelete(r.id)}
                className="text-xs font-medium px-2 py-1 rounded border text-red-600 border-red-300 hover:bg-red-50"
              >
                {t("admin.delete")}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
