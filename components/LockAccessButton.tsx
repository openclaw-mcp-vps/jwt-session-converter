"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function LockAccessButton() {
  const router = useRouter();
  const [isLocking, setIsLocking] = useState(false);

  async function handleLock() {
    setIsLocking(true);
    try {
      await fetch("/api/unlock", { method: "DELETE" });
      router.push("/");
      router.refresh();
    } finally {
      setIsLocking(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLock} disabled={isLocking}>
      {isLocking ? "Locking..." : "Lock this browser"}
    </Button>
  );
}
