"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import ConstituencyCard from "@/components/ConstituencyCard";
import FilterBar from "@/components/admin/FilterBar";

interface Constituency {
  id: string;
  name: string;
  nameNp: string;
  districtId?: string | null;
  province: string | null;
  provinceNp?: string | null;
  imageUrl: string | null;
  _count: { services: number; reports: number };
  district?: {
    id: string;
    name: string;
    nameNp: string;
    provinceId: string;
    province?: { id: string; name: string; nameNp: string } | null;
  } | null;
}

interface ProvinceOption {
  id: string;
  name: string;
  nameNp: string;
}

interface DistrictOption {
  id: string;
  name: string;
  nameNp: string;
  provinceId: string;
}

export default function ConstituenciesPage() {
  const { t } = useI18n();
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/constituencies").then((r) => r.json()),
      fetch("/api/provinces").then((r) => r.json()),
      fetch("/api/districts").then((r) => r.json()),
    ])
      .then(([constituencyData, provinceData, districtData]) => {
        setConstituencies(constituencyData);
        setProvinces(provinceData);
        setDistricts(districtData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = constituencies.filter((constituency) => {
    if (selectedProvinceId) {
      const provinceId = constituency.district?.province?.id ?? "";
      if (provinceId !== selectedProvinceId) return false;
    }

    if (selectedDistrictId && constituency.districtId !== selectedDistrictId) {
      return false;
    }

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        {/* <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
          {t("nav.constituencies")}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {t("home.subtitle")}
        </p> */}

        {/* Stats */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-orange-50 dark:bg-orange-950/40 rounded-2xl py-3 text-center">
            <p className="text-2xl font-extrabold text-orange-600">{constituencies.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">{t("nav.constituencies")}</p>
          </div>
          <div className="flex-1 bg-orange-50 dark:bg-orange-950/40 rounded-2xl py-3 text-center">
            <p className="text-2xl font-extrabold text-orange-600">
              {constituencies.reduce((sum, c) => sum + c._count.services, 0)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">{t("nav.services")}</p>
          </div>
          <div className="flex-1 bg-orange-50 dark:bg-orange-950/40 rounded-2xl py-3 text-center">
            <p className="text-2xl font-extrabold text-orange-600">
              {constituencies.reduce((sum, c) => sum + c._count.reports, 0)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">{t("home.totalReports")}</p>
          </div>
        </div>

        <div className="flex justify-end [&>div]:mb-0">
          <FilterBar    
            provinces={provinces}
            districts={districts}
            selectedProvinceId={selectedProvinceId}
            selectedDistrictId={selectedDistrictId}
            onProvinceChange={(id) => {
              setSelectedProvinceId(id);
              setSelectedDistrictId("");
            }}
            onDistrictChange={(id) => setSelectedDistrictId(id)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-52 animate-pulse border dark:border-gray-700" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-lg">
          No constituencies found for selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <ConstituencyCard
              key={c.id}
              id={c.id}
              name={c.name}
              nameNp={c.nameNp}
              province={c.province}
              provinceNp={c.provinceNp ?? null}
              imageUrl={c.imageUrl}
              serviceCount={c._count.services}
              reportCount={c._count.reports}
            />
          ))}
        </div>
      )}
    </div>
  );
}
