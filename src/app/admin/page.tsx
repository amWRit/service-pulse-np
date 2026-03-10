"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import ConstituencyList from "@/components/admin/ConstituencyList";
import AddConstituencyModal from "@/components/admin/AddConstituencyModal";
import ServiceList from "@/components/admin/ServiceList";
import AddServiceModal from "@/components/admin/AddServiceModal";
import ReportList from "@/components/admin/ReportList";
import type { Constituency, Service, Report, ConstituencyFormData, ServiceFormData } from "@/components/admin/types";

type Tab = "constituencies" | "services" | "reports";
type Modal = "addConstituency" | "addService" | null;

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("constituencies");
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Modal>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session && session.user.role !== "admin") router.push("/");
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user.role === "admin") loadAll();
  }, [session]);

  const loadAll = async () => {
    setLoading(true);
    const [c, s, r] = await Promise.all([
      fetch("/api/constituencies").then((x) => x.json()),
      fetch("/api/services").then((x) => x.json()),
      fetch("/api/reports").then((x) => x.json()),
    ]);
    setConstituencies(c);
    setServices(s);
    setReports(r);
    setLoading(false);
  };

  const deleteConstituency = async (id: string) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    await fetch(`/api/constituencies/${id}`, { method: "DELETE" });
    loadAll();
  };

  const deleteService = async (id: string) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    loadAll();
  };

  const moderateReport = async (id: string, isHidden: boolean) => {
    await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isHidden }),
    });
    loadAll();
  };

  const deleteReport = async (id: string) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    await fetch(`/api/reports/${id}`, { method: "DELETE" });
    loadAll();
  };

  const submitConstituency = async (form: ConstituencyFormData) => {
    await fetch("/api/constituencies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setModal(null);
    loadAll();
  };

  const submitService = async (form: ServiceFormData) => {
    await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setModal(null);
    loadAll();
  };

  if (status === "loading" || loading) {
    return <div className="max-w-5xl mx-auto p-8 text-center text-gray-400">Loading admin panel...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">{t("admin.dashboard")} 🔒</h1>
        {tab !== "reports" && (
          <button
            onClick={() => setModal(tab === "constituencies" ? "addConstituency" : "addService")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
          >
            + {tab === "constituencies" ? t("admin.addConstituency") : t("admin.addService")}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {(["constituencies", "services", "reports"] as Tab[]).map((t_) => (
          <button
            key={t_}
            onClick={() => setTab(t_)}
            className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
              tab === t_ ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {t(`admin.${t_}`)} ({t_ === "constituencies" ? constituencies.length : t_ === "services" ? services.length : reports.length})
          </button>
        ))}
      </div>

      {tab === "constituencies" && (
        <ConstituencyList constituencies={constituencies} onDelete={deleteConstituency} />
      )}

      {tab === "services" && (
        <ServiceList services={services} onDelete={deleteService} />
      )}

      {tab === "reports" && (
        <ReportList reports={reports} onModerate={moderateReport} onDelete={deleteReport} />
      )}

      {modal === "addConstituency" && (
        <AddConstituencyModal onSubmit={submitConstituency} onClose={() => setModal(null)} />
      )}

      {modal === "addService" && (
        <AddServiceModal
          constituencies={constituencies}
          onSubmit={submitService}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
