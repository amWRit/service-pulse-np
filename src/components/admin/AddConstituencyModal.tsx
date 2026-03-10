"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { ConstituencyFormData } from "./types";

const EMPTY_FORM: ConstituencyFormData = {
  name: "",
  nameNp: "",
  province: "",
  imageUrl: "",
  description: "",
};

const FIELDS: { label: string; key: keyof ConstituencyFormData }[] = [
  { label: "Name (English)", key: "name" },
  { label: "Name (Nepali)", key: "nameNp" },
  { label: "Province", key: "province" },
  { label: "Image URL", key: "imageUrl" },
  { label: "Description", key: "description" },
];

interface AddConstituencyModalProps {
  onSubmit: (form: ConstituencyFormData) => Promise<void>;
  onClose: () => void;
}

export default function AddConstituencyModal({ onSubmit, onClose }: AddConstituencyModalProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<ConstituencyFormData>(EMPTY_FORM);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">{t("admin.addConstituency")}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
              <input
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          ))}
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
