import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export type LicenseRecord = {
  email: string;
  purchasedAt: string;
  checkoutId: string;
  plan: "starter";
};

const dataDir = path.join(process.cwd(), ".data");
const licensesPath = path.join(dataDir, "licenses.json");

async function ensureStore(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(licensesPath);
  } catch {
    await fs.writeFile(licensesPath, "{}", "utf8");
  }
}

async function readAll(): Promise<Record<string, LicenseRecord>> {
  await ensureStore();
  const raw = await fs.readFile(licensesPath, "utf8");
  return JSON.parse(raw) as Record<string, LicenseRecord>;
}

async function writeAll(data: Record<string, LicenseRecord>): Promise<void> {
  await ensureStore();
  await fs.writeFile(licensesPath, JSON.stringify(data, null, 2), "utf8");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function createCheckoutId(): string {
  return crypto.randomBytes(12).toString("hex");
}

export function createLicenseToken(email: string): string {
  const normalized = normalizeEmail(email);
  const payload = `${normalized}:${Date.now()}`;
  const secret = process.env.NEXTAUTH_SECRET ?? "dev-secret";
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyLicenseToken(token: string): string | null {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [email, issuedAt, sig] = raw.split(":");
    if (!email || !issuedAt || !sig) {
      return null;
    }
    const secret = process.env.NEXTAUTH_SECRET ?? "dev-secret";
    const expectedSig = crypto.createHmac("sha256", secret).update(`${email}:${issuedAt}`).digest("hex");
    if (expectedSig !== sig) {
      return null;
    }
    return normalizeEmail(email);
  } catch {
    return null;
  }
}

export async function saveLicense(email: string, checkoutId: string): Promise<LicenseRecord> {
  const normalized = normalizeEmail(email);
  const data = await readAll();
  const existing = data[normalized];
  const record: LicenseRecord = existing ?? {
    email: normalized,
    checkoutId,
    purchasedAt: new Date().toISOString(),
    plan: "starter"
  };
  data[normalized] = record;
  await writeAll(data);
  return record;
}

export async function getLicense(email: string): Promise<LicenseRecord | null> {
  const data = await readAll();
  return data[normalizeEmail(email)] ?? null;
}
