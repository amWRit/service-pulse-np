"use client";

import { Landmark, Building, Inbox, Tag, BarChart2, Map, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import ConstituencyList from "./ConstituencyList";
import ServiceList from "./ServiceList";
import ServiceTypeList from "./ServiceTypeList";
import ServiceRequestList from "./ServiceRequestList";
import ReportList from "./ReportList";
import ProvinceList from "./ProvinceList";
import DistrictList from "./DistrictList";
import type {
  Tab,
  SidebarNav,
  Constituency,
  Service,
  Report,
  Province,
  District,
  ServiceTypeConfig,
  ServiceRequest,
} from "./types";

interface AdminMainContentProps {
  sidebarNav: SidebarNav;
  tab: Tab;
  constituencies: Constituency[];
  services: Service[];
  reports: Report[];
  serviceRequests: ServiceRequest[];
  serviceRequestStatus: "pending" | "approved" | "rejected" | "all";
  onServiceRequestStatusChange: (status: "pending" | "approved" | "rejected" | "all") => void;
  provinces: Province[];
  districts: District[];
  serviceTypes: ServiceTypeConfig[];
  onAdd: () => void;
  onEditConstituency: (c: Constituency) => void;
  onDeleteConstituency: (id: string) => void;
  onEditService: (s: Service) => void;
  onDeleteService: (id: string) => void;
  onEditServiceType: (st: ServiceTypeConfig) => void;
  onDeleteServiceType: (id: string) => void;
  onApproveServiceRequest: (r: ServiceRequest) => void;
  onRejectServiceRequest: (id: string) => void;
  onDeleteServiceRequest: (id: string) => void;
  onModerateReport: (id: string, isHidden: boolean) => void;
  onDeleteReport: (id: string) => void;
  onEditProvince: (p: Province) => void;
  onDeleteProvince: (id: string) => void;
  onEditDistrict: (d: District) => void;
  onDeleteDistrict: (id: string) => void;
}

export default function AdminMainContent({
  sidebarNav,
  tab,
  constituencies,
  services,
  reports,
  serviceRequests,
  serviceRequestStatus,
  onServiceRequestStatusChange,
  provinces,
  districts,
  serviceTypes,
  onAdd,
  onEditConstituency,
  onDeleteConstituency,
  onEditService,
  onDeleteService,
  onEditServiceType,
  onDeleteServiceType,
  onApproveServiceRequest,
  onRejectServiceRequest,
  onDeleteServiceRequest,
  onModerateReport,
  onDeleteReport,
  onEditProvince,
  onDeleteProvince,
  onEditDistrict,
  onDeleteDistrict,
}: AdminMainContentProps) {
  const { t } = useI18n();

  const tabLabels: Record<Tab, string> = {
    constituencies: t("admin.constituencies"),
    services: t("admin.services"),
    serviceRequests: t("admin.serviceRequests"),
    serviceTypes: t("admin.serviceTypes"),
    reports: t("admin.reports"),
    provinces: t("admin.provinces"),
    districts: t("admin.districts"),
  };

  const tabIcons: Record<Tab, LucideIcon> = {
    constituencies: Landmark,
    services: Building,
    serviceRequests: Inbox,
    serviceTypes: Tag,
    reports: BarChart2,
    provinces: Map,
    districts: Layers,
  };

  const addLabel: Record<string, string> = {
    constituencies: t("admin.addConstituency"),
    services: t("admin.addService"),
    serviceTypes: t("admin.addServiceType"),
    provinces: t("admin.addProvince"),
    districts: t("admin.addDistrict"),
  };

  const showAddButton = tab !== "reports" && tab !== "serviceRequests";

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {sidebarNav === "manage" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-gray-900 dark:text-white">
                {(() => { const Icon = tabIcons[tab]; return <Icon className="w-6 h-6 text-orange-500" />; })()}
                {tabLabels[tab]}
              </h1>
              {showAddButton && (
                <button
                  onClick={onAdd}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                >
                  <span aria-hidden="true">+</span>
                  <span className="hidden sm:inline sm:ml-1">{addLabel[tab]}</span>
                </button>
              )}
            </div>

            {tab === "constituencies" && (
              <ConstituencyList
                constituencies={constituencies}
                provinces={provinces}
                districts={districts}
                onEdit={onEditConstituency}
                onDelete={onDeleteConstituency}
              />
            )}

            {tab === "services" && (
              <ServiceList
                services={services}
                constituencies={constituencies}
                provinces={provinces}
                districts={districts}
                onEdit={onEditService}
                onDelete={onDeleteService}
              />
            )}

            {tab === "serviceTypes" && (
              <ServiceTypeList
                serviceTypes={serviceTypes}
                onEdit={onEditServiceType}
                onDelete={onDeleteServiceType}
              />
            )}

            {tab === "serviceRequests" && (
              <ServiceRequestList
                requests={serviceRequests}
                statusFilter={serviceRequestStatus}
                onFilterChange={onServiceRequestStatusChange}
                onApprove={onApproveServiceRequest}
                onReject={onRejectServiceRequest}
                onDelete={onDeleteServiceRequest}
              />
            )}

            {tab === "reports" && (
              <ReportList
                reports={reports}
                constituencies={constituencies}
                provinces={provinces}
                districts={districts}
                onModerate={onModerateReport}
                onDelete={onDeleteReport}
              />
            )}

            {tab === "provinces" && (
              <ProvinceList
                provinces={provinces}
                onEdit={onEditProvince}
                onDelete={onDeleteProvince}
              />
            )}

            {tab === "districts" && (
              <DistrictList
                districts={districts}
                provinces={provinces}
                onEdit={onEditDistrict}
                onDelete={onDeleteDistrict}
              />
            )}
          </>
        )}

        {sidebarNav === "settings" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-8">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">{t("admin.settings")}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t("admin.settingsComingSoon")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
