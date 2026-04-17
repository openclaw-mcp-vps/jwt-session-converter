import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { DownloadButton } from "@/components/DownloadButton";
import { clearAuthSession, getAuthenticatedUser } from "@/lib/auth";
import { getLicense } from "@/lib/license";
import { getPaidCookieName, verifyPaidCookie } from "@/lib/paywall";

async function logoutAction() {
  "use server";
  await clearAuthSession();
  redirect("/");
}

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user?.email) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const paidToken = cookieStore.get(getPaidCookieName())?.value;
  const hasPaidCookie = paidToken ? verifyPaidCookie(paidToken, user.email) : false;
  const license = await getLicense(user.email);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 md:px-8">
      <header className="mb-8 flex items-center justify-between border-b border-[#30363d] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-[#9ba7b4]">{user.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <form action={logoutAction}>
            <button className="text-sm text-[#9ba7b4] hover:text-white" type="submit">
              Sign out
            </button>
          </form>
          <Link href="/" className="text-sm text-[#58a6ff] hover:underline">
            Back to site
          </Link>
        </div>
      </header>

      {hasPaidCookie && license ? (
        <section className="space-y-6">
          <div className="rounded-xl border border-[#30363d] bg-[#0f1722] p-6">
            <h2 className="text-xl font-semibold text-white">License Active</h2>
            <p className="mt-2 text-sm text-[#9ba7b4]">
              Purchase date: {new Date(license.purchasedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            <p className="mt-1 text-sm text-[#9ba7b4]">Plan: Starter ($19/month)</p>
            <div className="mt-4">
              <DownloadButton />
            </div>
          </div>

          <div className="rounded-xl border border-[#30363d] bg-[#0f1722] p-6 text-sm text-[#c9d1d9]">
            <h3 className="mb-2 text-base font-semibold text-white">How to Run the CLI</h3>
            <pre className="overflow-x-auto rounded-md border border-[#30363d] bg-[#0d1117] p-3 text-xs">
{`node jwt-session-converter-cli.js --project /path/to/repo --out ./migration-output`}
            </pre>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-[#30363d] bg-[#0f1722] p-6">
          <h2 className="text-xl font-semibold text-white">Purchase Required</h2>
          <p className="mt-2 text-sm text-[#9ba7b4]">
            Complete checkout to unlock downloads. After payment, Lemon Squeezy returns here and sets your secure access cookie.
          </p>
          <Link
            href="/#pricing"
            className="mt-4 inline-flex rounded-md bg-[#2f81f7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f6feb]"
          >
            Go to Pricing
          </Link>
        </section>
      )}
    </main>
  );
}
