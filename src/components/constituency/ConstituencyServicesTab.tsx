"use client";

import ServiceCard from "@/components/ServiceCard";
import { Service } from "@/components/constituency/types";

interface ConstituencyServicesTabProps {
  t: (key: string) => string;
  serviceTypes: string[];
  filter: string;
  setFilter: (value: string) => void;
  filtered: Service[];
  getTypeLabel: (type: string) => string;
  constituencyId: string;
}

export default function ConstituencyServicesTab({
  t,
  serviceTypes,
  filter,
  setFilter,
  filtered,
  getTypeLabel,
  constituencyId,
}: ConstituencyServicesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
          {filtered.length} {t("nav.services")}
        </span>
        <div className="flex flex-wrap gap-2">
          {serviceTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                filter === type
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-orange-300"
              }`}
            >
              {getTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((svc) => (
            <ServiceCard
              key={svc.id}
              id={svc.id}
              name={svc.name}
              nameNp={svc.nameNp}
              type={svc.type}
              location={svc.location}
              avgRating={svc.avgRating}
              avgTime={svc.avgTime}
              reportCount={svc.reportCount}
              constituencyId={constituencyId}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("constituency.services.empty")}
        </div>
      )}
    </div>
  );
}
