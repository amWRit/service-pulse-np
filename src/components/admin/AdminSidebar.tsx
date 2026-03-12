"use client";

import { LayoutDashboard, Settings as SettingsIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AdminNavItem from "./AdminNavItem";
import AdminManageSubNav from "./AdminManageSubNav";
import type { Tab, SidebarNav, TabCounts } from "./types";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeNav: SidebarNav;
  onNavChange: (nav: SidebarNav) => void;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  counts: TabCounts;
}

export default function AdminSidebar({
  collapsed,
  onToggleCollapse,
  activeNav,
  onNavChange,
  activeTab,
  onTabChange,
  counts,
}: AdminSidebarProps) {
  const { t } = useI18n();

  return (
    <div
      className={`border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col overflow-y-auto transition-all duration-300 ${
        collapsed ? "w-14 lg:w-20" : "w-14 lg:w-56"
      }`}
    >
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        {!collapsed && (
          <h2 className="hidden lg:block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Admin
          </h2>
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors ml-auto"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className="w-4 h-4 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-1.5">
        {/* Manage */}
        <div>
          <AdminNavItem
            icon={LayoutDashboard}
            label={t("admin.manage")}
            active={activeNav === "manage"}
            collapsed={collapsed}
            onClick={() => onNavChange("manage")}
          />
          {activeNav === "manage" && (
            <AdminManageSubNav
              activeTab={activeTab}
              collapsed={collapsed}
              counts={counts}
              onTabChange={onTabChange}
            />
          )}
        </div>

        {/* Settings */}
        <AdminNavItem
          icon={SettingsIcon}
          label={t("admin.settings")}
          active={activeNav === "settings"}
          collapsed={collapsed}
          onClick={() => onNavChange("settings")}
        />
      </nav>
    </div>
  );
}
