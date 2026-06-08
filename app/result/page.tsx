"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useVerifyPaymentQuery } from "@/store/api/paymentApi";
import { useAppDispatch } from "@/store/hooks";
import { setVerifyResult, setFailed } from "@/store/slices/paymentSlice";
import SuccessView from "@/components/result/SuccessView";
import FailureView from "@/components/result/FailureView";
import PendingView from "@/components/result/PendingView";

function ResultHandler() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const txnref = searchParams.get("txnref");
  const amount = searchParams.get("amount");
  const reason = searchParams.get("reason"); // set by /callback on tamper

  // Check for missing required params
  const hasRequiredParams = !!txnref && !!amount;

  // Skip verify query when tamper was detected or params missing
  const shouldSkip = !!reason || !hasRequiredParams;

  const { data, isLoading, isError } = useVerifyPaymentQuery(
    { txnRef: txnref ?? "", amount: Number(amount ?? 0) },
    { skip: shouldSkip }
  );

  // Sync RTK Query result into the payment FSM slice
  useEffect(() => {
    if (data) {
      dispatch(
        setVerifyResult({
          responseCode: data.responseCode,
          message: data.message,
        })
      );
    }
    if (isError) {
      dispatch(setFailed("Verification failed. Please contact support."));
    }
  }, [data, isError, dispatch]);

  // Missing required params - show failure immediately without flickering
  if (!hasRequiredParams && !reason) {
    return (
      <FailureView
        reason="Invalid payment session. Missing transaction reference or amount."
        txnref=""
      />
    );
  }

  // Tamper detected upstream in /callback
  if (reason) {
    return <FailureView reason={reason} txnref={txnref ?? ""} />;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 text-sm">Confirming your payment...</p>
      </main>
    );
  }

  if (isError || !data) {
    return <FailureView reason="verification_error" txnref={txnref ?? ""} />;
  }

  if (data.status === "success") {
    // Build VerifyResponse shape for SuccessView from what we have
    return (
      <SuccessView
        data={{
          ResponseCode: data.responseCode,
          ResponseDescription: data.message,
          Amount: data.amount,
          MerchantReference: data.txnRef,
          PaymentReference: data.txnRef,
          TransactionDate: new Date().toISOString(),
        }}
      />
    );
  }

  if (data.status === "cancelled") {
    return <FailureView reason="Payment was cancelled." txnref={txnref ?? ""} />;
  }

  // Check for pending (responseCode Z6)
  if (data.responseCode === "Z6") {
    return <PendingView txnref={txnref ?? ""} />;
  }

  return <FailureView reason={data.message} txnref={txnref ?? ""} />;
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <ResultHandler />
    </Suspense>
  );
}
