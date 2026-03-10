"use client";

import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import ReportForm from "./ReportForm";
import { ChevronLeft } from "lucide-react";

interface Constituency {
  id: string;
  name: string;
  nameNp: string;
  province: string | null;
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
}

export default function ReportModal({ onClose }: ReportModalProps) {
  const { t, locale } = useI18n();

  // Step: "constituency" | "service" | "report"
  const [step, setStep] = useState<"constituency" | "service" | "report">("constituency");

  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [constSearch, setConstSearch] = useState("");
  const [selectedConstituency, setSelectedConstituency] = useState<Constituency | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/constituencies")
      .then((r) => r.json())
      .then(setConstituencies)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (step === "constituency") {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [step]);

  const filteredConsts = constituencies.filter((c) =>
    c.name.toLowerCase().includes(constSearch.toLowerCase()) ||
    c.nameNp.includes(constSearch)
  );

  function selectConstituency(c: Constituency) {
    setSelectedConstituency(c);
    setServicesLoading(true);
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
    } else if (step === "report") {
      setStep("service");
      setSelectedService(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-50 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90dvh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b bg-white rounded-t-3xl sm:rounded-t-3xl flex-shrink-0">
          <div className="flex items-center gap-2">
            {step !== "constituency" && (
              <button
                onClick={goBack}
                className="p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors mr-1"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-base font-extrabold text-gray-900">
                {step === "constituency" && "Select Constituency"}
                {step === "service" && (locale === "np" ? selectedConstituency?.nameNp : selectedConstituency?.name)}
                {step === "report" && (locale === "np" ? selectedService?.nameNp : selectedService?.name)}
              </h2>
              <p className="text-xs text-gray-400">
                {step === "constituency" && "Where did you use the service?"}
                {step === "service" && "Which service did you use?"}
                {step === "report" && "Share your experience"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 px-5 py-2.5 flex-shrink-0 bg-white border-b">
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
              {/* Sticky search */}
              <div className="sticky top-0 bg-gray-50 px-4 pt-4 pb-2 z-10">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    ref={searchRef}
                    value={constSearch}
                    onChange={(e) => setConstSearch(e.target.value)}
                    placeholder={t("home.searchPlaceholder")}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>
              <div className="space-y-1.5 px-4 pb-4">
                {filteredConsts.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 text-sm">No results</p>
                ) : (
                  filteredConsts.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => selectConstituency(c)}
                      className="w-full text-left px-4 py-3 bg-white rounded-xl border hover:border-orange-400 hover:bg-orange-50 transition-all"
                    >
                      <p className="font-semibold text-gray-900 text-sm">{locale === "np" ? c.nameNp : c.name}</p>
                      {c.province && <p className="text-xs text-gray-400 mt-0.5">{c.province}</p>}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {step === "service" && (
            <div className="space-y-1.5 p-4">
              {servicesLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                ))
              ) : services.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">🏗️</p>
                  <p>No services listed yet for this constituency.</p>
                </div>
              ) : (
                services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectService(s)}
                    className="w-full text-left px-4 py-3 bg-white rounded-xl border hover:border-orange-400 hover:bg-orange-50 transition-all"
                  >
                    <p className="font-semibold text-gray-900 text-sm">{locale === "np" ? s.nameNp : s.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t(`service.type.${s.type}`)}</p>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Step 3: Report form */}
          {step === "report" && selectedService && (
            <div className="p-4">
              <ReportForm
                serviceId={selectedService.id}
                constituencyId={selectedService.constituencyId}
                onSuccess={onClose}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
