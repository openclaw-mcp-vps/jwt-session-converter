import { NextRequest, NextResponse } from "next/server";

import { saveLicense, verifyLicenseToken } from "@/lib/license";
import { getPaidCookieName, signPaidCookie } from "@/lib/paywall";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const checkoutId = request.nextUrl.searchParams.get("checkout_id") ?? "manual";

  const email = verifyLicenseToken(token);
  if (!email) {
    return NextResponse.redirect(new URL("/dashboard?payment=invalid", request.url));
  }

  await saveLicense(email, checkoutId);

  const response = NextResponse.redirect(new URL("/dashboard?payment=success", request.url));
  response.cookies.set({
    name: getPaidCookieName(),
    value: signPaidCookie(email),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 31,
    path: "/"
  });

  return response;
}
