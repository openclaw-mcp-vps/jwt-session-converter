import { promises as fs } from "node:fs";
import path from "node:path";

import type { PurchaseRecord } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "purchases.json");

type PurchaseStore = {
  purchases: PurchaseRecord[];
};

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    const initial: PurchaseStore = { purchases: [] };
    await fs.writeFile(STORE_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readStore(): Promise<PurchaseStore> {
  await ensureStore();
  const raw = await fs.readFile(STORE_PATH, "utf8");
  try {
    return JSON.parse(raw) as PurchaseStore;
  } catch {
    return { purchases: [] };
  }
}

async function writeStore(data: PurchaseStore) {
  await ensureStore();
  const tempPath = `${STORE_PATH}.${Date.now()}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tempPath, STORE_PATH);
}

export async function recordPurchase(record: PurchaseRecord) {
  const store = await readStore();
  const normalizedEmail = record.email.trim().toLowerCase();

  const duplicate = store.purchases.some((purchase) => {
    if (record.checkoutSessionId && purchase.checkoutSessionId) {
      return purchase.checkoutSessionId === record.checkoutSessionId;
    }

    return purchase.email === normalizedEmail && purchase.eventType === record.eventType;
  });

  if (duplicate) {
    return;
  }

  store.purchases.push({
    ...record,
    email: normalizedEmail
  });

  store.purchases.sort((left, right) => (left.purchasedAt > right.purchasedAt ? -1 : 1));
  await writeStore(store);
}

export async function findPurchaseByEmail(email: string) {
  const store = await readStore();
  const normalizedEmail = email.trim().toLowerCase();

  return store.purchases.find((purchase) => purchase.email === normalizedEmail) ?? null;
}
