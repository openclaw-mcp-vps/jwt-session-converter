const fs = require("fs-extra");
const path = require("node:path");

const expressTemplate = require("../templates/express-session");
const nextjsTemplate = require("../templates/nextjs-session");

function buildRiskChecklist(findings) {
  const browserStorageFindings = findings.filter((item) => item.type === "browser-token-storage");
  const bearerCouplingFindings = findings.filter((item) => item.type === "bearer-header-coupling");

  const checklist = [
    "Rotate all existing JWT signing keys after migration cutover.",
    "Set session cookies to HttpOnly + Secure + SameSite=Lax/Strict.",
    "Enable CSRF protection for all state-changing form and API routes.",
    "Introduce forced logout endpoint to invalidate server session state."
  ];

  if (browserStorageFindings.length > 0) {
    checklist.push("Remove all client-side token storage reads/writes discovered by analyzer before release.");
  }

  if (bearerCouplingFindings.length > 0) {
    checklist.push("Refactor Authorization-header-only guards to read user identity from the session store.");
  }

  return checklist;
}

async function generateMigrationFiles(outputDir, analysis) {
  const out = path.resolve(outputDir);
  await fs.mkdirp(out);

  const reportPath = path.join(out, "jwt-analysis-report.json");
  await fs.writeJson(reportPath, analysis, { spaces: 2 });

  const migrationPath = path.join(out, "migration-plan.md");
  const checklist = buildRiskChecklist(analysis.findings);
  const byRisk = {
    high: analysis.findings.filter((item) => item.risk === "high"),
    medium: analysis.findings.filter((item) => item.risk === "medium"),
    low: analysis.findings.filter((item) => item.risk === "low")
  };

  const migrationMarkdown = `# JWT to Session Migration Plan

## Scan Summary
- Files scanned: ${analysis.filesScanned}
- High risk findings: ${analysis.summary.high}
- Medium risk findings: ${analysis.summary.medium}
- Low risk findings: ${analysis.summary.low}

## Priority Findings
${["high", "medium", "low"]
  .map((risk) => {
    const entries = byRisk[risk];
    if (entries.length === 0) return `### ${risk.toUpperCase()}\n- None`;
    return `### ${risk.toUpperCase()}\n${entries
      .slice(0, 15)
      .map((item) => `- ${item.file}:${item.line} (${item.type}) -> ${item.recommendation}`)
      .join("\n")}`;
  })
  .join("\n\n")}

## Recommended Rollout Sequence
1. Add session middleware, cookie hardening, and CSRF protections server-side.
2. Add transition adapters so existing JWT-authenticated traffic remains functional temporarily.
3. Remove localStorage token writes and frontend bearer token dispatch.
4. Cut over login/logout flows to session issuance and invalidation.
5. Rotate JWT keys, remove fallback middleware, and rerun analyzer.

## Security Checklist
${checklist.map((item) => `- [ ] ${item}`).join("\n")}
`;

  await fs.writeFile(migrationPath, migrationMarkdown, "utf8");

  const templatesDir = path.join(out, "generated-templates");
  await fs.mkdirp(templatesDir);
  await fs.writeFile(path.join(templatesDir, "express-session-migration.js"), expressTemplate, "utf8");
  await fs.writeFile(path.join(templatesDir, "nextjs-session-migration.ts"), nextjsTemplate, "utf8");

  return {
    reportPath,
    migrationPath,
    templatesDir
  };
}

module.exports = {
  generateMigrationFiles
};
