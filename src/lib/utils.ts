import { prisma } from "@/lib/prisma";

/**
 * Extracts the file ID from various Google Drive URL formats.
 * Falls back to treating the value as a bare file ID if no pattern matches.
 */
export function extractGDriveFileId(url: string): string {
  const patterns = [
    /\/file\/d\/([^/]+)/,   // https://drive.google.com/file/d/FILE_ID/view
    /id=([^&]+)/,             // https://drive.google.com/open?id=FILE_ID
    /\/d\/([^/]+)/,           // https://drive.google.com/uc?export=view&id=FILE_ID
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return url.trim();
}

export function gDriveUrl(url: string): string {
  return `https://drive.google.com/uc?export=view&id=${extractGDriveFileId(url)}`;
}

export function getStatusFromAvg(avgMinutes: number | null): "quiet" | "normal" | "busy" {
  if (!avgMinutes) return "normal";
  if (avgMinutes <= 15) return "quiet";
  if (avgMinutes <= 45) return "normal";
  return "busy";
}

export function getStatusColor(status: "quiet" | "normal" | "busy"): string {
  switch (status) {
    case "quiet":
      return "bg-green-100 text-green-800 border-green-200";
    case "normal":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "busy":
      return "bg-red-100 text-red-800 border-red-200";
  }
}

export function getStatusEmoji(status: "quiet" | "normal" | "busy"): string {
  switch (status) {
    case "quiet":
      return "🟢";
    case "normal":
      return "🟡";
    case "busy":
      return "🔴";
  }
}

export function getRatingEmoji(rating: number): string {
  if (rating >= 4.5) return "⭐⭐⭐⭐⭐";
  if (rating >= 3.5) return "⭐⭐⭐⭐";
  if (rating >= 2.5) return "⭐⭐⭐";
  if (rating >= 1.5) return "⭐⭐";
  return "⭐";
}

export async function checkAndAwardBadges(userId: string) {
  const reportCount = await prisma.report.count({ where: { userId } });

  const badgeConditions: { name: string; threshold: number }[] = [
    { name: "First Report", threshold: 1 },
    { name: "5 Reports", threshold: 5 },
    { name: "10 Reports", threshold: 10 },
    { name: "25 Reports", threshold: 25 },
  ];

  for (const condition of badgeConditions) {
    if (reportCount >= condition.threshold) {
      const badge = await prisma.badge.findFirst({
        where: { name: condition.name },
      });
      if (badge) {
        await prisma.userBadge
          .create({ data: { userId, badgeId: badge.id } })
          .catch(() => {}); // ignore unique constraint errors
      }
    }
  }

  // Slow badge: reported a service that consistently takes > 60 min
  const slowReports = await prisma.report.findMany({
    where: { userId, serviceTimeMinutes: { gte: 60 } },
  });
  if (slowReports.length >= 3) {
    const badge = await prisma.badge.findFirst({ where: { name: "Slow Spotter" } });
    if (badge) {
      await prisma.userBadge
        .create({ data: { userId, badgeId: badge.id } })
        .catch(() => {});
    }
  }
}
