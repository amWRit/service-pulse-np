import { Landmark, Building, Inbox, Tag, BarChart2, Map, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Tab, TabCounts } from "./types";

interface SubTabItem {
  key: Tab;
  label: string;
  count: number;
  Icon: LucideIcon;
}

interface AdminManageSubNavProps {
  activeTab: Tab;
  collapsed: boolean;
  counts: TabCounts;
  onTabChange: (tab: Tab) => void;
}

export default function AdminManageSubNav({ activeTab, collapsed, counts, onTabChange }: AdminManageSubNavProps) {
  const { t } = useI18n();

  const items: SubTabItem[] = [
    { key: "constituencies",  label: t("admin.constituencies"),   count: counts.constituencies,   Icon: Landmark  },
    { key: "services",        label: t("admin.services"),         count: counts.services,         Icon: Building  },
    { key: "serviceRequests", label: t("admin.serviceRequests"),  count: counts.serviceRequests,  Icon: Inbox     },
    { key: "serviceTypes",    label: t("admin.serviceTypes"),     count: counts.serviceTypes,     Icon: Tag       },
    { key: "reports",         label: t("admin.reports"),          count: counts.reports,          Icon: BarChart2 },
    { key: "provinces",       label: t("admin.provinces"),        count: counts.provinces,        Icon: Map       },
    { key: "districts",       label: t("admin.districts"),        count: counts.districts,        Icon: Layers    },
  ];

  return (
    <div className="mt-0.5 flex flex-col gap-0.5 lg:border-l border-gray-200 dark:border-gray-700 lg:ml-3 lg:pl-1">
      {items.map(({ key, label, count, Icon }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          title={label}
          className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium transition-colors ${
            activeTab === key
              ? "rounded-none bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
              : "rounded-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          } justify-center ${!collapsed && "lg:justify-start"}`}
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className={`${collapsed ? "hidden" : "hidden lg:flex"} items-center justify-between flex-1`}>
            <span>{label}</span>
            <span className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">{count}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
