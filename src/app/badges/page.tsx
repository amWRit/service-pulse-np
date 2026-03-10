"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

interface Badge {
  id: string;
  name: string;
  nameNp: string;
  description: string;
  icon: string;
  condition: string;
  conditionNp: string;
}

interface BadgesData {
  all: Badge[];
  earnedIds: string[];
}

export default function BadgesPage() {
  const { t, locale } = useI18n();
  const { data: session, status } = useSession();
  const [data, setData] = useState<BadgesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/badges")
        .then((r) => r.json())
        .then((d) => { setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [session, status]);

  if (status === "loading" || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{t("badges.loginToView" as never)}</h2>
        <Link href="/login" className="inline-block mt-4 bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">
          {t("nav.login")}
        </Link>
      </div>
    );
  }

  const earnedSet = new Set(data?.earnedIds ?? []);
  const earned = data?.all.filter((b) => earnedSet.has(b.id)) ?? [];
  const notEarned = data?.all.filter((b) => !earnedSet.has(b.id)) ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🏅</div>
        <h1 className="text-3xl font-extrabold text-gray-900">{t("badges.title")}</h1>
        <p className="text-gray-500 mt-1">
          {earned.length}/{data?.all.length ?? 0} {t("badges.earned")}
        </p>
      </div>

      {earned.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-3">✅ {t("badges.earned")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {earned.map((badge) => (
              <div key={badge.id} className="bg-white border-2 border-orange-300 rounded-2xl p-4 text-center shadow-sm">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="font-bold text-gray-900 text-sm">
                  {locale === "np" ? badge.nameNp : badge.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notEarned.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-500 mb-3">🔒 {t("badges.notEarned")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {notEarned.map((badge) => (
              <div key={badge.id} className="bg-gray-50 border rounded-2xl p-4 text-center opacity-60">
                <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                <p className="font-bold text-gray-500 text-sm">
                  {locale === "np" ? badge.nameNp : badge.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">{locale === "np" && badge.conditionNp ? badge.conditionNp : badge.condition}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
