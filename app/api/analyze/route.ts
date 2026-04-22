import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_COOKIE_NAME, hasValidAccessCookie } from "@/lib/access";
import { analyzeJwtUsageArchive } from "@/lib/jwt-analyzer";

export const runtime = "nodejs";

const MAX_ARCHIVE_BYTES = 25 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const hasAccess = hasValidAccessCookie(request.cookies.get(ACCESS_COOKIE_NAME)?.value);
  if (!hasAccess) {
    return NextResponse.json({ error: "Payment required to use analysis API." }, { status: 402 });
  }

  const formData = await request.formData();
  const archive = formData.get("archive");

  if (!(archive instanceof File)) {
    return NextResponse.json({ error: "Upload a ZIP archive under the `archive` field." }, { status: 400 });
  }

  if (!archive.name.toLowerCase().endsWith(".zip")) {
    return NextResponse.json({ error: "Only .zip uploads are supported." }, { status: 400 });
  }

  if (archive.size > MAX_ARCHIVE_BYTES) {
    return NextResponse.json({ error: "Archive exceeds the 25MB limit." }, { status: 413 });
  }

  try {
    const buffer = Buffer.from(await archive.arrayBuffer());
    const report = await analyzeJwtUsageArchive(buffer, archive.name);
    return NextResponse.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not analyze archive.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
