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
import ProvinceList from "@/components/admin/ProvinceList";
import ProvinceModal from "@/components/admin/ProvinceModal";
import DistrictList from "@/components/admin/DistrictList";
import DistrictModal from "@/components/admin/DistrictModal";
import type { Constituency, Service, Report, Province, District, ConstituencyFormData, ServiceFormData } from "@/components/admin/types";

type Tab = "constituencies" | "services" | "reports" | "provinces" | "districts";
type Modal =
  | "addConstituency" | "editConstituency"
  | "addService" | "editService"
  | "addProvince" | "editProvince"
  | "addDistrict" | "editDistrict"
  | null;

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("constituencies");
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Modal>(null);
  const [editingConstituency, setEditingConstituency] = useState<Constituency | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingProvince, setEditingProvince] = useState<Province | null>(null);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session && session.user.role !== "admin") router.push("/");
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user.role === "admin") loadAll();
  }, [session]);

  const loadAll = async () => {
    setLoading(true);
    const [c, s, r, p, d] = await Promise.all([
      fetch("/api/constituencies").then((x) => x.json()),
      fetch("/api/services").then((x) => x.json()),
      fetch("/api/reports").then((x) => x.json()),
      fetch("/api/provinces").then((x) => x.json()),
      fetch("/api/districts").then((x) => x.json()),
    ]);
    setConstituencies(c);
    setServices(s);
    setReports(r);
    setProvinces(p);
    setDistricts(d);
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

  const openEditConstituency = (c: Constituency) => { setEditingConstituency(c); setModal("editConstituency"); };
  const openEditService = (s: Service) => { setEditingService(s); setModal("editService"); };
  const openEditProvince = (p: Province) => { setEditingProvince(p); setModal("editProvince"); };
  const openEditDistrict = (d: District) => { setEditingDistrict(d); setModal("editDistrict"); };

  const submitProvince = async (form: { name: string; nameNp: string }) => {
    const url = editingProvince ? `/api/provinces/${editingProvince.id}` : "/api/provinces";
    await fetch(url, {
      method: editingProvince ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setModal(null); setEditingProvince(null); loadAll();
  };

  const deleteProvince = async (id: string) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    await fetch(`/api/provinces/${id}`, { method: "DELETE" });
    loadAll();
  };

  const submitDistrict = async (form: { name: string; nameNp: string; provinceId: string }) => {
    const url = editingDistrict ? `/api/districts/${editingDistrict.id}` : "/api/districts";
    await fetch(url, {
      method: editingDistrict ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setModal(null); setEditingDistrict(null); loadAll();
  };

  const deleteDistrict = async (id: string) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    await fetch(`/api/districts/${id}`, { method: "DELETE" });
    loadAll();
  };

  const closeModal = () => {
    setModal(null);
    setEditingConstituency(null);
    setEditingService(null);
    setEditingProvince(null);
    setEditingDistrict(null);
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
            onClick={() => {
              if (tab === "constituencies") setModal("addConstituency");
              else if (tab === "services") setModal("addService");
              else if (tab === "provinces") setModal("addProvince");
              else if (tab === "districts") setModal("addDistrict");
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
          >
            + {tab === "constituencies" ? t("admin.addConstituency")
               : tab === "services" ? t("admin.addService")
               : tab === "provinces" ? "Add Province"
               : "Add District"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b">
        {([
          { key: "constituencies", label: t("admin.constituencies"), count: constituencies.length },
          { key: "services", label: t("admin.services"), count: services.length },
          { key: "reports", label: t("admin.reports"), count: reports.length },
          { key: "provinces", label: t("admin.provinces"), count: provinces.length },
          { key: "districts", label: t("admin.districts"), count: districts.length },
        ] as { key: Tab; label: string; count: number }[]).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
              tab === key ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {tab === "constituencies" && (
        <ConstituencyList
          constituencies={constituencies}
          provinces={provinces}
          districts={districts}
          onEdit={openEditConstituency}
          onDelete={deleteConstituency}
        />
      )}

      {tab === "services" && (
        <ServiceList
          services={services}
          constituencies={constituencies}
          provinces={provinces}
          districts={districts}
          onEdit={openEditService}
          onDelete={deleteService}
        />
      )}

      {tab === "reports" && (
        <ReportList
          reports={reports}
          constituencies={constituencies}
          provinces={provinces}
          districts={districts}
          onModerate={moderateReport}
          onDelete={deleteReport}
        />
      )}

      {tab === "provinces" && (
        <ProvinceList provinces={provinces} onEdit={openEditProvince} onDelete={deleteProvince} />
      )}

      {tab === "districts" && (
        <DistrictList districts={districts} provinces={provinces} onEdit={openEditDistrict} onDelete={deleteDistrict} />
      )}

      {(modal === "addProvince" || modal === "editProvince") && (
        <ProvinceModal
          initialData={editingProvince ? { name: editingProvince.name, nameNp: editingProvince.nameNp } : undefined}
          onSubmit={submitProvince}
          onClose={closeModal}
        />
      )}

      {(modal === "addDistrict" || modal === "editDistrict") && (
        <DistrictModal
          provinces={provinces}
          initialData={editingDistrict ? { name: editingDistrict.name, nameNp: editingDistrict.nameNp, provinceId: editingDistrict.provinceId } : undefined}
          onSubmit={submitDistrict}
          onClose={closeModal}
        />
      )}

      {(modal === "addConstituency" || modal === "editConstituency") && (
        <AddConstituencyModal
          provinces={provinces}
          districts={districts}
          initialData={
            editingConstituency
              ? {
                  name: editingConstituency.name,
                  nameNp: editingConstituency.nameNp,
                  districtId: editingConstituency.districtId ?? "",
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
