"use client";

import { useState, useEffect, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import ReportForm from "./ReportForm";
import { ChevronLeft } from "lucide-react";

interface Province {
  id: string;
  name: string;
  nameNp: string;
}

interface District {
  id: string;
  name: string;
  nameNp: string;
  provinceId: string;
}

interface Constituency {
  id: string;
  name: string;
  nameNp: string;
  province: string | null;
  provinceNp?: string | null;
  districtId?: string | null;
  district?: { id: string; name: string; nameNp: string; provinceId: string; province?: { id: string; name: string; nameNp: string } | null } | null;
}

interface Service {
  id: string;
  name: string;
  nameNp: string;
  type: string;
  constituencyId: string;
}

interface ReportModalProps {
  onClose: () => void;
  challengeToken?: string;
}

export default function ReportModal({ onClose, challengeToken }: ReportModalProps) {
  const { t, locale } = useI18n();

  const [step, setStep] = useState<"constituency" | "service" | "report">("constituency");

  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [selectedConstituency, setSelectedConstituency] = useState<Constituency | null>(null);

  // Province/district filter state (derived from constituency data)
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [showServiceRequestModal, setShowServiceRequestModal] = useState(false);
  const [serviceRequestName, setServiceRequestName] = useState("");
  const [serviceRequestDescription, setServiceRequestDescription] = useState("");
  const [serviceRequestSubmitting, setServiceRequestSubmitting] = useState(false);
  const [serviceRequestSubmitted, setServiceRequestSubmitted] = useState(false);

useEffect(() => {
    fetch("/api/constituencies")
      .then((r) => r.json())
      .then((data: Constituency[]) => {
        setConstituencies(data);

        // Derive unique provinces from constituency data
        const provMap = new Map<string, Province>();
        data.forEach((c) => {
          if (c.district?.province) {
            const p = c.district.province;
            if (!provMap.has(p.id)) provMap.set(p.id, p);
          }
        });
        setProvinces(Array.from(provMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Fetch all districts from API so districts without constituencies still appear
    fetch("/api/districts")
      .then((r) => r.json())
      .then((data: District[]) => setDistricts(data))
      .catch(() => {});
  }, []);

// Filtered districts based on selected province
  const visibleDistricts = useMemo(() =>
    selectedProvinceId ? districts.filter((d) => d.provinceId === selectedProvinceId) : districts,
    [districts, selectedProvinceId]
  );

  // Filtered constituencies based on province and district
  const filteredConsts = useMemo(() => constituencies.filter((c) => {
    if (selectedProvinceId && c.district?.province?.id !== selectedProvinceId) return false;
    if (selectedDistrictId && c.district?.id !== selectedDistrictId) return false;
    return true;
  }), [constituencies, selectedProvinceId, selectedDistrictId]);

  // Unique service types for type filter
  const serviceTypes = useMemo(() =>
    ["all", ...Array.from(new Set(services.map((s) => s.type)))],
    [services]
  );

  // Filtered services by type
  const filteredServices = useMemo(() =>
    serviceTypeFilter === "all" ? services : services.filter((s) => s.type === serviceTypeFilter),
    [services, serviceTypeFilter]
  );

  function selectConstituency(c: Constituency) {
    setSelectedConstituency(c);
    setServicesLoading(true);
    setServiceTypeFilter("all");
    setServiceRequestSubmitted(false);
    setStep("service");
    fetch(`/api/services?constituencyId=${c.id}`)
      .then((r) => r.json())
      .then((data) => { setServices(data); setServicesLoading(false); })
      .catch(() => setServicesLoading(false));
  }

  function selectService(s: Service) {
    setSelectedService(s);
    setStep("report");
  }

  function goBack() {
    if (step === "service") {
      setStep("constituency");
      setServices([]);
      setSelectedConstituency(null);
      setServiceRequestSubmitted(false);
    } else if (step === "report") {
      setStep("service");
      setSelectedService(null);
    }
  }

  async function submitServiceRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedConstituency || !serviceRequestName.trim()) return;

    setServiceRequestSubmitting(true);

    try {
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: serviceRequestName.trim(),
          description: serviceRequestDescription.trim(),
          constituencyId: selectedConstituency.id,
        }),
      });

      if (!res.ok) throw new Error("failed");

      setShowServiceRequestModal(false);
      setServiceRequestName("");
      setServiceRequestDescription("");
      setServiceRequestSubmitted(true);
    } catch {
      alert(t("report.serviceRequestError"));
    } finally {
      setServiceRequestSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-50 dark:bg-gray-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90dvh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-t-3xl flex-shrink-0">
          <div className="flex items-center gap-2">
            {step !== "constituency" && (
              <button
                onClick={goBack}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-colors mr-1"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                {step === "constituency" && t("report.selectConstituency")}
                {step === "service" && (locale === "np" ? selectedConstituency?.nameNp : selectedConstituency?.name)}
                {step === "report" && (locale === "np" ? selectedService?.nameNp : selectedService?.name)}
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {step === "constituency" && t("report.whereQuestion")}
                {step === "service" && t("report.whichServiceQuestion")}
                {step === "report" && t("report.shareExperience")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 px-5 py-2.5 flex-shrink-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          {(["constituency", "service", "report"] as const).map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                step === s ? "bg-orange-500" :
                (step === "service" && i === 0) || (step === "report" && i <= 1) ? "bg-orange-200" :
                "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">

          {/* Step 1: Constituency */}
          {step === "constituency" && (
            <div className="flex flex-col">
              {/* Sticky filters */}
              <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-4 pt-4 pb-3 z-10 border-b dark:border-gray-700">
                <div className="flex gap-2">
                  {/* Province dropdown */}
                  <select
                    value={selectedProvinceId}
                    onChange={(e) => { setSelectedProvinceId(e.target.value); setSelectedDistrictId(""); }}
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl border dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">{t("admin.allProvinces")}</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {locale === "np" ? p.nameNp : p.name}
                      </option>
                    ))}
                  </select>
                  {/* District dropdown — disabled until a province is selected */}
                  <select
                    value={selectedDistrictId}
                    onChange={(e) => setSelectedDistrictId(e.target.value)}
                    disabled={!selectedProvinceId}
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl border dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="">{t("admin.allDistricts")}</option>
                    {visibleDistricts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {locale === "np" ? d.nameNp : d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 px-4 py-3 pb-4">
                {filteredConsts.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 text-sm">{t("report.noResults")}</p>
                ) : (
                  filteredConsts.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => selectConstituency(c)}
                      className="w-full text-left px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all"
                    >
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{locale === "np" ? c.nameNp : c.name}</p>
                      {c.district && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {locale === "np" ? c.district.province?.nameNp : c.district.province?.name}
                          {" · "}
                          {locale === "np" ? c.district.nameNp : c.district.name}
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {step === "service" && (
            <div className="flex flex-col">
              {/* Service type filter */}
              {!servicesLoading && serviceTypes.length > 1 && (
                <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-4 pt-3 pb-3 z-10 border-b dark:border-gray-700">
                  <select
                    value={serviceTypeFilter}
                    onChange={(e) => setServiceTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    {serviceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === "all" ? t("admin.allServices") : t(`service.type.${type}`)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-1.5 p-4">
                {servicesLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="h-14 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
                  ))
                ) : filteredServices.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    <p className="text-3xl mb-2">🏗️</p>
                    <p>{t("report.noServices")}</p>
                    <button
                      type="button"
                      onClick={() => setShowServiceRequestModal(true)}
                      className="mt-4 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors"
                    >
                      {t("report.requestService")}
                    </button>
                  </div>
                ) : (
                  filteredServices.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => selectService(s)}
                      className="w-full text-left px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all"
                    >
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{locale === "np" ? s.nameNp : s.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t(`service.type.${s.type}`)}</p>
                    </button>
                  ))
                )}

                {!servicesLoading && serviceRequestSubmitted && (
                  <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 px-4 py-3 text-sm text-green-800 dark:text-green-200">
                    {t("report.serviceRequestSubmitted")}
                  </div>
                )}

                {!servicesLoading && filteredServices.length > 0 && (
                  <div className="rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{t("report.serviceRequestPrompt")}</p>
                    <button
                      type="button"
                      onClick={() => setShowServiceRequestModal(true)}
                      className="mt-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                      {t("report.requestService")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Report form */}
          {step === "report" && selectedService && (
            <div className="p-4">
              <ReportForm
                serviceId={selectedService.id}
                constituencyId={selectedService.constituencyId}
                challengeToken={challengeToken}
                onSuccess={onClose}
              />
            </div>
          )}

        </div>

        {showServiceRequestModal && selectedConstituency && (
          <div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowServiceRequestModal(false); }}
          >
            <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border dark:border-gray-700 p-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{t("report.requestService")}</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                {t("report.serviceRequestModalHelp")}
              </p>

              <form onSubmit={submitServiceRequest} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t("report.serviceNameLabel")}</label>
                  <input
                    value={serviceRequestName}
                    onChange={(e) => setServiceRequestName(e.target.value)}
                    required
                    className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t("report.serviceDescriptionLabel")}</label>
                  <textarea
                    value={serviceRequestDescription}
                    onChange={(e) => setServiceRequestDescription(e.target.value)}
                    rows={3}
                    className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={serviceRequestSubmitting}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg py-2 font-semibold text-sm transition-colors"
                  >
                    {serviceRequestSubmitting ? t("report.submitting") : t("report.submitServiceRequest")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowServiceRequestModal(false)}
                    className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-lg py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t("report.cancelEdit")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
