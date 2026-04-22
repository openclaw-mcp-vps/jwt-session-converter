import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ACCESS_COOKIE_NAME,
  ACCESS_COOKIE_TTL_SECONDS,
  createAccessCookieValue,
  hasValidAccessCookie
} from "@/lib/access";
import { findPurchaseByEmail } from "@/lib/purchases-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.toLowerCase().trim() ?? "";

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const purchase = await findPurchaseByEmail(email);

  if (!purchase) {
    return NextResponse.json(
      {
        error:
          "No completed purchase found for that email. Use the checkout email and wait a moment for Stripe webhook processing."
      },
      { status: 404 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: ACCESS_COOKIE_NAME,
    value: createAccessCookieValue(email),
    maxAge: ACCESS_COOKIE_TTL_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    path: "/"
  });

  return NextResponse.json({ message: "Access unlocked for this browser." });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: ACCESS_COOKIE_NAME,
    value: "",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    path: "/"
  });

  return NextResponse.json({ message: "Access cookie removed." });
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const hasAccess = hasValidAccessCookie(cookieStore.get(ACCESS_COOKIE_NAME)?.value);

  return NextResponse.json({ hasAccess, path: new URL(request.url).pathname });
}
