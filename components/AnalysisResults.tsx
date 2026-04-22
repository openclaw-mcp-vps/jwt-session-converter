import type { AnalysisReport, FindingSeverity } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const severityLabel: Record<FindingSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low"
};

type AnalysisResultsProps = {
  report: AnalysisReport;
  isGenerating: boolean;
  onGenerateMigration: () => void;
};

function riskTone(score: number) {
  if (score >= 75) {
    return "critical" as const;
  }

  if (score >= 45) {
    return "high" as const;
  }

  return "medium" as const;
}

export function AnalysisResults({ report, isGenerating, onGenerateMigration }: AnalysisResultsProps) {
  const topFindings = report.findings.slice(0, 12);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-xl">
          <span>Security Analysis Results</span>
          <Badge variant={riskTone(report.summary.riskScore)}>{`Risk Score ${report.summary.riskScore}/100`}</Badge>
        </CardTitle>
        <CardDescription>{report.riskNarrative}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md border border-[#30435b] bg-[#0c192b] p-3">
            <p className="text-xs text-[#8ea3b8]">Files scanned</p>
            <p className="text-lg font-semibold">{report.summary.filesScanned}</p>
          </div>
          <div className="rounded-md border border-[#30435b] bg-[#0c192b] p-3">
            <p className="text-xs text-[#8ea3b8]">Token storage issues</p>
            <p className="text-lg font-semibold">{report.summary.localStorageTokenTouches}</p>
          </div>
          <div className="rounded-md border border-[#30435b] bg-[#0c192b] p-3">
            <p className="text-xs text-[#8ea3b8]">Bearer header flows</p>
            <p className="text-lg font-semibold">{report.summary.bearerHeaderTouches}</p>
          </div>
          <div className="rounded-md border border-[#30435b] bg-[#0c192b] p-3">
            <p className="text-xs text-[#8ea3b8]">JWT middleware</p>
            <p className="text-lg font-semibold">{report.summary.authMiddlewareTouches}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#90a7be]">Migration plan</h3>
          <ul className="space-y-2 text-sm text-[#cad7e3]">
            {report.migrationPlan.map((step) => (
              <li key={step} className="rounded-md border border-[#2b3648] bg-[#0e1725] px-3 py-2">
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#90a7be]">Top findings</h3>
          <div className="space-y-3">
            {topFindings.length === 0 ? (
              <p className="text-sm text-[#8ea3b8]">No high-confidence JWT findings detected in this archive.</p>
            ) : (
              topFindings.map((finding) => (
                <div key={finding.id} className="rounded-md border border-[#2b3648] bg-[#0e1725] p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={finding.severity}>{severityLabel[finding.severity]}</Badge>
                    <p className="text-sm font-semibold">{finding.title}</p>
                  </div>
                  <p className="mt-2 text-xs text-[#9fb0c2]">
                    {finding.filePath}:{finding.line}
                  </p>
                  <p className="mt-2 text-sm text-[#d3deea]">{finding.detail}</p>
                  <p className="mt-2 rounded border border-[#29415f] bg-[#0b1a2f] px-2 py-1 font-mono text-xs text-[#b9d7f2]">
                    {finding.snippet || "(No snippet captured)"}
                  </p>
                  <p className="mt-2 text-sm text-[#96d4a2]">Fix: {finding.recommendation}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <Separator />

        <Button onClick={onGenerateMigration} disabled={isGenerating} className="w-full">
          {isGenerating ? "Generating migration kit..." : "Generate Session Migration Code"}
        </Button>
      </CardContent>
    </Card>
  );
}
