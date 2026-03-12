import type { LucideIcon } from "lucide-react";

interface AdminNavItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

export default function AdminNavItem({ icon: Icon, label, active, collapsed, onClick }: AdminNavItemProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-none font-semibold text-sm transition-colors ${
        active
          ? "bg-orange-500 text-white"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      } justify-center ${!collapsed && "lg:justify-start"}`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className={collapsed ? "hidden" : "hidden lg:inline"}>{label}</span>
    </button>
  );
}
