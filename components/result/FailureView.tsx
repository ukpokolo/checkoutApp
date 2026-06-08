import Link from "next/link";

type Props = {
  reason: string;
  txnref: string;
};

const reasonMessages: Record<string, string> = {
  ref_mismatch: "Transaction reference mismatch. This payment cannot be verified.",
  amount_mismatch: "Payment amount does not match. This payment cannot be verified.",
  verification_error: "We could not reach the payment server. Please contact support.",
};

export default function FailureView({ reason, txnref }: Props) {
  const message = reasonMessages[reason] ?? reason ?? "Your payment was not successful.";

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
        <p className="text-gray-500 text-sm">{message}</p>

        {txnref && (
          <p className="text-xs text-gray-400 font-mono">Ref: {txnref}</p>
        )}

        <Link
          href="/checkout"
          className="block w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
        >
          Try Again
        </Link>
      </div>
    </main>
  );
}