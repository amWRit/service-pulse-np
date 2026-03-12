"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { ServiceTypeConfig } from "./types";

interface ServiceTypeListProps {
  serviceTypes: ServiceTypeConfig[];
  onEdit: (serviceType: ServiceTypeConfig) => void;
  onDelete: (id: string) => void;
}

export default function ServiceTypeList({ serviceTypes, onEdit, onDelete }: ServiceTypeListProps) {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-2">
      {serviceTypes.map((serviceType) => (
        <div
          key={serviceType.id}
          className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 flex items-center justify-between gap-4"
        >
          <div>
            <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span>{serviceType.icon}</span>
              <span>{locale === "np" ? serviceType.nameNp : serviceType.name}</span>
            </p>
            <p className="text-xs text-gray-500">
              {serviceType.slug} · {serviceType._count?.services ?? 0} {t("admin.services")}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(serviceType)}
              title={t("admin.edit")}
              className="p-1.5 rounded-lg text-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => onDelete(serviceType.id)}
              title={t("admin.delete")}
              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
      {serviceTypes.length === 0 && (
        <p className="text-center text-gray-400 py-8 text-sm">{t("admin.noServiceTypes")}</p>
      )}
    </div>
  );
}
