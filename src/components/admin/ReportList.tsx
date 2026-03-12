"use client";

import { useEffect, useState, useMemo } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import FilterBar from "./FilterBar";
import type { Report, Constituency, Province, District } from "./types";

const PAGE_SIZE = 12;

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
  const [serviceType, setServiceType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
    let base = reports;

    if (constituencyId) {
      base = base.filter((r) => r.constituencyId === constituencyId);
    } else if (provinceId || districtId) {
      const ids = new Set(visibleConstituencies.map((c) => c.id));
      base = base.filter((r) => r.constituencyId && ids.has(r.constituencyId));
    }

    if (serviceType) {
      base = base.filter((r) => r.publicService?.type === serviceType);
    }

    return base;
  }, [reports, visibleConstituencies, provinceId, districtId, constituencyId, serviceType]);

  const serviceTypes = useMemo(
    () => [...new Set(reports.map((r) => r.publicService?.type).filter(Boolean) as string[])].sort(),
    [reports]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [provinceId, districtId, constituencyId, serviceType]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const windowSize = 5;
    const start = Math.max(1, currentPage - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    const adjustedStart = Math.max(1, end - windowSize + 1);

    for (let page = adjustedStart; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, totalPages]);

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
        serviceTypes={serviceTypes}
        selectedServiceType={serviceType}
        onServiceTypeChange={setServiceType}
      />
      <p className="text-sm text-gray-500 mb-3">
        {filtered.length} {t("admin.showingResults")}
      </p>

      {filtered.length > PAGE_SIZE && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            {t("admin.page")} {currentPage} {t("admin.of")} {totalPages}
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200"
            >
              {t("admin.prev")}
            </button>

            {visiblePages.map((page) => (
              <button
                key={`top-${page}`}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`px-2.5 py-1.5 text-xs rounded-md border ${
                  currentPage === page
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200"
            >
              {t("admin.next")}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {paginated.map((r) => (
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
          <p className="text-center text-gray-400 py-8 text-sm">{t("admin.noReportsFiltered")}</p>
        )}
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            {t("admin.page")} {currentPage} {t("admin.of")} {totalPages}
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200"
            >
              {t("admin.prev")}
            </button>

            {visiblePages.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`px-2.5 py-1.5 text-xs rounded-md border ${
                  currentPage === page
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200"
            >
              {t("admin.next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
