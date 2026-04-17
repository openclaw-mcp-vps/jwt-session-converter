const fs = require("fs-extra");
const path = require("node:path");
const { parse } = require("@babel/parser");
const ts = require("typescript");
const { globSync } = require("glob");

const SOURCE_GLOBS = ["**/*.{js,jsx,ts,tsx,mjs,cjs}"];
const IGNORE_GLOBS = ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/build/**", "**/coverage/**"];

function buildFinding(file, line, code, type, risk, recommendation) {
  return { file, line, code, type, risk, recommendation };
}

function safeParseBabel(code) {
  try {
    return parse(code, {
      sourceType: "unambiguous",
      plugins: ["typescript", "jsx", "decorators-legacy"]
    });
  } catch {
    return null;
  }
}

function detectWithAst(code, relativePath) {
  const findings = [];
  const ast = safeParseBabel(code);
  if (!ast) return findings;

  const lines = code.split("\n");

  function visit(node) {
    if (!node || typeof node !== "object") return;

    if (node.type === "MemberExpression" && !node.computed) {
      if (
        node.object &&
        node.object.type === "Identifier" &&
        node.object.name === "localStorage" &&
        node.property &&
        node.property.type === "Identifier" &&
        ["setItem", "getItem"].includes(node.property.name)
      ) {
        const line = node.loc?.start.line || 1;
        findings.push(
          buildFinding(
            relativePath,
            line,
            lines[line - 1]?.trim() || "localStorage token access",
            "browser-token-storage",
            "high",
            "Replace localStorage token reads/writes with HttpOnly session cookies and server session lookups."
          )
        );
      }
    }

    if (node.type === "StringLiteral" || node.type === "Literal") {
      const value = typeof node.value === "string" ? node.value.toLowerCase() : "";
      if (value.includes("authorization") || value.includes("bearer")) {
        const line = node.loc?.start.line || 1;
        findings.push(
          buildFinding(
            relativePath,
            line,
            lines[line - 1]?.trim() || "Authorization header usage",
            "bearer-header-coupling",
            "medium",
            "Move identity to server session middleware and reduce bearer token fan-out."
          )
        );
      }
    }

    if (node.type === "Identifier" && ["jsonwebtoken", "jwt", "sign", "verify"].includes(node.name)) {
      const line = node.loc?.start.line || 1;
      findings.push(
        buildFinding(
          relativePath,
          line,
          lines[line - 1]?.trim() || "JWT library identifier",
          "jwt-library-reference",
          "medium",
          "Audit this usage and replace auth-critical paths with session storage and rotation."
        )
      );
    }

    for (const key of Object.keys(node)) {
      const value = node[key];
      if (Array.isArray(value)) {
        value.forEach(visit);
      } else if (value && typeof value === "object") {
        visit(value);
      }
    }
  }

  visit(ast.program);
  return findings;
}

function detectWithTypeScriptScanner(code, relativePath) {
  const findings = [];
  const sourceFile = ts.createSourceFile(relativePath, code, ts.ScriptTarget.Latest, true);

  function scan(node) {
    if (ts.isStringLiteral(node)) {
      const value = node.text.toLowerCase();
      if (value.includes("jwt") || value.includes("token")) {
        const lineAndChar = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const line = lineAndChar.line + 1;
        findings.push(
          buildFinding(
            relativePath,
            line,
            sourceFile.text.split("\n")[line - 1]?.trim() || "JWT-related string literal",
            "token-string-literal",
            "low",
            "Confirm this string is not part of insecure client-side token persistence."
          )
        );
      }
    }

    ts.forEachChild(node, scan);
  }

  scan(sourceFile);
  return findings;
}

async function detectJwtPatterns(projectDir) {
  const absoluteProjectDir = path.resolve(projectDir);
  const files = SOURCE_GLOBS.flatMap((pattern) =>
    globSync(pattern, {
      cwd: absoluteProjectDir,
      absolute: true,
      ignore: IGNORE_GLOBS,
      nodir: true
    })
  );

  const deduped = [...new Set(files)];
  const findings = [];

  for (const file of deduped) {
    const content = await fs.readFile(file, "utf8");
    const relativePath = path.relative(absoluteProjectDir, file);

    const astFindings = detectWithAst(content, relativePath);
    const tsFindings = detectWithTypeScriptScanner(content, relativePath);

    for (const finding of [...astFindings, ...tsFindings]) {
      findings.push(finding);
    }
  }

  const unique = [];
  const seen = new Set();
  for (const finding of findings) {
    const key = `${finding.file}:${finding.line}:${finding.type}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(finding);
    }
  }

  return {
    filesScanned: deduped.length,
    findings: unique,
    summary: {
      high: unique.filter((item) => item.risk === "high").length,
      medium: unique.filter((item) => item.risk === "medium").length,
      low: unique.filter((item) => item.risk === "low").length
    }
  };
}

module.exports = {
  detectJwtPatterns
};
