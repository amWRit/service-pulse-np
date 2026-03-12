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
  const [serviceType, setServiceType] = useState("");

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

  const serviceTypes = useMemo(
    () => [...new Set(services.map((service) => service.type).filter(Boolean))].sort(),
    [services]
  );

  const filtered = useMemo(() => {
    let base = services;

    if (constituencyId) {
      base = base.filter((service) => service.constituencyId === constituencyId);
    } else if (provinceId || districtId) {
      const ids = new Set(visibleConstituencies.map((c) => c.id));
      base = base.filter((service) => ids.has(service.constituencyId));
    }

    if (serviceType) {
      base = base.filter((service) => service.type === serviceType);
    }

    return base;
  }, [services, visibleConstituencies, provinceId, districtId, constituencyId, serviceType]);

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

