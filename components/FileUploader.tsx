"use client";

import { useMemo, useState } from "react";

import type { AnalysisReport } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FileUploaderProps = {
  onAnalysisComplete: (report: AnalysisReport) => void;
};

export function FileUploader({ onAnalysisComplete }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileLabel = useMemo(() => {
    if (!file) {
      return "Drop a .zip of your app (frontend + backend folders).";
    }

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return `${file.name} (${sizeMb} MB)`;
  }, [file]);

  async function handleAnalyze() {
    if (!file) {
      setError("Select a .zip file before running analysis.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("archive", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Analysis failed.");
      }

      const report = (await response.json()) as AnalysisReport;
      onAnalysisComplete(report);
    } catch (analyzeError) {
      const message = analyzeError instanceof Error ? analyzeError.message : "Analysis failed.";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Upload Your Codebase</CardTitle>
        <CardDescription>
          The scanner inspects authentication flows, JWT usage, and token persistence patterns to map migration risk.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#35506d] bg-[#0b1828] px-4 py-8 text-center transition hover:border-[#4cc9f0] hover:bg-[#0f1f33]">
          <span className="text-sm text-[#9fb0c2]">{fileLabel}</span>
          <span className="mt-2 text-xs text-[#7f93a8]">Accepted format: single .zip file up to 25MB.</span>
          <input
            type="file"
            accept=".zip"
            className="hidden"
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              setFile(selected);
              setError(null);
            }}
          />
        </label>
        {error ? <p className="text-sm text-[#f5a3a0]">{error}</p> : null}
        <Button onClick={handleAnalyze} disabled={!file || isAnalyzing} className="w-full">
          {isAnalyzing ? "Analyzing JWT usage..." : "Run Security Migration Analysis"}
        </Button>
      </CardContent>
    </Card>
  );
}
