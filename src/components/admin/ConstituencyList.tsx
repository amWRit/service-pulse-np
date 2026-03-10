"use client";

import { useI18n } from "@/lib/i18n";
import type { Constituency } from "./types";

interface ConstituencyListProps {
  constituencies: Constituency[];
  onDelete: (id: string) => void;
}

export default function ConstituencyList({ constituencies, onDelete }: ConstituencyListProps) {
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
          <button
            onClick={() => onDelete(c.id)}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            {t("admin.delete")}
          </button>
        </div>
      ))}
    </div>
  );
}
