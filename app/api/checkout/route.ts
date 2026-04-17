import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth";
import { createCheckoutId, createLicenseToken } from "@/lib/license";

function buildCheckoutBase(productOrVariant: string): string {
  if (productOrVariant.startsWith("http://") || productOrVariant.startsWith("https://")) {
    return productOrVariant;
  }
  return `https://checkout.lemonsqueezy.com/buy/${productOrVariant}`;
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  const userEmail = user?.email;

  if (!userEmail) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = (body?.email || userEmail).trim().toLowerCase();

  if (email !== userEmail.trim().toLowerCase()) {
    return NextResponse.json({ error: "Checkout email must match your signed-in account." }, { status: 400 });
  }

  const productId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
  if (!productId) {
    return NextResponse.json({ error: "Checkout is not configured." }, { status: 500 });
  }

  const checkoutId = createCheckoutId();
  const token = createLicenseToken(email);
  const origin = request.nextUrl.origin;

  const checkoutUrl = new URL(buildCheckoutBase(productId));
  checkoutUrl.searchParams.set("checkout[email]", email);
  checkoutUrl.searchParams.set("checkout[custom][checkout_id]", checkoutId);
  checkoutUrl.searchParams.set("checkout[custom][license_token]", token);
  checkoutUrl.searchParams.set("checkout[success_url]", `${origin}/api/checkout/complete?token=${token}&checkout_id=${checkoutId}`);

  return NextResponse.json({ checkoutUrl: checkoutUrl.toString() });
}
