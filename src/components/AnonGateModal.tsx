"use client";

import { useEffect, useState, useCallback } from "react";
import { X, ExternalLink, RefreshCw } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface AnonGateModalProps {
  onVerified: (challengeToken: string) => void;
  onClose: () => void;
}

export default function AnonGateModal({ onVerified, onClose }: AnonGateModalProps) {
  const { t } = useI18n();
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [viewUrl, setViewUrl]         = useState<string | null>(null);
  const [expiresAt, setExpiresAt]     = useState(0);
  const [countdown, setCountdown]     = useState(0);
  const [creating, setCreating]       = useState(false);
  const [code, setCode]               = useState("");
  const [verifying, setVerifying]     = useState(false);
  const [error, setError]             = useState("");

  // ── Create challenge ────────────────────────────────────────────────────────
  const createChallenge = useCallback(async () => {
    setCreating(true);
    setError("");
    setCode("");
    try {
      const res  = await fetch("/api/challenge/create", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? t("anonGate.errorCreate")); return; }
      setChallengeId(data.challengeId);
      setViewUrl(data.viewUrl);
      setExpiresAt(data.expiresAt);
      setCountdown(Math.ceil((data.expiresAt - Date.now()) / 1_000));
    } catch {
      setError(t("anonGate.errorNetwork"));
    } finally {
      setCreating(false);
    }
  }, [t]);

  useEffect(() => { createChallenge(); }, [createChallenge]);

  // ── Countdown ticker ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => {
      setCountdown(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1_000)));
    }, 1_000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  // ── Verify submitted code ──────────────────────────────────────────────────
  const handleVerify = async () => {
    if (!challengeId || code.length < 6) return;
    setVerifying(true);
    setError("");
    try {
      const res  = await fetch("/api/challenge/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? t("anonGate.errorVerify")); return; }
      onVerified(data.challengeToken);
    } catch {
      setError(t("anonGate.errorNetwork"));
    } finally {
      setVerifying(false);
    }
  };

  const isExpired = expiresAt > 0 && countdown === 0;
  const qrUrl     = viewUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(viewUrl)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative space-y-4">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Heading */}
        <div className="text-center space-y-1 pr-6">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">{t("anonGate.heading")}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("anonGate.subtitle")}
          </p>
        </div>

        {creating ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : viewUrl ? (
          <>
            {/* QR — desktop only bonus (hidden on mobile since they can just tap the link) */}
            {qrUrl && (
              <div className="hidden md:flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt={t("anonGate.qrAlt")}
                  width={160}
                  height={160}
                  className="rounded-xl border border-gray-200 dark:border-gray-600"
                />
              </div>
            )}

            {/* Open link button */}
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold py-3 rounded-xl transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              {t("anonGate.openLink")}
            </a>

            {/* Timer + refresh */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              {isExpired ? (
                <span className="text-red-500 font-semibold">{t("anonGate.codeExpired")}</span>
              ) : (
                <span>
                  {t("anonGate.validFor")}{" "}
                  <span className="font-bold text-orange-500">{countdown}{t("anonGate.seconds")}</span>
                </span>
              )}
              <button
                type="button"
                onClick={createChallenge}
                disabled={creating}
                className="flex items-center gap-1 hover:text-orange-500 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" /> {t("anonGate.refresh")}
              </button>
            </div>

            {/* Code input + verify */}
            {!isExpired && (
              <div className="space-y-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder={t("anonGate.placeholder")}
                  className="w-full border dark:border-gray-600 rounded-xl px-4 py-3 text-center text-2xl font-mono font-bold tracking-[0.2em] text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:placeholder-gray-500"
                />
                <button
                  onClick={handleVerify}
                  disabled={verifying || code.length < 6}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {verifying ? t("anonGate.verifying") : t("anonGate.verify")}
                </button>
              </div>
            )}
          </>
        ) : null}

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          {t("anonGate.haveAccount")}{" "}
          <a href="/login" className="underline text-orange-500">{t("anonGate.signIn")}</a>
          {" "}{t("anonGate.skipStep")}
        </p>
      </div>
    </div>
  );
}
