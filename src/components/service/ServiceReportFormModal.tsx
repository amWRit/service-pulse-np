"use client";

import { useCallback, useEffect, useRef } from "react";
import ReportForm from "@/components/ReportForm";
import { useI18n } from "@/lib/i18n";

interface ServiceReportFormModalProps {
  serviceId: string;
  constituencyId: string;
  challengeToken?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ServiceReportFormModal({
  serviceId,
  constituencyId,
  challengeToken,
  onClose,
  onSuccess,
}: ServiceReportFormModalProps) {
  const { t } = useI18n();
  const closeTimerRef = useRef<number | null>(null);

  const handleSuccess = useCallback(() => {
    onSuccess?.();

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      onClose();
    }, 2200);
  }, [onClose, onSuccess]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-gray-50 dark:bg-gray-900 w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90dvh]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-t-3xl flex-shrink-0">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white">{t("service.report")}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5">
          <ReportForm
            serviceId={serviceId}
            constituencyId={constituencyId}
            challengeToken={challengeToken}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}
