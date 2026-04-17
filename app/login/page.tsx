"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, name })
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Unable to sign in. Use a valid email address.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-10">
      <section className="w-full rounded-xl border border-[#30363d] bg-[#0f1722] p-6">
        <h1 className="text-2xl font-bold text-white">Sign In</h1>
        <p className="mt-2 text-sm text-[#9ba7b4]">Create your account session to purchase and download the CLI.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-[#c9d1d9]">
            Work Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-1 w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-white outline-none ring-[#58a6ff] focus:ring-2"
              placeholder="you@company.com"
            />
          </label>

          <label className="block text-sm text-[#c9d1d9]">
            Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="mt-1 w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-white outline-none ring-[#58a6ff] focus:ring-2"
              placeholder="Avery Patel"
            />
          </label>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Continue"}
          </Button>

          {error ? <p className="text-xs text-[#ff7b72]">{error}</p> : null}
        </form>
      </section>
    </main>
  );
}
