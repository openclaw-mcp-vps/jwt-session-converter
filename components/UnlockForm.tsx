"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function UnlockForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleUnlock(event: React.FormEvent) {
    event.preventDefault();

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const body = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(body.error ?? "Unable to unlock access.");
      }

      setStatus("idle");
      setMessage(body.message ?? "Access unlocked.");
      router.push("/dashboard");
      router.refresh();
    } catch (unlockError) {
      setStatus("error");
      const errorMessage = unlockError instanceof Error ? unlockError.message : "Unable to unlock access.";
      setMessage(errorMessage);
    }
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Unlock Purchased Access</CardTitle>
        <CardDescription>
          Enter the same email address you used at Stripe checkout. Once verified, this browser receives a secure access cookie.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUnlock} className="space-y-4">
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          {message ? (
            <p className={`text-sm ${status === "error" ? "text-[#f5a3a0]" : "text-[#9fe0ad]"}`}>{message}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={status === "loading"}>
            {status === "loading" ? "Verifying purchase..." : "Unlock Dashboard"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
