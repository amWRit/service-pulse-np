"use client";

import { useState, useMemo } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import FilterBar from "./FilterBar";
import type { Report, Constituency, Province, District } from "./types";

interface ReportListProps {
  reports: Report[];
  constituencies: Constituency[];
  provinces: Province[];
  districts: District[];
  onModerate: (id: string, isHidden: boolean) => void;
  onDelete: (id: string) => void;
}

export default function ReportList({ reports, constituencies, provinces, districts, onModerate, onDelete }: ReportListProps) {
  const { t } = useI18n();
  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [constituencyId, setConstituencyId] = useState("");

  const handleProvinceChange = (id: string) => {
    setProvinceId(id);
    setDistrictId("");
    setConstituencyId("");
  };

  const handleDistrictChange = (id: string) => {
    setDistrictId(id);
    setConstituencyId("");
  };

  const visibleConstituencies = useMemo(() => {
    return constituencies.filter((c) => {
      if (districtId && c.districtId !== districtId) return false;
      if (provinceId && c.district?.provinceId !== provinceId) return false;
      return true;
    });
  }, [constituencies, provinceId, districtId]);

  const filtered = useMemo(() => {
    if (constituencyId) return reports.filter((r) => r.constituencyId === constituencyId);
    if (provinceId || districtId) {
      const ids = new Set(visibleConstituencies.map((c) => c.id));
      return reports.filter((r) => r.constituencyId && ids.has(r.constituencyId));
    }
    return reports;
  }, [reports, visibleConstituencies, provinceId, districtId, constituencyId]);

  return (
    <div>
      <FilterBar
        provinces={provinces}
        districts={districts}
        selectedProvinceId={provinceId}
        selectedDistrictId={districtId}
        onProvinceChange={handleProvinceChange}
        onDistrictChange={handleDistrictChange}
        constituencies={visibleConstituencies}
        selectedConstituencyId={constituencyId}
        onConstituencyChange={setConstituencyId}
      />
      <div className="space-y-2">
        {filtered.map((r) => (
          <div
            key={r.id}
            className={`bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 ${r.isHidden ? "opacity-50" : ""}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {r.publicService?.name} · ⭐{r.rating} · {r.serviceTimeMinutes}min
                </p>
                {r.comment && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-0.5">"{r.comment}"</p>
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
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">No reports match the selected filters.</p>
        )}
      </div>
    </div>
  );
}
