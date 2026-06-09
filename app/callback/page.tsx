"use client";

/**
 * /callback — Web Redirect flow only.
 *
 * This page is NOT triggered during Inline Checkout. With the inline widget,
 * the payment result arrives through the `onComplete` callback in checkout/page.tsx,
 * and navigation is handled by the FSM in paymentSlice.
 *
 * This page exists as a fallback for the Web Redirect integration option,
 * where Interswitch POSTs back to `site_redirect_url` after payment.
 *
 * IMPORTANT: The docs warn that the redirect POST params (resp, amount, txnref)
 * must NOT be trusted to determine outcome — always requery server-side.
 * This page simply forwards to /result which does the real verification.
 *
 * Note: Interswitch sends this as a browser form POST (application/x-www-form-urlencoded),
 * so the params arrive in the POST body, NOT as URL query params. A middleware or
 * server action would be needed to parse them properly. For inline checkout,
 * none of this applies.
 */

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // In the Web Redirect flow, Interswitch POSTs the form back to this URL.
    // However, since Next.js App Router client components can only read GET params,
    // we fall back to sessionStorage to get the txnRef and amount we stored
    // before redirecting — which is safer anyway (avoids trusting the redirect params).
    const txnRef = sessionStorage.getItem("txn_ref");
    const amount = sessionStorage.getItem("txn_amount");

    if (!txnRef || !amount) {
      // No session data — something went wrong, send back to checkout
      router.replace("/checkout");
      return;
    }

    // Forward to /result for server-side verification.
    // We intentionally do NOT forward `resp` from the URL — the requery is authoritative.
    router.replace(`/result?txnref=${txnRef}&amount=${amount}`);
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-600 text-sm">Verifying your payment...</p>
    </main>
  );
}

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
