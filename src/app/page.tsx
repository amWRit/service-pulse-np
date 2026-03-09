"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import ConstituencyCard from "@/components/ConstituencyCard";

interface Constituency {
  id: string;
  name: string;
  nameNp: string;
  province: string | null;
  imageUrl: string | null;
  _count: { services: number; reports: number };
}

export default function HomePage() {
  const { t, locale } = useI18n();
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/constituencies")
      .then((r) => r.json())
      .then((data) => { setConstituencies(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = constituencies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.nameNp.includes(search)
  );

  const totalReports = constituencies.reduce((sum, c) => sum + c._count.reports, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center py-10 mb-8">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          {t("home.title")}
        </h1>
        <p className="text-lg text-gray-600 mb-6">{t("home.subtitle")}</p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="bg-orange-50 rounded-2xl px-6 py-3 text-center">
            <p className="text-3xl font-extrabold text-orange-600">{constituencies.length}</p>
            <p className="text-sm text-gray-600">Constituencies</p>
          </div>
          <div className="bg-orange-50 rounded-2xl px-6 py-3 text-center">
            <p className="text-3xl font-extrabold text-orange-600">
              {constituencies.reduce((sum, c) => sum + c._count.services, 0)}
            </p>
            <p className="text-sm text-gray-600">Public Services</p>
          </div>
          <div className="bg-orange-50 rounded-2xl px-6 py-3 text-center">
            <p className="text-3xl font-extrabold text-orange-600">{totalReports}</p>
            <p className="text-sm text-gray-600">{t("home.totalReports")}</p>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("home.searchPlaceholder")}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-lg"
          />
        </div>
      </div>

      {/* Constituencies Grid */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {t("home.selectConstituency")}
      </h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-52 animate-pulse border" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-lg">
          No results found for &quot;{search}&quot;
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <ConstituencyCard
              key={c.id}
              id={c.id}
              name={c.name}
              nameNp={c.nameNp}
              province={c.province}
              imageUrl={c.imageUrl}
              serviceCount={c._count.services}
              reportCount={c._count.reports}
            />
          ))}
        </div>
      )}
    </div>
  );
}
