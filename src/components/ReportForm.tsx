"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import StarRating from "./StarRating";

interface ReportFormProps {
  serviceId: string;
  constituencyId: string;
  onSuccess?: () => void;
}

export default function ReportForm({ serviceId, constituencyId, onSuccess }: ReportFormProps) {
  const { t } = useI18n();
  const [serviceTime, setServiceTime] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Quick time presets in minutes
  const timePresets = [5, 15, 30, 45, 60, 90, 120];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !serviceTime) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicServiceId: serviceId,
          constituencyId,
          serviceTimeMinutes: parseInt(serviceTime),
          rating,
          comment: comment || undefined,
          anonymous,
        }),
      });

      if (!res.ok) throw new Error("Submit failed");

      setSuccess(true);
      setServiceTime("");
      setRating(0);
      setComment("");
      onSuccess?.();

      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError(t("report.error"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-2">🎉</div>
        <p className="text-green-800 font-bold text-lg">{t("report.success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6 space-y-5">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("report.title")}</h3>

      {/* Service time */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {t("report.serviceTime")}
        </label>
        {/* Quick presets */}
        <div className="flex flex-wrap gap-2 mb-3">
          {timePresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setServiceTime(String(preset))}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                serviceTime === String(preset)
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-orange-300"
              }`}
            >
              {preset} {t("home.minutes")}
            </button>
          ))}
        </div>
        <input
          type="number"
          min="1"
          max="480"
          value={serviceTime}
          onChange={(e) => setServiceTime(e.target.value)}
          placeholder={t("report.customMinutes")}
          className="w-full border dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-orange-400 dark:placeholder-gray-400"
          required
        />
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {t("report.rating")}
        </label>
        <StarRating rating={rating} interactive onRate={setRating} size="lg" />
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {t("report.comment")}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("report.commentPlaceholder")}
          rows={3}
          className="w-full border dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none dark:placeholder-gray-400"
        />
      </div>

      {/* Anonymous */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setAnonymous(!anonymous)}
          className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
            anonymous ? "bg-orange-500" : "bg-gray-200"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              anonymous ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <label className="text-sm text-gray-700 dark:text-gray-200">{t("report.anonymous")}</label>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || !rating || !serviceTime}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl text-lg transition-colors"
      >
        {loading ? t("report.submitting") : t("report.submit")}
      </button>
    </form>
  );
}
