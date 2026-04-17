import fs from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth";
import { getLicense } from "@/lib/license";
import { verifyPaidCookieFromRequest } from "@/lib/paywall";

export async function POST() {
  const user = await getAuthenticatedUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!await verifyPaidCookieFromRequest(user.email)) {
    return NextResponse.json({ error: "License access cookie missing or invalid." }, { status: 403 });
  }

  const license = await getLicense(user.email);
  if (!license) {
    return NextResponse.json({ error: "No active license found for this account." }, { status: 403 });
  }

  const filePath = path.join(process.cwd(), "cli", "standalone.js");
  const content = await fs.readFile(filePath, "utf8");

  return new NextResponse(content, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "content-disposition": 'attachment; filename="jwt-session-converter-cli.js"',
      "cache-control": "no-store"
    }
  });
}
