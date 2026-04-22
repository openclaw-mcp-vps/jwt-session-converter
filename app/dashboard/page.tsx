import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LockAccessButton } from "@/components/LockAccessButton";
import { ToolWorkbench } from "@/components/ToolWorkbench";
import { ACCESS_COOKIE_NAME, hasValidAccessCookie } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!hasValidAccessCookie(accessCookie)) {
    redirect("/unlock");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-[#8ea3b8]">Authenticated Workspace</p>
          <h1 className="mt-1 text-2xl font-bold">JWT Migration Dashboard</h1>
          <p className="mt-1 text-sm text-[#9fb0c2]">
            Analyze your repository and generate session-based migration code with CSRF protection.
          </p>
        </div>
        <LockAccessButton />
      </header>

      <ToolWorkbench />
    </main>
  );
}
