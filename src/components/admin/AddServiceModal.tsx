"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Constituency, ServiceFormData } from "./types";

const SERVICE_TYPES = [
  "hospital",
  "government_office",
  "transport",
  "education",
  "utility",
  "police",
  "bank",
  "other",
];

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
  initialData?: ServiceFormData;
  onSubmit: (form: ServiceFormData) => Promise<void>;
  onClose: () => void;
}

export default function AddServiceModal({ constituencies, initialData, onSubmit, onClose }: AddServiceModalProps) {
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
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">
          {isEditing ? t("admin.editService") : t("admin.addService")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {TEXT_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
              <input
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Constituency</label>
            <select
              value={form.constituencyId}
              onChange={(e) => setForm({ ...form, constituencyId: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
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
              className="flex-1 border rounded-lg py-2 text-sm"
            >
              {t("admin.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
