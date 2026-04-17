"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

type PricingCardProps = {
  email?: string;
  isAuthenticated: boolean;
};

declare global {
  interface Window {
    LemonSqueezy?: {
      Url?: {
        Open: (url: string) => void;
      };
    };
  }
}

export function PricingCard({ email, isAuthenticated }: PricingCardProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setError(null);
    if (!isAuthenticated || !email) {
      setError("Sign in first so your purchase can be linked to your dashboard.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Failed to initialize checkout.");
      }

      const data = (await res.json()) as { checkoutUrl: string };
      if (window.LemonSqueezy?.Url?.Open) {
        window.LemonSqueezy.Url.Open(data.checkoutUrl);
      } else {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#0f1722] p-6 shadow-[0_0_0_1px_rgba(88,166,255,0.1)]">
      <div className="mb-4 flex items-center gap-2 text-[#58a6ff]">
        <ShieldCheck className="h-5 w-5" />
        <span className="text-sm font-semibold uppercase tracking-wide">Starter License</span>
      </div>
      <h3 className="text-2xl font-bold text-white">$19/month</h3>
      <p className="mt-2 text-sm text-[#9ba7b4]">
        Unlimited scans, migration templates for Express and Next.js, and security-check guidance to pass SOC2-focused
        reviews.
      </p>
      <ul className="mt-5 space-y-2 text-sm text-[#c9d1d9]">
        <li>Detects localStorage JWT anti-patterns</li>
        <li>Generates server session migration patch files</li>
        <li>Creates CSRF and cookie-hardening checklist</li>
        <li>Works across monorepos and mixed JS/TS services</li>
      </ul>
      <Button className="mt-6 w-full" size="lg" onClick={startCheckout} disabled={busy}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Start Secure Migration
      </Button>
      {error ? <p className="mt-3 text-xs text-[#ff7b72]">{error}</p> : null}
      {!isAuthenticated ? (
        <p className="mt-3 text-xs text-[#9ba7b4]">Authentication required to enable instant CLI download.</p>
      ) : null}
    </div>
  );
}
