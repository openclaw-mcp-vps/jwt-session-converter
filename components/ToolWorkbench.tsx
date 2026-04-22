"use client";

import { useState } from "react";

import { AnalysisResults } from "@/components/AnalysisResults";
import { FileUploader } from "@/components/FileUploader";
import { MigrationCode } from "@/components/MigrationCode";
import type { AnalysisReport, MigrationBundle } from "@/lib/types";

export function ToolWorkbench() {
  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);
  const [bundle, setBundle] = useState<MigrationBundle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerateMigration() {
    if (!analysis) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-migration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ analysis })
      });

      const body = (await response.json()) as MigrationBundle & { error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? "Could not generate migration files.");
      }

      setBundle(body);
    } catch (generateError) {
      const message = generateError instanceof Error ? generateError.message : "Could not generate migration files.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-8">
      <FileUploader
        onAnalysisComplete={(report) => {
          setAnalysis(report);
          setBundle(null);
          setError(null);
        }}
      />

      {analysis ? (
        <AnalysisResults report={analysis} isGenerating={isGenerating} onGenerateMigration={handleGenerateMigration} />
      ) : null}

      {error ? <p className="rounded-md border border-[#6e2b2f] bg-[#2a1417] px-4 py-3 text-sm text-[#f8b8b4]">{error}</p> : null}

      {bundle ? <MigrationCode bundle={bundle} /> : null}
    </div>
  );
}
