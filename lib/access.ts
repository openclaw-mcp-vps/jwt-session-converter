import crypto from "node:crypto";

export const ACCESS_COOKIE_NAME = "jsc_access";
export const ACCESS_COOKIE_TTL_SECONDS = 60 * 60 * 24 * 30;

type AccessPayload = {
  email: string;
  tier: "pro";
  iat: number;
  exp: number;
};

function getSigningSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET || "local-dev-jsc-secret";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSigningSecret()).update(payload).digest("base64url");
}

function timingSafeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function createAccessCookieValue(email: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload: AccessPayload = {
    email: email.toLowerCase(),
    tier: "pro",
    iat: now,
    exp: now + ACCESS_COOKIE_TTL_SECONDS
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyAccessCookie(value?: string | null): AccessPayload | null {
  if (!value) {
    return null;
  }

  const [encodedPayload, signature] = value.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  if (!timingSafeCompare(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as AccessPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    if (!payload.email || payload.tier !== "pro") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function hasValidAccessCookie(value?: string | null) {
  return verifyAccessCookie(value) !== null;
}
