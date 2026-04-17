import crypto from "node:crypto";
import { cookies } from "next/headers";

export type AuthUser = {
  email: string;
  name: string;
};

const AUTH_COOKIE = "jwtsc_auth";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function getAuthSecret(): string {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "dev-auth-secret-change-me";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function signPayload(payload: string): string {
  return crypto.createHmac("sha256", getAuthSecret()).update(payload).digest("hex");
}

function encodeAuthToken(user: AuthUser): string {
  const normalizedEmail = normalizeEmail(user.email);
  const payloadObj = {
    email: normalizedEmail,
    name: user.name.trim() || "Developer",
    iat: Date.now()
  };
  const payload = Buffer.from(JSON.stringify(payloadObj), "utf8").toString("base64url");
  const sig = signPayload(payload);
  return `${payload}.${sig}`;
}

function decodeAuthToken(token: string): AuthUser | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = signPayload(payload);
  if (expected !== sig) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email?: string;
      name?: string;
      iat?: number;
    };

    if (!parsed.email || !parsed.name || !parsed.iat) return null;

    const ageMs = Date.now() - parsed.iat;
    if (ageMs > SESSION_TTL_SECONDS * 1000) return null;

    return {
      email: normalizeEmail(parsed.email),
      name: parsed.name
    };
  } catch {
    return null;
  }
}

export function getAuthCookieName(): string {
  return AUTH_COOKIE;
}

export async function createAuthSession(user: AuthUser): Promise<string> {
  const cookieStore = await cookies();
  const token = encodeAuthToken(user);
  cookieStore.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  });
  return token;
}

export async function clearAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE,
    value: "",
    path: "/",
    maxAge: 0
  });
}

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return decodeAuthToken(token);
}

export function isValidLoginInput(email: string, name: string): boolean {
  const normalized = normalizeEmail(email);
  return normalized.includes("@") && normalized.length <= 254 && name.trim().length >= 2;
}
