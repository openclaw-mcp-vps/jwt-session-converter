export type FindingSeverity = "critical" | "high" | "medium" | "low";

export interface AnalysisFinding {
  id: string;
  severity: FindingSeverity;
  title: string;
  detail: string;
  filePath: string;
  line: number;
  snippet: string;
  recommendation: string;
}

export interface AnalysisSummary {
  filesScanned: number;
  jwtLibraryTouches: number;
  localStorageTokenTouches: number;
  bearerHeaderTouches: number;
  authMiddlewareTouches: number;
  riskScore: number;
}

export interface AnalysisReport {
  archiveName: string;
  generatedAt: string;
  summary: AnalysisSummary;
  findings: AnalysisFinding[];
  riskNarrative: string;
  migrationPlan: string[];
  quickWins: string[];
}

export interface MigrationFile {
  path: string;
  content: string;
  rationale: string;
}

export interface MigrationBundle {
  generatedAt: string;
  archiveName: string;
  files: MigrationFile[];
  installCommand: string;
  rolloutChecklist: string[];
}

export interface PurchaseRecord {
  email: string;
  purchasedAt: string;
  source: "stripe";
  eventType: string;
  checkoutSessionId?: string;
  amountTotal?: number;
  currency?: string;
}
