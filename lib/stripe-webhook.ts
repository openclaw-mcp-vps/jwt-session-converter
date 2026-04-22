import crypto from "node:crypto";

type StripeSignature = {
  timestamp: number;
  signatures: string[];
};

export type StripeLikeEvent = {
  id: string;
  type: string;
  created: number;
  data: {
    object: Record<string, unknown>;
  };
};

function parseStripeSignatureHeader(signatureHeader: string): StripeSignature | null {
  const chunks = signatureHeader.split(",");
  let timestamp = 0;
  const signatures: string[] = [];

  for (const chunk of chunks) {
    const [key, value] = chunk.split("=");
    if (!key || !value) {
      continue;
    }

    if (key === "t") {
      timestamp = Number(value);
    }

    if (key === "v1") {
      signatures.push(value);
    }
  }

  if (!timestamp || signatures.length === 0) {
    return null;
  }

  return { timestamp, signatures };
}

function timingSafeCompareHex(leftHex: string, rightHex: string) {
  const left = Buffer.from(leftHex, "hex");
  const right = Buffer.from(rightHex, "hex");

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

export function verifyStripeWebhookSignature(
  payload: string,
  signatureHeader: string,
  webhookSecret: string,
  toleranceInSeconds = 300
) {
  const parsed = parseStripeSignatureHeader(signatureHeader);
  if (!parsed) {
    return false;
  }

  const age = Math.floor(Date.now() / 1000) - parsed.timestamp;
  if (Math.abs(age) > toleranceInSeconds) {
    return false;
  }

  const signedPayload = `${parsed.timestamp}.${payload}`;
  const expected = crypto.createHmac("sha256", webhookSecret).update(signedPayload, "utf8").digest("hex");

  return parsed.signatures.some((signature) => timingSafeCompareHex(signature, expected));
}

export function extractStripeCheckoutEmail(event: StripeLikeEvent) {
  const object = event.data.object;

  const customerDetails = object.customer_details as { email?: string } | undefined;
  const email =
    customerDetails?.email ||
    (object.customer_email as string | undefined) ||
    (object.receipt_email as string | undefined);

  return email?.toLowerCase().trim() ?? null;
}
