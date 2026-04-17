import crypto from "node:crypto";
import { cookies } from "next/headers";

const paidCookieName = "jwtsc_paid";

function getSecret(): string {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "dev-auth-secret-change-me";
}

export function getPaidCookieName(): string {
  return paidCookieName;
}

export function signPaidCookie(email: string): string {
  const normalized = email.trim().toLowerCase();
  const issuedAt = Date.now().toString();
  const payload = `${normalized}:${issuedAt}`;
  const sig = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyPaidCookie(token: string, expectedEmail: string): boolean {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [email, issuedAt, sig] = raw.split(":");
    if (!email || !issuedAt || !sig) {
      return false;
    }

    const normalizedExpected = expectedEmail.trim().toLowerCase();
    if (email !== normalizedExpected) {
      return false;
    }

    const expectedSig = crypto.createHmac("sha256", getSecret()).update(`${email}:${issuedAt}`).digest("hex");
    return sig === expectedSig;
  } catch {
    return false;
  }
}

export async function verifyPaidCookieFromRequest(email: string): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getPaidCookieName())?.value;
  if (!token) {
    return false;
  }
  return verifyPaidCookie(token, email);
}
