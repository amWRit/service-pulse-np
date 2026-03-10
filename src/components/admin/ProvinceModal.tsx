"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

interface ProvinceFormData {
  name: string;
  nameNp: string;
}

const EMPTY: ProvinceFormData = { name: "", nameNp: "" };

interface ProvinceModalProps {
  initialData?: ProvinceFormData;
  onSubmit: (form: ProvinceFormData) => Promise<void>;
  onClose: () => void;
}

export default function ProvinceModal({ initialData, onSubmit, onClose }: ProvinceModalProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<ProvinceFormData>(initialData ?? EMPTY);
  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    setForm(EMPTY);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">
          {isEditing ? "Edit Province" : "Add Province"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Name (English)</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Name (Nepali)</label>
            <input
              value={form.nameNp}
              onChange={(e) => setForm({ ...form, nameNp: e.target.value })}
              required
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-orange-500 text-white rounded-lg py-2 font-semibold text-sm">
              {t("admin.save")}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm">
              {t("admin.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
