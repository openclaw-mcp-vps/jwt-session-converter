# Build Task: jwt-session-converter

Build a complete, production-ready Next.js 15 App Router application.

PROJECT: jwt-session-converter
HEADLINE: Convert JWT auth to secure sessions
WHAT: A CLI tool that automatically converts JWT-based authentication systems to secure server-side sessions. Analyzes your codebase, identifies JWT usage patterns, and generates migration code with proper session storage and CSRF protection.
WHY: JWTs are being stored in localStorage everywhere, creating XSS vulnerabilities that can't be patched. Security audits are flagging this, and manual migration takes weeks of careful refactoring across frontend and backend.
WHO PAYS: Senior developers and tech leads at Series A-C startups who inherited JWT implementations and need to fix security issues before SOC2 audits or enterprise sales calls.
NICHE: developer-tools
PRICE: $$19/mo

ARCHITECTURE SPEC:
A Next.js web app with a CLI tool download system. Users authenticate, purchase a license, and download a Node.js CLI that analyzes codebases for JWT patterns and generates session migration code.

PLANNED FILES:
- pages/api/auth/[...nextauth].js
- pages/api/checkout.js
- pages/api/download.js
- pages/index.js
- pages/dashboard.js
- cli/index.js
- cli/analyzers/jwt-detector.js
- cli/generators/session-migrator.js
- cli/templates/express-session.js
- cli/templates/nextjs-session.js
- components/PricingCard.js
- components/DownloadButton.js

DEPENDENCIES: next, tailwindcss, next-auth, @lemonsqueezy/lemonsqueezy.js, commander, chalk, inquirer, babel-parser, typescript, glob, fs-extra

REQUIREMENTS:
- Next.js 15 with App Router (app/ directory)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components (npx shadcn@latest init, then add needed components)
- Dark theme ONLY — background #0d1117, no light mode
- Lemon Squeezy checkout overlay for payments
- Landing page that converts: hero, problem, solution, pricing, FAQ
- The actual tool/feature behind a paywall (cookie-based access after purchase)
- Mobile responsive
- SEO meta tags, Open Graph tags
- /api/health endpoint that returns {"status":"ok"}
- NO HEAVY ORMs: Do NOT use Prisma, Drizzle, TypeORM, Sequelize, or Mongoose. If the tool needs persistence, use direct SQL via `pg` (Postgres) or `better-sqlite3` (local), or just filesystem JSON. Reason: these ORMs require schema files and codegen steps that fail on Vercel when misconfigured.
- INTERNAL FILE DISCIPLINE: Every internal import (paths starting with `@/`, `./`, or `../`) MUST refer to a file you actually create in this build. If you write `import { Card } from "@/components/ui/card"`, then `components/ui/card.tsx` MUST exist with a real `export const Card` (or `export default Card`). Before finishing, scan all internal imports and verify every target file exists. Do NOT use shadcn/ui patterns unless you create every component from scratch — easier path: write all UI inline in the page that uses it.
- DEPENDENCY DISCIPLINE: Every package imported in any .ts, .tsx, .js, or .jsx file MUST be
  listed in package.json dependencies (or devDependencies for build-only). Before finishing,
  scan all source files for `import` statements and verify every external package (anything
  not starting with `.` or `@/`) appears in package.json. Common shadcn/ui peers that MUST
  be added if used:
  - lucide-react, clsx, tailwind-merge, class-variance-authority
  - react-hook-form, zod, @hookform/resolvers
  - @radix-ui/* (for any shadcn component)
- After running `npm run build`, if you see "Module not found: Can't resolve 'X'", add 'X'
  to package.json dependencies and re-run npm install + npm run build until it passes.

ENVIRONMENT VARIABLES (create .env.example):
- NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID
- NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID
- LEMON_SQUEEZY_WEBHOOK_SECRET

After creating all files:
1. Run: npm install
2. Run: npm run build
3. Fix any build errors
4. Verify the build succeeds with exit code 0

Do NOT use placeholder text. Write real, helpful content for the landing page
and the tool itself. The tool should actually work and provide value.


PREVIOUS ATTEMPT FAILED WITH:
Codex timed out after 600s
Please fix the above errors and regenerate.