import { getStatusColor, getStatusEmoji } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface StatusBadgeProps {
  status: "quiet" | "normal" | "busy";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useI18n();
  const colorClass = getStatusColor(status);
  const emoji = getStatusEmoji(status);

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${colorClass}`}>
      {emoji} {t(`service.status.${status}`)}
    </span>
  );
}
