import { NextRequest, NextResponse } from "next/server";

import { createAuthSession, isValidLoginInput } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { email?: string; name?: string } | null;
  const email = body?.email?.trim() ?? "";
  const name = body?.name?.trim() ?? "";

  if (!isValidLoginInput(email, name)) {
    return NextResponse.json({ error: "Please use a valid work email and full name." }, { status: 400 });
  }

  await createAuthSession({ email, name });
  return NextResponse.json({ ok: true });
}
