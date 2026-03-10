"use client";

import { useI18n } from "@/lib/i18n";
import type { Service } from "./types";

interface ServiceListProps {
  services: Service[];
  onDelete: (id: string) => void;
}

export default function ServiceList({ services, onDelete }: ServiceListProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      {services.map((s) => (
        <div
          key={s.id}
          className="bg-white rounded-xl border p-4 flex items-center justify-between gap-4"
        >
          <div>
            <p className="font-semibold text-gray-900">
              {s.name} / {s.nameNp}
            </p>
            <p className="text-xs text-gray-500">
              {t(`service.type.${s.type}`)} · {s.location} · {s.constituency?.name}
            </p>
          </div>
          <button
            onClick={() => onDelete(s.id)}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            {t("admin.delete")}
          </button>
        </div>
      ))}
    </div>
  );
}
