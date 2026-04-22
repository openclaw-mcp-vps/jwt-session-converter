import Link from "next/link";

import { UnlockForm } from "@/components/UnlockForm";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Unlock Access"
};

export default function UnlockPage() {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-[#9ecdf0]">
          jwt-session-converter
        </Link>
        <a href={paymentLink ?? ""} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Buy Access
        </a>
      </div>

      <div className="mt-12">
        <UnlockForm />
      </div>

      <p className="mx-auto mt-6 max-w-xl text-center text-sm text-[#8ea3b8]">
        If your payment was completed in the last minute, wait for the webhook to arrive and retry unlock.
      </p>
    </main>
  );
}
