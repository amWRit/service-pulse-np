"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Province } from "./types";

interface ProvinceListProps {
  provinces: Province[];
  onEdit: (p: Province) => void;
  onDelete: (id: string) => void;
}

export default function ProvinceList({ provinces, onEdit, onDelete }: ProvinceListProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      {provinces.map((p) => (
        <div
          key={p.id}
          className="bg-white rounded-xl border p-4 flex items-center justify-between gap-4"
        >
          <div>
            <p className="font-semibold text-gray-900">{p.name} / {p.nameNp}</p>
            <p className="text-xs text-gray-500">{p._count?.districts ?? 0} districts</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(p)}
              title={t("admin.edit")}
              className="p-1.5 rounded-lg text-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => onDelete(p.id)}
              title={t("admin.delete")}
              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
      {provinces.length === 0 && (
        <p className="text-center text-gray-400 py-8 text-sm">No provinces found.</p>
      )}
    </div>
  );
}
