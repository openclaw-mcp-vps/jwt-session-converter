"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DownloadButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDownload = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/download", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Download failed.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "jwt-session-converter-cli.js";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Button onClick={onDownload} disabled={busy}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        Download CLI
      </Button>
      {error ? <p className="mt-2 text-xs text-[#ff7b72]">{error}</p> : null}
    </div>
  );
}
