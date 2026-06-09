"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const txnref = searchParams.get("txnref");
    const amount = searchParams.get("amount");
    const resp = searchParams.get("resp");

    // Basic guard — if nothing came back, go home
    if (!txnref) {
      router.replace("/checkout");
      return;
    }

    // Cross-check txnref against what we stored before redirecting to Interswitch
    const storedTxnref = sessionStorage.getItem("txn_ref");
    const storedAmount = sessionStorage.getItem("txn_amount");

    if (txnref !== storedTxnref) {
      // txnref mismatch — possible tamper or stale session
      router.replace("/result?status=failure&reason=ref_mismatch");
      return;
    }

    if (amount !== storedAmount) {
      // Amount mismatch — flag it
      router.replace("/result?status=failure&reason=amount_mismatch");
      return;
    }

    // Everything looks consistent — pass to /result for server-side verification
    // We do NOT trust resp here. /result will requery Interswitch to confirm.
    router.replace(`/result?txnref=${txnref}&amount=${amount}&resp=${resp ?? ""}`);
  }, [searchParams, router]);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-600 text-sm">Verifying your payment...</p>
    </main>
  );
}

// useSearchParams must be wrapped in Suspense in Next.js App Router
export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}