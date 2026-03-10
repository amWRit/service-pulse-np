"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { District, Province } from "./types";

interface DistrictListProps {
  districts: District[];
  provinces: Province[];
  onEdit: (d: District) => void;
  onDelete: (id: string) => void;
}

export default function DistrictList({ districts, provinces, onEdit, onDelete }: DistrictListProps) {
  const { t } = useI18n();
  const [provinceId, setProvinceId] = useState("");

  const filtered = useMemo(
    () => (provinceId ? districts.filter((d) => d.provinceId === provinceId) : districts),
    [districts, provinceId]
  );

  return (
    <div>
      {/* Province filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setProvinceId("")}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            !provinceId ? "bg-orange-500 text-white border-orange-500" : "text-gray-600 border-gray-300 hover:border-orange-400"
          }`}
        >
          All Provinces
        </button>
        {provinces.map((p) => (
          <button
            key={p.id}
            onClick={() => setProvinceId(p.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              provinceId === p.id ? "bg-orange-500 text-white border-orange-500" : "text-gray-600 border-gray-300 hover:border-orange-400"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-xl border p-4 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-semibold text-gray-900">{d.name} / {d.nameNp}</p>
              <p className="text-xs text-gray-500">
                {d.province?.name} · {d._count?.constituencies ?? 0} constituencies
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(d)}
                title={t("admin.edit")}
                className="p-1.5 rounded-lg text-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => onDelete(d.id)}
                title={t("admin.delete")}
                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">No districts found.</p>
        )}
      </div>
    </div>
  );
}
