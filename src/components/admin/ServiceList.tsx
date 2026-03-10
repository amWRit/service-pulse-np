"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Service } from "./types";

interface ServiceListProps {
  services: Service[];
  onEdit: (s: Service) => void;
  onDelete: (id: string) => void;
}

export default function ServiceList({ services, onEdit, onDelete }: ServiceListProps) {
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
    </div>
  );
}
