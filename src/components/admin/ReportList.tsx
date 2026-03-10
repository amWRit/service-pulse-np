"use client";

import { Eye, EyeOff, Trash2 } from "lucide-react";
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
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => onModerate(r.id, !r.isHidden)}
                title={r.isHidden ? t("admin.approve") : t("admin.hide")}
                className={`p-1.5 rounded-lg transition-colors ${
                  r.isHidden
                    ? "text-green-500 hover:text-green-600 hover:bg-green-50"
                    : "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                }`}
              >
                {r.isHidden ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button
                onClick={() => onDelete(r.id)}
                title={t("admin.delete")}
                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
