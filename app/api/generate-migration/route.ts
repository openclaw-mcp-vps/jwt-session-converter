import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_COOKIE_NAME, hasValidAccessCookie } from "@/lib/access";
import { generateSessionMigrationBundle } from "@/lib/session-generator";
import type { AnalysisReport } from "@/lib/types";

export const runtime = "nodejs";

function isAnalysisReport(value: unknown): value is AnalysisReport {
  if (!value || typeof value !== "object") {
    return false;
  }

  const report = value as AnalysisReport;
  return Array.isArray(report.findings) && Array.isArray(report.migrationPlan) && typeof report.archiveName === "string";
}

export async function POST(request: NextRequest) {
  const hasAccess = hasValidAccessCookie(request.cookies.get(ACCESS_COOKIE_NAME)?.value);
  if (!hasAccess) {
    return NextResponse.json({ error: "Payment required to generate migration code." }, { status: 402 });
  }

  const body = (await request.json().catch(() => null)) as { analysis?: AnalysisReport } | null;
  const analysis = body?.analysis;

  if (!analysis || !isAnalysisReport(analysis)) {
    return NextResponse.json({ error: "Invalid analysis payload." }, { status: 400 });
  }

  const bundle = generateSessionMigrationBundle(analysis);
  return NextResponse.json(bundle);
}
