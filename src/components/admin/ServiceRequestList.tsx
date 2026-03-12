"use client";

import { useMemo } from "react";
import { Check, X, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { ServiceRequest } from "./types";

interface ServiceRequestListProps {
  requests: ServiceRequest[];
  statusFilter: "pending" | "approved" | "rejected" | "all";
  onFilterChange: (status: "pending" | "approved" | "rejected" | "all") => void;
  onApprove: (request: ServiceRequest) => void;
  onReject: (requestId: string) => void;
  onDelete: (requestId: string) => void;
}

export default function ServiceRequestList({ requests, statusFilter, onFilterChange, onApprove, onReject, onDelete }: ServiceRequestListProps) {
  const { t, locale } = useI18n();

  const filtered = useMemo(() =>
    statusFilter === "all" ? requests : requests.filter((r) => r.status === statusFilter),
    [requests, statusFilter]
  );

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((status) => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
              statusFilter === status
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            {status === "all" ? t("admin.all") : status === "pending" ? t("admin.pending") : status === "approved" ? t("admin.approved") : t("admin.rejected")}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((request) => (
        <div
          key={request.id}
          className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{request.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {locale === "np" ? request.constituency?.nameNp : request.constituency?.name}
              </p>
              {request.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{request.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(request.createdAt).toLocaleDateString()} · {request.status}
                {request.approvedService && ` · ${request.approvedService.name}`}
              </p>
            </div>

            <div className="flex gap-1 flex-shrink-0">
              {request.status === "pending" && (
                <>
                  <button
                    onClick={() => onApprove(request)}
                    title={t("admin.approve")}
                    className="p-1.5 rounded-lg text-green-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                  >
                    <Check size={15} />
                  </button>
                  <button
                    onClick={() => onReject(request.id)}
                    title={t("admin.reject")}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </>
              )}
              <button
                onClick={() => onDelete(request.id)}
                title={t("admin.delete")}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      ))}

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">{t("admin.noServiceRequests")}</p>
        )}
      </div>
    </div>
  );
}
