"use client";


import { useI18n } from "@/lib/i18n";
import type { Province, District, Constituency } from "./types";

interface FilterBarProps {
  provinces: Province[];
  districts: District[];
  selectedProvinceId: string;
  selectedDistrictId: string;
  onProvinceChange: (id: string) => void;
  onDistrictChange: (id: string) => void;
  // optional constituency filter
  constituencies?: Constituency[];
  selectedConstituencyId?: string;
  onConstituencyChange?: (id: string) => void;
}

export default function FilterBar({
  provinces,
  districts,
  selectedProvinceId,
  selectedDistrictId,
  onProvinceChange,
  onDistrictChange,
  constituencies,
  selectedConstituencyId,
  onConstituencyChange,
}: FilterBarProps) {

  const { t, locale } = useI18n();
  const filteredDistricts = selectedProvinceId
    ? districts.filter((d) => d.provinceId === selectedProvinceId)
    : districts;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <select
        value={selectedProvinceId}
        onChange={(e) => onProvinceChange(e.target.value)}
        className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
      >
        <option value="">{t("admin.allProvinces")}</option>
        {provinces.map((p) => (
          <option key={p.id} value={p.id}>{locale === "np" ? p.nameNp : p.name}</option>
        ))}
      </select>
      <select
        value={selectedDistrictId}
        onChange={(e) => onDistrictChange(e.target.value)}
        className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
      >
        <option value="">{t("admin.allDistricts")}</option>
        {filteredDistricts.map((d) => (
          <option key={d.id} value={d.id}>{locale === "np" ? d.nameNp : d.name}</option>
        ))}
      </select>
      {constituencies && onConstituencyChange && (
        <select
          value={selectedConstituencyId ?? ""}
          onChange={(e) => onConstituencyChange(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          <option value="">{t("admin.allConstituencies")}</option>
          {constituencies.map((c) => (
            <option key={c.id} value={c.id}>{locale === "np" ? c.nameNp : c.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}
