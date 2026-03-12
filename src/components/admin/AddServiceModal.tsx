"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Constituency, ServiceFormData, ServiceTypeConfig } from "./types";

const TEXT_FIELDS: { label: string; key: keyof ServiceFormData }[] = [
  { label: "Name (English)", key: "name" },
  { label: "Name (Nepali)", key: "nameNp" },
  { label: "Location", key: "location" },
  { label: "Description (English)", key: "description" },
  { label: "Description (Nepali)", key: "descriptionNp" },
];

const EMPTY_FORM: ServiceFormData = {
  name: "",
  nameNp: "",
  type: "other",
  location: "",
  description: "",
  descriptionNp: "",
  constituencyId: "",
};

interface AddServiceModalProps {
  constituencies: Constituency[];
  serviceTypes: ServiceTypeConfig[];
  initialData?: ServiceFormData;
  onSubmit: (form: ServiceFormData) => Promise<void>;
  onClose: () => void;
}

export default function AddServiceModal({ constituencies, serviceTypes, initialData, onSubmit, onClose }: AddServiceModalProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<ServiceFormData>(initialData ?? EMPTY_FORM);
  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          {isEditing ? t("admin.editService") : t("admin.addService")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {TEXT_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{field.label}</label>
              {field.key === "description" || field.key === "descriptionNp" ? (
                <textarea
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  rows={2}
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:placeholder-gray-400 resize-y"
                />
              ) : (
                <input
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:placeholder-gray-400"
                />
              )}
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {serviceTypes.map((st) => (
                <option key={st.slug} value={st.slug}>
                  {st.icon} {st.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Constituency</label>
            <select
              value={form.constituencyId}
              onChange={(e) => setForm({ ...form, constituencyId: e.target.value })}
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            >
              <option value="">Select constituency...</option>
              {constituencies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-orange-500 text-white rounded-lg py-2 font-semibold text-sm"
            >
              {t("admin.save")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-lg py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              {t("admin.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
