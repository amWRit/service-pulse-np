"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import ServiceCard from "@/components/ServiceCard";
import Link from "next/link";
import { gDriveUrl } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  nameNp: string;
  type: string;
  location?: string;
  constituencyId: string;
  avgRating?: number | null;
  avgTime?: number | null;
  reportCount?: number;
}

interface Constituency {
  id: string;
  name: string;
  nameNp: string;
  province?: string;
  imageUrl?: string;
  description?: string;
  services: Service[];
}

export default function ConstituencyPage() {
  const params = useParams();
  const { t, locale } = useI18n();
  const [data, setData] = useState<Constituency | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const id = params.id as string;

  useEffect(() => {
    Promise.all([
      fetch(`/api/constituencies/${id}`).then((r) => r.json()),
      fetch(`/api/services?constituencyId=${id}`).then((r) => r.json()),
    ]).then(([constituency, svcs]) => {
      setData(constituency);
      setServices(svcs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const serviceTypes = ["all", ...Array.from(new Set(services.map((s) => s.type)))];
  const filtered = filter === "all" ? services : services.filter((s) => s.type === filter);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-48 bg-gray-200 rounded-2xl animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-red-500">Constituency not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href="/" className="text-orange-600 hover:underline text-sm mb-4 inline-block">← {t("nav.home")}</Link>

      {/* Header */}
      <div className="rounded-2xl overflow-hidden mb-6 relative h-48 bg-gradient-to-br from-orange-400 to-red-500">
        <Image
          src={data.imageUrl ? gDriveUrl(data.imageUrl) : "/images/emblem.jpg"}
          alt={data.name}
          fill
          className="object-cover"
          style={{ objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-black/40 flex items-end p-6">
          <div>
            {data.province && (
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full mb-2 inline-block">
                {data.province}
              </span>
            )}
            <h1 className="text-3xl font-extrabold text-white">
              {locale === "np" ? data.nameNp : data.name}
            </h1>
            {data.description && (
              <p className="text-white/80 text-sm mt-1">{data.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Filter by type */}
      <div className="flex flex-wrap gap-2 mb-6">
        {serviceTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              filter === type
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"
            }`}
          >
            {type === "all" ? "All" : t(`service.type.${type}`)}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        {filtered.length} services
      </h2>
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
            constituencyId={id}
          />
        ))}
      </div>
    </div>
  );
}
