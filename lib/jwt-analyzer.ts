import JSZip from "jszip";

import type { AnalysisFinding, AnalysisReport, AnalysisSummary, FindingSeverity } from "@/lib/types";

type Pattern = {
  id: string;
  regex: RegExp;
  severity: FindingSeverity;
  title: string;
  detail: string;
  recommendation: string;
  summaryKey:
    | "jwtLibraryTouches"
    | "localStorageTokenTouches"
    | "bearerHeaderTouches"
    | "authMiddlewareTouches";
};

const SCANNABLE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".json",
  ".env",
  ".yaml",
  ".yml"
]);

const PATTERNS: Pattern[] = [
  {
    id: "jwt-lib-usage",
    regex: /(?:import\s+.*from\s+["'`](?:jsonwebtoken|jose|jwt-decode)["'`])|(?:require\(["'`](?:jsonwebtoken|jose|jwt-decode)["'`]\))/g,
    severity: "medium",
    title: "JWT library usage detected",
    detail: "The code imports JWT tooling, which usually means token issuance or verification logic is spread across the codebase.",
    recommendation:
      "Centralize auth in session middleware and map each JWT usage to either session creation, session validation, or user lookup.",
    summaryKey: "jwtLibraryTouches"
  },
  {
    id: "localstorage-token",
    regex:
      /localStorage\.(?:setItem|getItem|removeItem)\(\s*["'`](?:accessToken|authToken|token|jwt|idToken|refreshToken)["'`]/g,
    severity: "critical",
    title: "Token persisted in localStorage",
    detail:
      "Tokens in localStorage are readable by injected scripts. This is the top reason JWT implementations fail XSS-focused security reviews.",
    recommendation:
      "Move auth state to an httpOnly secure session cookie and remove every client-side token read/write path.",
    summaryKey: "localStorageTokenTouches"
  },
  {
    id: "sessionstorage-token",
    regex:
      /sessionStorage\.(?:setItem|getItem|removeItem)\(\s*["'`](?:accessToken|authToken|token|jwt|idToken|refreshToken)["'`]/g,
    severity: "high",
    title: "Token persisted in sessionStorage",
    detail: "sessionStorage reduces persistence but still exposes tokens to XSS payloads in the active tab.",
    recommendation: "Replace token storage with server-side session state plus CSRF protection.",
    summaryKey: "localStorageTokenTouches"
  },
  {
    id: "bearer-header",
    regex: /Authorization\s*[:=]\s*["'`]Bearer|fetch\([^)]*headers\s*:\s*\{[^}]*Authorization/gs,
    severity: "high",
    title: "Bearer token request flow detected",
    detail:
      "API requests are manually attaching bearer tokens. This typically requires broad frontend refactors during migration.",
    recommendation:
      "Switch to cookie-authenticated requests with `credentials: \"include\"` and CSRF headers for mutating actions.",
    summaryKey: "bearerHeaderTouches"
  },
  {
    id: "jwt-verify-middleware",
    regex:
      /(jwt\.(?:verify|decode)\s*\()|(jsonwebtoken\.(?:verify|decode)\s*\()|(req\.headers\.(?:authorization|Authorization))|(req\.get\(\s*["'`]authorization["'`]\s*\))/g,
    severity: "medium",
    title: "JWT verification middleware pattern detected",
    detail:
      "Server middleware is checking authorization headers for JWTs. This logic should become session middleware plus role checks.",
    recommendation:
      "Introduce `requireAuthenticatedSession` middleware and read `req.session.userId` instead of parsing bearer tokens.",
    summaryKey: "authMiddlewareTouches"
  }
];

function getFileExtension(path: string) {
  const lastDot = path.lastIndexOf(".");
  if (lastDot === -1) {
    return "";
  }

  return path.slice(lastDot).toLowerCase();
}

function lineFromIndex(source: string, index: number) {
  return source.slice(0, index).split(/\r?\n/).length;
}

function lineSnippet(source: string, line: number) {
  const lines = source.split(/\r?\n/);
  return lines[line - 1]?.trim().slice(0, 180) ?? "";
}

function buildRiskNarrative(summary: AnalysisSummary, findings: AnalysisFinding[]) {
  if (findings.length === 0) {
    return "No obvious JWT anti-patterns were detected in scanned files. Run this scan again after adding backend folders and environment files to the archive.";
  }

  if (summary.riskScore >= 75) {
    return "High migration urgency: token storage and bearer-token transport patterns are widespread, so this codebase is likely to fail SOC 2 security controls without a session migration.";
  }

  if (summary.riskScore >= 45) {
    return "Moderate migration urgency: JWT dependencies are distributed and require a staged transition to avoid auth regressions.";
  }

  return "Migration scope looks contained. You can likely move to session auth with a focused backend-first rollout and minimal client churn.";
}

function buildMigrationPlan(findings: AnalysisFinding[]) {
  const plan = [
    "Create server-side session middleware with secure, httpOnly cookies and sameSite=lax.",
    "Add CSRF token issuance and verification for POST/PUT/PATCH/DELETE endpoints.",
    "Replace bearer token parsing middleware with session-based guards (`req.session.userId`).",
    "Update frontend fetch/axios calls to use `credentials: \"include\"` and CSRF headers.",
    "Remove token reads/writes from localStorage/sessionStorage and delete JWT utility helpers.",
    "Run dual-auth mode for one release (accept old JWT + new session), then remove JWT paths."
  ];

  if (findings.some((finding) => finding.severity === "critical")) {
    plan.unshift("Patch critical XSS token exposure first by deleting localStorage token writes.");
  }

  return plan;
}

function buildQuickWins(summary: AnalysisSummary) {
  const wins = [
    "Add `httpOnly`, `secure`, and `sameSite=lax` to auth cookies immediately.",
    "Ship a single `/api/auth/session` endpoint so frontend does not parse auth state from tokens.",
    "Return 401 consistently from protected routes to simplify client handling."
  ];

  if (summary.localStorageTokenTouches > 0) {
    wins.unshift("Block new localStorage token writes in CI with a lint rule before migration work starts.");
  }

  return wins;
}

function calculateRiskScore(findings: AnalysisFinding[], summary: AnalysisSummary) {
  let score = 0;

  for (const finding of findings) {
    if (finding.severity === "critical") {
      score += 18;
    } else if (finding.severity === "high") {
      score += 10;
    } else if (finding.severity === "medium") {
      score += 6;
    } else {
      score += 3;
    }
  }

  score += summary.localStorageTokenTouches * 8;
  score += summary.bearerHeaderTouches * 4;

  return Math.min(100, score);
}

export async function analyzeJwtUsageArchive(archiveBuffer: Buffer, archiveName: string): Promise<AnalysisReport> {
  const zip = await JSZip.loadAsync(archiveBuffer);
  const entries = Object.entries(zip.files).filter(([, file]) => !file.dir);

  const findings: AnalysisFinding[] = [];
  const summary: AnalysisSummary = {
    filesScanned: 0,
    jwtLibraryTouches: 0,
    localStorageTokenTouches: 0,
    bearerHeaderTouches: 0,
    authMiddlewareTouches: 0,
    riskScore: 0
  };

  for (const [filePath, file] of entries) {
    if (summary.filesScanned >= 1200) {
      break;
    }

    const extension = getFileExtension(filePath);
    if (!SCANNABLE_EXTENSIONS.has(extension)) {
      continue;
    }

    const source = await file.async("string");
    summary.filesScanned += 1;

    for (const pattern of PATTERNS) {
      let matchesInCurrentFile = 0;
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);

      for (const match of source.matchAll(regex)) {
        const index = match.index ?? 0;
        const line = lineFromIndex(source, index);

        matchesInCurrentFile += 1;
        findings.push({
          id: `${pattern.id}:${filePath}:${line}:${matchesInCurrentFile}`,
          severity: pattern.severity,
          title: pattern.title,
          detail: pattern.detail,
          filePath,
          line,
          snippet: lineSnippet(source, line),
          recommendation: pattern.recommendation
        });

        if (matchesInCurrentFile >= 4) {
          break;
        }
      }

      if (matchesInCurrentFile > 0) {
        summary[pattern.summaryKey] += matchesInCurrentFile;
      }
    }
  }

  findings.sort((left, right) => {
    const severityWeight: Record<FindingSeverity, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };

    return severityWeight[right.severity] - severityWeight[left.severity];
  });

  summary.riskScore = calculateRiskScore(findings, summary);

  return {
    archiveName,
    generatedAt: new Date().toISOString(),
    summary,
    findings,
    riskNarrative: buildRiskNarrative(summary, findings),
    migrationPlan: buildMigrationPlan(findings),
    quickWins: buildQuickWins(summary)
  };
}
