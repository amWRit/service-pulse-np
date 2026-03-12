"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import type { ConstituencyFormData, Province, District } from "./types";

const EMPTY_FORM: ConstituencyFormData = {
  name: "",
  nameNp: "",
  districtId: "",
  imageUrl: "",
  description: "",
};

interface AddConstituencyModalProps {
  provinces: Province[];
  districts: District[];
  initialData?: ConstituencyFormData;
  onSubmit: (form: ConstituencyFormData) => Promise<void>;
  onClose: () => void;
}

export default function AddConstituencyModal({
  provinces,
  districts,
  initialData,
  onSubmit,
  onClose,
}: AddConstituencyModalProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<ConstituencyFormData>(initialData ?? EMPTY_FORM);
  const isEditing = !!initialData;

  // Derive selected province from the chosen district
  const selectedProvinceId = useMemo(
    () => districts.find((d) => d.id === form.districtId)?.provinceId ?? "",
    [form.districtId, districts]
  );
  const [provinceId, setProvinceId] = useState(selectedProvinceId);

  const filteredDistricts = useMemo(
    () => (provinceId ? districts.filter((d) => d.provinceId === provinceId) : districts),
    [provinceId, districts]
  );

  const handleProvinceChange = (id: string) => {
    setProvinceId(id);
    setForm({ ...form, districtId: "" }); // reset district when province changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          {isEditing ? t("admin.editConstituency") : t("admin.addConstituency")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name English */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Name (English)</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:placeholder-gray-400"
            />
          </div>
          {/* Name Nepali */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Name (Nepali)</label>
            <input
              value={form.nameNp}
              onChange={(e) => setForm({ ...form, nameNp: e.target.value })}
              required
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:placeholder-gray-400"
            />
          </div>
          {/* Province */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Province</label>
            <select
              value={provinceId}
              onChange={(e) => handleProvinceChange(e.target.value)}
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Select province...</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {/* District */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">District</label>
            <select
              value={form.districtId}
              onChange={(e) => setForm({ ...form, districtId: e.target.value })}
              required
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Select district...</option>
              {filteredDistricts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          {/* Image URL */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Google Drive Image URL</label>
            <input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://drive.google.com/file/d/FILE_ID/view"
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:placeholder-gray-400"
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Share the file publicly in Google Drive, then paste the link here.</p>
          </div>
          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:placeholder-gray-400 resize-y"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-orange-500 text-white rounded-lg py-2 font-semibold text-sm">
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