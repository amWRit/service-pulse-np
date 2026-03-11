"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function VerifyCodeContent() {
  const params = useSearchParams();
  const id = params.get("c");

  const [otp, setOtp] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState(0);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!id) { setError("Invalid link — missing challenge ID."); setFetched(true); return; }
    fetch(`/api/challenge/peek?c=${id}`)
      .then((r) => r.json())
      .then((d) => {
        setFetched(true);
        if (d.otp) {
          setOtp(d.otp);
          setExpiresIn(d.expiresIn);
        } else {
          setError("This code has already been used or has expired. Go back and click Refresh.");
        }
      })
      .catch(() => { setFetched(true); setError("Network error. Please try again."); });
  }, [id]);

  // Tick down the countdown
  useEffect(() => {
    if (!otp || expiresIn <= 0) return;
    const t = setInterval(() => setExpiresIn((s) => Math.max(0, s - 1)), 1_000);
    return () => clearInterval(t);
  }, [otp, expiresIn]);

  if (!fetched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 bg-gray-50">
        <span className="text-4xl">❌</span>
        <p className="text-gray-700 font-semibold text-center max-w-xs">{error}</p>
        <button
          onClick={() => window.close()}
          className="mt-2 px-6 py-2 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 bg-gray-50">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-extrabold text-gray-800">Your verification code</h1>
        <p className="text-sm text-gray-500">Enter this in the report form</p>
      </div>

      {/* Big code display */}
      <div className="bg-white border-2 border-orange-400 rounded-2xl px-12 py-8 shadow-sm text-center">
        <p className="text-6xl font-mono font-extrabold text-orange-600 tracking-[0.15em]">
          {otp}
        </p>
      </div>

      {/* Timer */}
      <div className={`text-sm font-semibold ${expiresIn > 10 ? "text-gray-500" : "text-red-500"}`}>
        {expiresIn > 0 ? `Expires in ${expiresIn}s` : "⚠️ Expired — go back and click Refresh"}
      </div>

      <p className="text-xs text-gray-400 text-center max-w-xs">
        Type this code into the input box on the previous page, then click <strong>Verify &amp; Continue</strong>.
      </p>

      <button
        onClick={() => window.close()}
        className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors text-sm"
      >
        Done — close this tab
      </button>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense>
      <VerifyCodeContent />
    </Suspense>
  );
}
