import Link from "next/link";
import { ArrowRight, Lock, Shield, Wrench } from "lucide-react";

import { PricingCard } from "@/components/PricingCard";
import { getAuthenticatedUser } from "@/lib/auth";

const faq = [
  {
    q: "Will this break existing users during migration?",
    a: "No. The generator creates dual-auth transition middleware so you can accept both JWT and sessions while rolling out safely."
  },
  {
    q: "Does it support Next.js and Express in one monorepo?",
    a: "Yes. The analyzer maps auth touchpoints per service and emits framework-specific migration files for each runtime."
  },
  {
    q: "Can my security team review generated changes before merge?",
    a: "Every file includes an audit annotation header with rationale, risk notes, and links to cookie/session hardening guidance."
  }
];

export default async function HomePage() {
  const user = await getAuthenticatedUser();
  const signedIn = Boolean(user?.email);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 md:px-8">
      <header className="flex items-center justify-between border-b border-[#30363d] pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#58a6ff]">Developer Security Tooling</p>
          <h1 className="mt-2 text-2xl font-bold text-white">jwt-session-converter</h1>
        </div>
        <nav className="flex items-center gap-4 text-sm text-[#9ba7b4]">
          <Link href="#pricing" className="hover:text-white">
            Pricing
          </Link>
          <Link href="#faq" className="hover:text-white">
            FAQ
          </Link>
          {signedIn ? (
            <Link href="/dashboard" className="rounded-md border border-[#30363d] px-3 py-2 text-white hover:bg-[#151b23]">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="rounded-md border border-[#30363d] px-3 py-2 text-white hover:bg-[#151b23]">
              Sign In
            </Link>
          )}
        </nav>
      </header>

      <section className="grid gap-10 py-16 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#30363d] px-3 py-1 text-xs text-[#9ba7b4]">
            <Shield className="h-3.5 w-3.5" />
            Built for Series A-C engineering teams under audit pressure
          </p>
          <h2 className="text-4xl font-black leading-tight text-white md:text-5xl">
            Convert JWT auth to secure sessions without rewriting your app by hand.
          </h2>
          <p className="mt-5 text-lg text-[#9ba7b4]">
            Scan your codebase, find vulnerable token storage patterns, and generate migration patches that move auth state to
            hardened, server-side sessions with CSRF protection.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={signedIn ? "/dashboard" : "/login"}
              className="inline-flex items-center rounded-md bg-[#2f81f7] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1f6feb]"
            >
              {signedIn ? "Open Dashboard" : "Sign In to Start"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center rounded-md border border-[#30363d] px-5 py-3 text-sm font-semibold text-[#c9d1d9] hover:bg-[#151b23]"
            >
              View Pricing
            </a>
          </div>
        </div>
        <div className="rounded-2xl border border-[#30363d] bg-[#0f1722] p-6">
          <h3 className="text-sm uppercase tracking-wide text-[#58a6ff]">What You Get</h3>
          <div className="mt-4 space-y-4 text-sm text-[#c9d1d9]">
            <p className="flex gap-2">
              <Lock className="mt-0.5 h-4 w-4 text-[#58a6ff]" />
              Detects localStorage token handling, Authorization header coupling, and JWT library usage across frontend and API
              services.
            </p>
            <p className="flex gap-2">
              <Wrench className="mt-0.5 h-4 w-4 text-[#58a6ff]" />
              Generates Express and Next.js migration templates with secure cookie flags, session rotation, and CSRF strategy.
            </p>
            <p className="flex gap-2">
              <Shield className="mt-0.5 h-4 w-4 text-[#58a6ff]" />
              Outputs implementation plan and risk checklist you can hand directly to reviewers or auditors.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 border-y border-[#30363d] py-12 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold text-white">The Problem</h3>
          <p className="mt-2 text-sm text-[#9ba7b4]">
            JWTs in browser storage are exposed to XSS. Teams know this, but replacing auth plumbing across UI, API, and
            middleware is high-risk and usually delayed.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">The Solution</h3>
          <p className="mt-2 text-sm text-[#9ba7b4]">
            Automate the boring, risky parts. The CLI maps your auth flow, drafts migration files, and gives you a staged rollout
            path with rollback checkpoints.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Who Pays</h3>
          <p className="mt-2 text-sm text-[#9ba7b4]">
            Senior developers and tech leads preparing for SOC2, customer security reviews, or enterprise procurement audits.
          </p>
        </div>
      </section>

      <section id="pricing" className="py-14">
        <div className="mb-6">
          <h3 className="text-3xl font-bold text-white">Pricing</h3>
          <p className="mt-2 text-sm text-[#9ba7b4]">One plan, immediate value. Ship your migration this sprint, not next quarter.</p>
        </div>
        <div className="max-w-md">
          <PricingCard email={user?.email} isAuthenticated={signedIn} />
        </div>
      </section>

      <section id="faq" className="border-t border-[#30363d] py-14">
        <h3 className="text-3xl font-bold text-white">FAQ</h3>
        <div className="mt-6 space-y-5">
          {faq.map((entry) => (
            <article key={entry.q} className="rounded-lg border border-[#30363d] bg-[#0f1722] p-5">
              <h4 className="text-base font-semibold text-white">{entry.q}</h4>
              <p className="mt-2 text-sm text-[#9ba7b4]">{entry.a}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
