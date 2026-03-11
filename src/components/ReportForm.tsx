"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import StarRating from "./StarRating";

interface ReportFormProps {
  serviceId: string;
  constituencyId: string;
  onSuccess?: () => void;
}

interface ExistingReport {
  id: string;
  serviceTimeMinutes: number;
  rating: number;
  comment: string | null;
  updatedAt: string;
}

export default function ReportForm({ serviceId, constituencyId, onSuccess }: ReportFormProps) {
  const { t } = useI18n();
  const [serviceTime, setServiceTime] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [wasUpdated, setWasUpdated] = useState(false);
  const [error, setError] = useState("");
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  // Edit mode: set when the server says the user already reported this service
  const [editMode, setEditMode] = useState(false);
  const [existingReport, setExistingReport] = useState<ExistingReport | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [hoursLeft, setHoursLeft] = useState(0);

  const timePresets = [5, 15, 30, 45, 60, 90, 120];

  const enterEditMode = (data: { existing: ExistingReport; canEdit: boolean; hoursLeft: number }) => {
    setExistingReport(data.existing);
    setCanEdit(data.canEdit);
    setHoursLeft(data.hoursLeft);
    setServiceTime(String(data.existing.serviceTimeMinutes));
    setRating(data.existing.rating);
    setComment(data.existing.comment || "");
    setEditMode(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !serviceTime) return;

    setLoading(true);
    setError("");

    try {
      const method = editMode ? "PATCH" : "POST";
      const payload = editMode
        ? { publicServiceId: serviceId, serviceTimeMinutes: parseInt(serviceTime), rating, comment: comment || undefined }
        : { publicServiceId: serviceId, constituencyId, serviceTimeMinutes: parseInt(serviceTime), rating, comment: comment || undefined, anonymous, captchaToken: captchaRequired ? captchaAnswer : undefined };

      const res = await fetch("/api/reports", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // Server says user already has a report — switch to edit mode
        if (res.status === 409 && data?.alreadyReported) {
          enterEditMode(data);
          return;
        }
        if (data?.captchaRequired) {
          setCaptchaRequired(true);
          if (data.captchaQuestion) setCaptchaQuestion(data.captchaQuestion);
          setCaptchaAnswer("");
          setError(data.errorCode ? t(data.errorCode) : data.error || t("report.error"));
          return;
        }
        setError(data?.errorCode ? t(data.errorCode) : data?.error || t("report.error"));
        return;
      }

      setWasUpdated(!!data?.wasUpdated);
      setSuccess(true);
      setServiceTime("");
      setRating(0);
      setComment("");
      setCaptchaRequired(false);
      setCaptchaQuestion("");
      setCaptchaAnswer("");
      setEditMode(false);
      setExistingReport(null);
      onSuccess?.();
      setTimeout(() => { setSuccess(false); setWasUpdated(false); }, 3000);
    } catch {
      setError(t("report.error"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-2">{wasUpdated ? "✏️" : "🎉"}</div>
        <p className="text-green-800 font-bold text-lg">
          {wasUpdated ? t("report.updated") : t("report.success")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6 space-y-5">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        {editMode ? t("report.editTitle") : t("report.title")}
      </h3>

      {/* Edit mode banner */}
      {editMode && existingReport && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            {t("report.alreadyReportedNote")}
          </p>
          {canEdit ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">{t("report.editAllowed")}</p>
          ) : (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {t("report.editCooldownNote").replace("{hours}", String(hoursLeft))}
            </p>
          )}
          <button
            type="button"
            onClick={() => { setEditMode(false); setExistingReport(null); setServiceTime(""); setRating(0); setComment(""); setError(""); }}
            className="text-xs underline text-amber-600 dark:text-amber-400 mt-1"
          >
            {t("report.cancelEdit")}
          </button>
        </div>
      )}

      {/* Service time */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {t("report.serviceTime")}
        </label>
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

      {/* Anonymous — hidden in edit mode (already tied to account) */}
      {!editMode && (
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
      )}

      {/* Math Captcha */}
      {captchaRequired && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            {t("report.captchaLabel")} <span className="font-mono">{captchaQuestion}</span>
          </label>
          <input
            type="text"
            value={captchaAnswer}
            onChange={e => setCaptchaAnswer(e.target.value)}
            placeholder={captchaQuestion}
            className="w-full border dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-orange-400 dark:placeholder-gray-400"
            required
          />
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || !rating || !serviceTime || (editMode && !canEdit)}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl text-lg transition-colors"
      >
        {loading
          ? t("report.submitting")
          : editMode
            ? canEdit ? t("report.updateSubmit") : t("report.updateLocked").replace("{hours}", String(hoursLeft))
            : t("report.submit")}
      </button>
    </form>
  );
}
