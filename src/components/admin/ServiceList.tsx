"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import FilterBar from "./FilterBar";
import type { Service, Constituency, Province, District } from "./types";

interface ServiceListProps {
  services: Service[];
  constituencies: Constituency[];
  provinces: Province[];
  districts: District[];
  onEdit: (s: Service) => void;
  onDelete: (id: string) => void;
}

export default function ServiceList({ services, constituencies, provinces, districts, onEdit, onDelete }: ServiceListProps) {
  const { t, locale } = useI18n();
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
    if (constituencyId) return services.filter((s) => s.constituencyId === constituencyId);
    if (provinceId || districtId) {
      const ids = new Set(visibleConstituencies.map((c) => c.id));
      return services.filter((s) => ids.has(s.constituencyId));
    }
    return services;
  }, [services, visibleConstituencies, provinceId, districtId, constituencyId]);

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
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {locale === "np" ? s.nameNp : s.name}
              </p>
              <p className="text-xs text-gray-500">
                {t(`service.type.${s.type}`)} · {s.location} · {s.constituency?.name}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(s)}
                title={t("admin.edit")}
                className="p-1.5 rounded-lg text-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => onDelete(s.id)}
                title={t("admin.delete")}
                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">{t("admin.noServicesFiltered")}</p>
        )}
      </div>
    </div>
  );
}

