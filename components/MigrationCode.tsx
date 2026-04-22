"use client";

import { useMemo, useState } from "react";
import JSZip from "jszip";

import type { MigrationBundle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type MigrationCodeProps = {
  bundle: MigrationBundle;
};

export function MigrationCode({ bundle }: MigrationCodeProps) {
  const [activePath, setActivePath] = useState(bundle.files[0]?.path ?? "");
  const [isDownloading, setIsDownloading] = useState(false);

  const activeFile = useMemo(
    () => bundle.files.find((file) => file.path === activePath) ?? bundle.files[0],
    [bundle.files, activePath]
  );

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      for (const file of bundle.files) {
        zip.file(file.path, file.content);
      }

      zip.file(
        "ROLL_OUT_CHECKLIST.md",
        bundle.rolloutChecklist.map((line, index) => `${index + 1}. ${line}`).join("\n")
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `jwt-session-migration-${new Date().toISOString().slice(0, 10)}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Generated Migration Code</CardTitle>
        <CardDescription>
          This package includes production-focused session middleware, CSRF checks, auth routes, and a file-by-file cleanup plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-[#2b3648] bg-[#0e1725] p-3 text-sm text-[#d4deea]">
          <p className="font-semibold text-[#97e2ff]">Install command</p>
          <p className="mt-1 font-mono text-xs">{bundle.installCommand}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-[260px_1fr]">
          <div className="space-y-2">
            {bundle.files.map((file) => (
              <button
                type="button"
                key={file.path}
                onClick={() => setActivePath(file.path)}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                  activeFile?.path === file.path
                    ? "border-[#4cc9f0] bg-[#133455] text-[#e6f4ff]"
                    : "border-[#2b3648] bg-[#0d1623] text-[#9fb0c2] hover:border-[#35506d]"
                }`}
              >
                <p className="font-medium">{file.path}</p>
                <p className="mt-1 text-xs text-[#7f93a8]">{file.rationale}</p>
              </button>
            ))}
          </div>

          <div className="rounded-md border border-[#2b3648] bg-[#0d1623] p-3">
            <p className="mb-2 text-sm font-semibold text-[#97e2ff]">{activeFile?.path}</p>
            <pre className="max-h-[460px] overflow-auto whitespace-pre-wrap rounded border border-[#22344a] bg-[#07111d] p-3 text-xs text-[#d0d9e4]">
              {activeFile?.content}
            </pre>
          </div>
        </div>

        <Button onClick={handleDownload} disabled={isDownloading} className="w-full">
          {isDownloading ? "Preparing download..." : "Download Migration Kit (.zip)"}
        </Button>
      </CardContent>
    </Card>
  );
}
