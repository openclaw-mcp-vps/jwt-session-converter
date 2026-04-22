import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What exactly gets scanned?",
    answer:
      "The analyzer scans your uploaded source files for JWT imports, bearer-token middleware, localStorage token persistence, and frontend request patterns that need session conversion."
  },
  {
    question: "Do you rewrite my repository automatically?",
    answer:
      "No. You get a migration kit and a file-by-file cleanup checklist so your team can review each security change before applying it."
  },
  {
    question: "How does access work after payment?",
    answer:
      "Checkout happens on Stripe Payment Links. After payment, your email is verified and this browser receives a secure access cookie that unlocks the dashboard."
  },
  {
    question: "Can I use this during SOC 2 remediation?",
    answer:
      "Yes. The generated plan and code are designed for teams that need measurable risk reduction quickly before audits, enterprise procurement, or pen-tests."
  }
];

export default function HomePage() {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-wide text-[#9ecdf0]">
          jwt-session-converter
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/unlock" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Unlock Access
          </Link>
        </div>
      </header>

      <section className="mt-16 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-[#35506d] bg-[#0b1a2d] px-3 py-1 text-xs font-medium text-[#8fd4ff]">
            Developer Security Tool - $19/month
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#f0f6fc] sm:text-5xl">
            Convert JWT auth to secure sessions before your security audit fails it.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-[#a8bbce] sm:text-lg">
            JWT Session Converter scans your codebase for JWT anti-patterns, highlights localStorage token exposure,
            and generates a migration kit with server-side sessions, CSRF protection, and rollout steps your team can
            ship this sprint.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={paymentLink ?? ""}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ size: "lg" })}
            >
              Start Secure Migration
            </a>
            <Link href="/unlock" className={buttonVariants({ variant: "outline", size: "lg" })}>
              I already paid
            </Link>
          </div>
          <p className="mt-3 text-xs text-[#7e92a7]">Hosted checkout on Stripe. No card data touches your app.</p>
        </div>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-lg">Why teams buy this</CardTitle>
            <CardDescription>Built for senior engineers and tech leads fixing inherited auth debt.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[#cadef1]">
            <p>Security audits repeatedly flag JWT storage in localStorage as high-risk XSS exposure.</p>
            <p>Manual migration takes weeks across API middleware, frontend clients, and auth flows.</p>
            <p>This tool narrows the work to a concrete checklist and production-ready scaffolding in minutes.</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-20">
        <h2 className="text-2xl font-semibold text-[#f0f6fc]">The problem your team is stuck with</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">XSS blast radius</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#a8bbce]">
              Any injected script can exfiltrate tokens from localStorage and impersonate users until expiry.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Refactor uncertainty</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#a8bbce]">
              JWT logic is scattered across middleware, route guards, and API clients with inconsistent patterns.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audit deadlines</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#a8bbce]">
              SOC 2 and enterprise sales cycles demand measurable remediation, not a best-effort cleanup plan.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-2xl font-semibold text-[#f0f6fc]">What the platform delivers</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Automated JWT pattern analysis</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#a8bbce]">
              Upload a zip of your project and get severity-ranked findings with exact files and lines that block a
              secure migration.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session + CSRF migration kit</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#a8bbce]">
              Download implementation code for session middleware, CSRF enforcement, auth routes, and client request
              wrappers.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rollout-ready checklist</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#a8bbce]">
              Move safely from dual-auth mode to full session auth with explicit verification steps for each release.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paywalled delivery</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#a8bbce]">
              Access to the dashboard and generation endpoints is gated by a secure cookie unlocked after Stripe
              purchase verification.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-20">
        <Card className="border-[#2c4f71] bg-[#0d1c2f]">
          <CardHeader>
            <CardTitle className="text-2xl">Pricing</CardTitle>
            <CardDescription>One plan for teams that need to fix auth risk quickly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-4xl font-bold">
              $19<span className="text-base font-medium text-[#9fb0c2]"> / month</span>
            </p>
            <ul className="space-y-2 text-sm text-[#cadef1]">
              <li>Unlimited codebase scans</li>
              <li>Unlimited migration kit downloads</li>
              <li>Session + CSRF code scaffolding</li>
              <li>Audit-focused migration checklist</li>
            </ul>
            <a
              href={paymentLink ?? ""}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              Buy with Stripe
            </a>
          </CardContent>
        </Card>
      </section>

      <section className="mt-20">
        <h2 className="text-2xl font-semibold text-[#f0f6fc]">FAQ</h2>
        <div className="mt-6 space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#a8bbce]">{faq.answer}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="mt-20" />

      <footer className="mt-6 flex flex-col gap-3 pb-4 text-sm text-[#7f93a8] sm:flex-row sm:items-center sm:justify-between">
        <p>JWT Session Converter helps security-conscious startups migrate from risky token storage patterns.</p>
        <div className="flex gap-4">
          <Link href="/unlock" className="hover:text-[#c8d8e7]">
            Unlock Access
          </Link>
          <Link href="/dashboard" className="hover:text-[#c8d8e7]">
            Dashboard
          </Link>
        </div>
      </footer>
    </main>
  );
}
