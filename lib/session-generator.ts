import type { AnalysisReport, MigrationBundle, MigrationFile } from "@/lib/types";

function criticalFileList(report: AnalysisReport) {
  const critical = report.findings.filter((finding) => finding.severity === "critical");
  const uniquePaths = [...new Set(critical.map((finding) => `${finding.filePath}:${finding.line}`))];

  if (uniquePaths.length === 0) {
    return "- No critical token storage usage was detected in scanned files.";
  }

  return uniquePaths.map((item) => `- ${item}`).join("\n");
}

function file(content: string, path: string, rationale: string): MigrationFile {
  return { path, content, rationale };
}

function buildReadme(report: AnalysisReport) {
  return `# JWT to Session Migration Kit

Generated: ${report.generatedAt}
Archive analyzed: ${report.archiveName}

## Risk snapshot
- Risk score: ${report.summary.riskScore}/100
- Token storage findings: ${report.summary.localStorageTokenTouches}
- Bearer header findings: ${report.summary.bearerHeaderTouches}
- Auth middleware findings: ${report.summary.authMiddlewareTouches}

## Immediate high-risk files
${criticalFileList(report)}

## Rollout strategy
1. Add session + CSRF middleware while JWT paths still work.
2. Migrate frontend API calls to cookie auth (credentials: "include").
3. Replace JWT middleware with session guards.
4. Remove localStorage/sessionStorage token logic.
5. Disable JWT issuance and delete legacy auth helpers.

## Verification checklist
- Login succeeds and sets secure httpOnly session cookie.
- Protected routes reject unauthenticated requests.
- CSRF token required for state-changing routes.
- No client-side token reads or writes remain.
- Security scan confirms no bearer token headers from frontend.
`;
}

function buildSessionConfig() {
  return `import type { Express } from "express";
import session from "express-session";

const THIRTY_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 30;

export function installSessionAuth(app: Express) {
  app.set("trust proxy", 1);

  app.use(
    session({
      name: "sid",
      secret: process.env.SESSION_SECRET || "replace-me-in-production",
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: THIRTY_DAYS_IN_MS
      }
    })
  );
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
    csrfToken?: string;
  }
}
`;
}

function buildCsrfMiddleware() {
  return `import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const CSRF_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function issueCsrfToken(request: Request, response: Response) {
  if (!request.session.csrfToken) {
    request.session.csrfToken = crypto.randomBytes(24).toString("hex");
  }

  response.cookie("csrf_token", request.session.csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });

  return request.session.csrfToken;
}

export function verifyCsrf(request: Request, response: Response, next: NextFunction) {
  if (!CSRF_METHODS.has(request.method)) {
    next();
    return;
  }

  const providedToken = request.get("x-csrf-token") || request.body?._csrf;
  if (!providedToken || !request.session.csrfToken || providedToken !== request.session.csrfToken) {
    response.status(403).json({ error: "Invalid CSRF token" });
    return;
  }

  next();
}
`;
}

function buildAuthRoutes() {
  return `import bcrypt from "bcryptjs";
import type { Express, Request, Response } from "express";

import { issueCsrfToken } from "./csrf";
import { requireAuthenticatedSession } from "./require-auth";

type User = {
  id: string;
  email: string;
  passwordHash: string;
};

async function findUserByEmail(email: string): Promise<User | null> {
  // Replace with your own data access logic.
  return null;
}

export function installAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (request: Request, response: Response) => {
    const email = String(request.body?.email ?? "").toLowerCase().trim();
    const password = String(request.body?.password ?? "");

    if (!email || !password) {
      response.status(400).json({ error: "Email and password are required." });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      response.status(401).json({ error: "Invalid credentials." });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      response.status(401).json({ error: "Invalid credentials." });
      return;
    }

    request.session.userId = user.id;
    const csrfToken = issueCsrfToken(request, response);

    response.status(200).json({
      ok: true,
      csrfToken,
      user: {
        id: user.id,
        email: user.email
      }
    });
  });

  app.post("/api/auth/logout", (request: Request, response: Response) => {
    request.session.destroy(() => {
      response.clearCookie("sid");
      response.clearCookie("csrf_token");
      response.status(200).json({ ok: true });
    });
  });

  app.get("/api/auth/me", requireAuthenticatedSession, (request: Request, response: Response) => {
    response.status(200).json({
      authenticated: true,
      userId: request.session.userId
    });
  });
}
`;
}

function buildRequireAuth() {
  return `import type { NextFunction, Request, Response } from "express";

export function requireAuthenticatedSession(request: Request, response: Response, next: NextFunction) {
  if (!request.session.userId) {
    response.status(401).json({ error: "Authentication required." });
    return;
  }

  next();
}
`;
}

function buildClientWrapper() {
  return `function readCsrfTokenFromCookie() {
  const cookieEntry = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("csrf_token="));

  return cookieEntry ? decodeURIComponent(cookieEntry.split("=")[1] || "") : "";
}

export async function sessionFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers);

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrfToken = readCsrfTokenFromCookie();
    if (csrfToken) {
      headers.set("x-csrf-token", csrfToken);
    }
  }

  const response = await fetch(input, {
    ...init,
    credentials: "include",
    headers
  });

  if (response.status === 401) {
    // Your app can redirect to login here.
  }

  return response;
}
`;
}

function buildTokenRemovalChecklist(report: AnalysisReport) {
  const localStorageFindings = report.findings.filter((finding) => finding.title.includes("localStorage") || finding.title.includes("sessionStorage"));

  const lines = localStorageFindings.length
    ? localStorageFindings.map((finding) => `- [ ] ${finding.filePath}:${finding.line} - ${finding.snippet}`)
    : ["- [ ] Search for token reads/writes and replace with session API calls."];

  return `# Token Cleanup Checklist

Delete all client-side token persistence before switching off JWT endpoints.

${lines.join("\n")}
`;
}

export function generateSessionMigrationBundle(report: AnalysisReport): MigrationBundle {
  const files: MigrationFile[] = [
    file(buildReadme(report), "MIGRATION_README.md", "Deployment and rollout notes based on your scan results."),
    file(buildSessionConfig(), "server/session-config.ts", "Express session config with secure cookie defaults."),
    file(buildCsrfMiddleware(), "server/csrf.ts", "CSRF token issuance and verification middleware."),
    file(buildRequireAuth(), "server/require-auth.ts", "Session-based route guard middleware."),
    file(buildAuthRoutes(), "server/auth-routes.ts", "Login, logout, and session-status route scaffolding."),
    file(buildClientWrapper(), "client/session-fetch.ts", "Frontend fetch wrapper for cookie sessions and CSRF headers."),
    file(buildTokenRemovalChecklist(report), "migration/token-cleanup-checklist.md", "File-by-file JWT token cleanup tasks.")
  ];

  return {
    generatedAt: new Date().toISOString(),
    archiveName: report.archiveName,
    files,
    installCommand:
      "npm install express-session bcryptjs cookie-parser && npm uninstall jsonwebtoken jwt-decode",
    rolloutChecklist: [
      "Deploy session middleware with JWT fallback enabled for one release.",
      "Migrate frontend API calls to cookie-authenticated requests.",
      "Enable CSRF enforcement on all mutating endpoints.",
      "Delete localStorage/sessionStorage token code paths.",
      "Disable JWT issuance and remove bearer-token middleware."
    ]
  };
}
