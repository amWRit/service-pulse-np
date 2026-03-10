"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Constituency } from "./types";

interface ConstituencyListProps {
  constituencies: Constituency[];
  onEdit: (c: Constituency) => void;
  onDelete: (id: string) => void;
}

export default function ConstituencyList({ constituencies, onEdit, onDelete }: ConstituencyListProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      {constituencies.map((c) => (
        <div
          key={c.id}
          className="bg-white rounded-xl border p-4 flex items-center justify-between gap-4"
        >
          <div>
            <p className="font-semibold text-gray-900">
              {c.name} / {c.nameNp}
            </p>
            <p className="text-xs text-gray-500">
              {c.province} · {c._count?.services ?? 0} services · {c._count?.reports ?? 0} reports
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
    </div>
  );
}
