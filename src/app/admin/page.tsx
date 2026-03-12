"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import AddConstituencyModal from "@/components/admin/AddConstituencyModal";
import AddServiceModal from "@/components/admin/AddServiceModal";
import ProvinceModal from "@/components/admin/ProvinceModal";
import DistrictModal from "@/components/admin/DistrictModal";
import ServiceTypeModal from "@/components/admin/ServiceTypeModal";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMainContent from "@/components/admin/AdminMainContent";
import type { Tab, SidebarNav, Constituency, Service, Report, Province, District, ConstituencyFormData, ServiceFormData, ServiceTypeConfig, ServiceRequest } from "@/components/admin/types";
type Modal =
  | "addConstituency" | "editConstituency"
  | "addService" | "editService"
  | "approveServiceRequest"
  | "addServiceType" | "editServiceType"
  | "addProvince" | "editProvince"
  | "addDistrict" | "editDistrict"
  | null;

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarNav, setSidebarNav] = useState<SidebarNav>("manage");
  const [tab, setTab] = useState<Tab>("constituencies");
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [serviceRequestStatus, setServiceRequestStatus] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Modal>(null);
  const [editingConstituency, setEditingConstituency] = useState<Constituency | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingServiceType, setEditingServiceType] = useState<ServiceTypeConfig | null>(null);
  const [editingProvince, setEditingProvince] = useState<Province | null>(null);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [approvingRequest, setApprovingRequest] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session && session.user.role !== "admin") router.push("/");
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user.role === "admin") loadAll();
  }, [session?.user.role]);

  const loadAll = async () => {
    setLoading(true);
    const [c, s, sr, r, p, d, st] = await Promise.all([
      fetch("/api/constituencies").then((x) => x.json()),
      fetch("/api/services").then((x) => x.json()),
      fetch("/api/service-requests").then((x) => x.json()),
      fetch("/api/reports").then((x) => x.json()),
      fetch("/api/provinces").then((x) => x.json()),
      fetch("/api/districts").then((x) => x.json()),
      fetch("/api/service-types").then((x) => x.json()),
    ]);
    setConstituencies(c);
    setServices(s);
    setServiceRequests(sr);
    setReports(r);
    setProvinces(p);
    setDistricts(d);
    setServiceTypes(st);
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

  const rejectServiceRequest = async (id: string) => {
    if (!confirm(t("admin.confirmRejectServiceRequest"))) return;
    const res = await fetch(`/api/service-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    });
    if (!res.ok) {
      alert(t("admin.failedUpdateServiceRequest"));
      return;
    }
    loadAll();
  };

  const deleteServiceRequest = async (id: string) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    await fetch(`/api/service-requests/${id}`, { method: "DELETE" });
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

  const submitApprovedServiceRequest = async (form: ServiceFormData) => {
    if (!approvingRequest) return;

    const res = await fetch(`/api/service-requests/${approvingRequest.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approve",
        ...form,
      }),
    });

    if (!res.ok) {
      alert(t("admin.failedUpdateServiceRequest"));
      return;
    }

    setModal(null);
    setApprovingRequest(null);
    loadAll();
  };

  const openEditConstituency = (c: Constituency) => { setEditingConstituency(c); setModal("editConstituency"); };
  const openEditService = (s: Service) => { setEditingService(s); setModal("editService"); };
  const openEditServiceType = (st: ServiceTypeConfig) => { setEditingServiceType(st); setModal("editServiceType"); };
  const openApproveServiceRequest = (r: ServiceRequest) => { setApprovingRequest(r); setModal("approveServiceRequest"); };
  const openEditProvince = (p: Province) => { setEditingProvince(p); setModal("editProvince"); };
  const openEditDistrict = (d: District) => { setEditingDistrict(d); setModal("editDistrict"); };

  const handleAdd = () => {
    if (tab === "constituencies") setModal("addConstituency");
    else if (tab === "services") setModal("addService");
    else if (tab === "serviceTypes") setModal("addServiceType");
    else if (tab === "provinces") setModal("addProvince");
    else if (tab === "districts") setModal("addDistrict");
  };

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

  const submitServiceType = async (form: { slug: string; name: string; nameNp: string; icon: string }) => {
    const url = editingServiceType
      ? `/api/service-types/${editingServiceType.id}`
      : "/api/service-types";
    const res = await fetch(url, {
      method: editingServiceType ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || t("admin.failedSaveServiceType"));
      return;
    }

    setModal(null);
    setEditingServiceType(null);
    loadAll();
  };

  const deleteServiceType = async (id: string) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    const res = await fetch(`/api/service-types/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || t("admin.failedDeleteServiceType"));
      return;
    }
    loadAll();
  };

  const closeModal = () => {
    setModal(null);
    setEditingConstituency(null);
    setEditingService(null);
    setEditingServiceType(null);
    setEditingProvince(null);
    setEditingDistrict(null);
    setApprovingRequest(null);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 animate-pulse">
        {/* Sidebar skeleton */}
        <div className="w-56 border-r dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
          <div className="space-y-2">
            <div className="h-10 rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="ml-2 space-y-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-6 rounded bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
            <div className="h-10 rounded-lg bg-gray-200 dark:bg-gray-800 mt-4" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 px-4 py-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="h-8 w-52 rounded-lg bg-orange-100 dark:bg-orange-950/40" />
              <div className="h-10 w-28 rounded-lg bg-orange-100 dark:bg-orange-950/40" />
            </div>

            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-72 rounded bg-gray-100 dark:bg-gray-700/70" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav={sidebarNav}
        onNavChange={setSidebarNav}
        activeTab={tab}
        onTabChange={setTab}
        counts={{
          constituencies: constituencies.length,
          services: services.length,
          serviceRequests: serviceRequests.length,
          serviceTypes: serviceTypes.length,
          reports: reports.length,
          provinces: provinces.length,
          districts: districts.length,
        }}
      />

      <AdminMainContent
        sidebarNav={sidebarNav}
        tab={tab}
        constituencies={constituencies}
        services={services}
        reports={reports}
        serviceRequests={serviceRequests}
        serviceRequestStatus={serviceRequestStatus}
        onServiceRequestStatusChange={setServiceRequestStatus}
        provinces={provinces}
        districts={districts}
        serviceTypes={serviceTypes}
        onAdd={handleAdd}
        onEditConstituency={openEditConstituency}
        onDeleteConstituency={deleteConstituency}
        onEditService={openEditService}
        onDeleteService={deleteService}
        onEditServiceType={openEditServiceType}
        onDeleteServiceType={deleteServiceType}
        onApproveServiceRequest={openApproveServiceRequest}
        onRejectServiceRequest={rejectServiceRequest}
        onDeleteServiceRequest={deleteServiceRequest}
        onModerateReport={moderateReport}
        onDeleteReport={deleteReport}
        onEditProvince={openEditProvince}
        onDeleteProvince={deleteProvince}
        onEditDistrict={openEditDistrict}
        onDeleteDistrict={deleteDistrict}
      />

      {/* Modals */}
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

      {(modal === "addServiceType" || modal === "editServiceType") && (
        <ServiceTypeModal
          initialData={
            editingServiceType
              ? {
                  slug: editingServiceType.slug,
                  name: editingServiceType.name,
                  nameNp: editingServiceType.nameNp,
                  icon: editingServiceType.icon,
                }
              : undefined
          }
          onSubmit={submitServiceType}
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
          serviceTypes={serviceTypes}
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

      {modal === "approveServiceRequest" && approvingRequest && (
        <AddServiceModal
          constituencies={constituencies}
          serviceTypes={serviceTypes}
          initialData={{
            name: approvingRequest.name,
            nameNp: approvingRequest.name,
            type: "other",
            location: "",
            description: approvingRequest.description ?? "",
            descriptionNp: "",
            constituencyId: approvingRequest.constituencyId,
          }}
          onSubmit={submitApprovedServiceRequest}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
