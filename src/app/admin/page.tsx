"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

interface Constituency {
  id: string;
  name: string;
  nameNp: string;
  province?: string;
  _count?: { services: number; reports: number };
}

interface Service {
  id: string;
  name: string;
  nameNp: string;
  type: string;
  location?: string;
  constituencyId: string;
  constituency?: { name: string };
  reportCount?: number;
}

interface Report {
  id: string;
  serviceTimeMinutes: number;
  rating: number;
  comment?: string;
  isHidden: boolean;
  isModerated: boolean;
  createdAt: string;
  publicService?: { name: string };
  user?: { name: string } | null;
}

type Tab = "constituencies" | "services" | "reports";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("constituencies");
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | "addConstituency" | "addService">(null);

  // Form state
  const [cForm, setCForm] = useState({ name: "", nameNp: "", province: "", imageUrl: "", description: "" });
  const [sForm, setSForm] = useState({ name: "", nameNp: "", type: "other", location: "", description: "", descriptionNp: "", constituencyId: "" });

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

  const submitConstituency = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/constituencies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cForm),
    });
    setCForm({ name: "", nameNp: "", province: "", imageUrl: "", description: "" });
    setModal(null);
    loadAll();
  };

  const submitService = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sForm),
    });
    setSForm({ name: "", nameNp: "", type: "other", location: "", description: "", descriptionNp: "", constituencyId: "" });
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
        <button
          onClick={() => setModal(tab === "constituencies" ? "addConstituency" : "addService")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
        >
          + {tab === "constituencies" ? t("admin.addConstituency") : t("admin.addService")}
        </button>
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

      {/* Constituencies Tab */}
      {tab === "constituencies" && (
        <div className="space-y-2">
          {constituencies.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">{c.name} / {c.nameNp}</p>
                <p className="text-xs text-gray-500">{c.province} · {c._count?.services ?? 0} services · {c._count?.reports ?? 0} reports</p>
              </div>
              <button
                onClick={() => deleteConstituency(c.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                {t("admin.delete")}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Services Tab */}
      {tab === "services" && (
        <div className="space-y-2">
          {services.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">{s.name} / {s.nameNp}</p>
                <p className="text-xs text-gray-500">
                  {t(`service.type.${s.type}`)} · {s.location} · {s.constituency?.name}
                </p>
              </div>
              <button
                onClick={() => deleteService(s.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                {t("admin.delete")}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Reports Tab */}
      {tab === "reports" && (
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.id} className={`bg-white rounded-xl border p-4 ${r.isHidden ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {r.publicService?.name} · ⭐{r.rating} · {r.serviceTimeMinutes}min
                  </p>
                  {r.comment && <p className="text-gray-600 text-sm mt-0.5">"{r.comment}"</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {r.user?.name ?? "Anonymous"} · {new Date(r.createdAt).toLocaleDateString()}
                    {r.isHidden && " · [Hidden]"}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => moderateReport(r.id, !r.isHidden)}
                    className={`text-xs font-medium px-2 py-1 rounded border ${
                      r.isHidden ? "text-green-600 border-green-300 hover:bg-green-50" : "text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                    }`}
                  >
                    {r.isHidden ? t("admin.approve") : t("admin.hide")}
                  </button>
                  <button
                    onClick={() => deleteReport(r.id)}
                    className="text-xs font-medium px-2 py-1 rounded border text-red-600 border-red-300 hover:bg-red-50"
                  >
                    {t("admin.delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Constituency */}
      {modal === "addConstituency" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{t("admin.addConstituency")}</h2>
            <form onSubmit={submitConstituency} className="space-y-3">
              {[
                { label: "Name (English)", value: cForm.name, key: "name" },
                { label: "Name (Nepali)", value: cForm.nameNp, key: "nameNp" },
                { label: "Province", value: cForm.province, key: "province" },
                { label: "Image URL", value: cForm.imageUrl, key: "imageUrl" },
                { label: "Description", value: cForm.description, key: "description" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-gray-700">{field.label}</label>
                  <input
                    value={field.value}
                    onChange={(e) => setCForm({ ...cForm, [field.key]: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-orange-500 text-white rounded-lg py-2 font-semibold text-sm">{t("admin.save")}</button>
                <button type="button" onClick={() => setModal(null)} className="flex-1 border rounded-lg py-2 text-sm">{t("admin.cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Service */}
      {modal === "addService" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{t("admin.addService")}</h2>
            <form onSubmit={submitService} className="space-y-3">
              {[
                { label: "Name (English)", value: sForm.name, key: "name" },
                { label: "Name (Nepali)", value: sForm.nameNp, key: "nameNp" },
                { label: "Location", value: sForm.location, key: "location" },
                { label: "Description (English)", value: sForm.description, key: "description" },
                { label: "Description (Nepali)", value: sForm.descriptionNp, key: "descriptionNp" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-gray-700">{field.label}</label>
                  <input
                    value={field.value}
                    onChange={(e) => setSForm({ ...sForm, [field.key]: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  value={sForm.type}
                  onChange={(e) => setSForm({ ...sForm, type: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {["hospital","government_office","transport","education","utility","police","bank","other"].map((t_) => (
                    <option key={t_} value={t_}>{t_}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Constituency</label>
                <select
                  value={sForm.constituencyId}
                  onChange={(e) => setSForm({ ...sForm, constituencyId: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                >
                  <option value="">Select constituency...</option>
                  {constituencies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-orange-500 text-white rounded-lg py-2 font-semibold text-sm">{t("admin.save")}</button>
                <button type="button" onClick={() => setModal(null)} className="flex-1 border rounded-lg py-2 text-sm">{t("admin.cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
