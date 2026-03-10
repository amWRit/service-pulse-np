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
type Modal = "addConstituency" | "addService" | "editConstituency" | "editService" | null;

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
  const [editingConstituency, setEditingConstituency] = useState<Constituency | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

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
    const url = editingConstituency
      ? `/api/constituencies/${editingConstituency.id}`
      : "/api/constituencies";
    await fetch(url, {
      method: editingConstituency ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setModal(null);
    setEditingConstituency(null);
    loadAll();
  };

  const submitService = async (form: ServiceFormData) => {
    const url = editingService
      ? `/api/services/${editingService.id}`
      : "/api/services";
    await fetch(url, {
      method: editingService ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setModal(null);
    setEditingService(null);
    loadAll();
  };

  const openEditConstituency = (c: Constituency) => {
    setEditingConstituency(c);
    setModal("editConstituency");
  };

  const openEditService = (s: Service) => {
    setEditingService(s);
    setModal("editService");
  };

  const closeModal = () => {
    setModal(null);
    setEditingConstituency(null);
    setEditingService(null);
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
        <ConstituencyList
          constituencies={constituencies}
          onEdit={openEditConstituency}
          onDelete={deleteConstituency}
        />
      )}

      {tab === "services" && (
        <ServiceList
          services={services}
          onEdit={openEditService}
          onDelete={deleteService}
        />
      )}

      {tab === "reports" && (
        <ReportList reports={reports} onModerate={moderateReport} onDelete={deleteReport} />
      )}

      {(modal === "addConstituency" || modal === "editConstituency") && (
        <AddConstituencyModal
          initialData={
            editingConstituency
              ? {
                  name: editingConstituency.name,
                  nameNp: editingConstituency.nameNp,
                  province: editingConstituency.province ?? "",
                  imageUrl: editingConstituency.imageUrl ?? "",
                  description: editingConstituency.description ?? "",
                }
              : undefined
          }
          onSubmit={submitConstituency}
          onClose={closeModal}
        />
      )}

      {(modal === "addService" || modal === "editService") && (
        <AddServiceModal
          constituencies={constituencies}
          initialData={
            editingService
              ? {
                  name: editingService.name,
                  nameNp: editingService.nameNp,
                  type: editingService.type,
                  location: editingService.location ?? "",
                  description: editingService.description ?? "",
                  descriptionNp: editingService.descriptionNp ?? "",
                  constituencyId: editingService.constituencyId,
                }
              : undefined
          }
          onSubmit={submitService}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
