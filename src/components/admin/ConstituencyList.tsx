"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import FilterBar from "./FilterBar";
import type { Constituency, Province, District } from "./types";

interface ConstituencyListProps {
  constituencies: Constituency[];
  provinces: Province[];
  districts: District[];
  onEdit: (c: Constituency) => void;
  onDelete: (id: string) => void;
}

export default function ConstituencyList({ constituencies, provinces, districts, onEdit, onDelete }: ConstituencyListProps) {
  const { t, locale } = useI18n();
  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");

  const handleProvinceChange = (id: string) => {
    setProvinceId(id);
    setDistrictId("");
  };

  const filtered = useMemo(() => constituencies.filter((c) => {
    if (districtId && c.districtId !== districtId) return false;
    if (provinceId && c.district?.provinceId !== provinceId) return false;
    return true;
  }), [constituencies, provinceId, districtId]);

  return (
    <div>
      <FilterBar
        provinces={provinces}
        districts={districts}
        selectedProvinceId={provinceId}
        selectedDistrictId={districtId}
        onProvinceChange={handleProvinceChange}
        onDistrictChange={setDistrictId}
      />
      <div className="space-y-2">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border p-4 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-semibold text-gray-900">
                {locale === "np" ? c.nameNp : c.name}
              </p>
              <p className="text-xs text-gray-500">
                {c.district?.name
                  ? `${locale === "np" ? c.district.province?.nameNp : c.district.province?.name} · ${locale === "np" ? c.district.nameNp : c.district.name}`
                  : (locale === "np" ? c.provinceNp : c.province)}
                {" · "}{c._count?.services ?? 0} {t("nav.services")} · {c._count?.reports ?? 0} {t("service.reports")}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(c)}
                title={t("admin.edit")}
                className="p-1.5 rounded-lg text-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => onDelete(c.id)}
                title={t("admin.delete")}
                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">No constituencies match the selected filters.</p>
        )}
      </div>
    </div>
  );
}
