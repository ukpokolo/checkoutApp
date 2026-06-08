import Link from "next/link";

type Props = { txnref: string };

export default function PendingView({ txnref }: Props) {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md text-center space-y-4">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Pending</h1>
        <p className="text-gray-500 text-sm">
          Your payment is being processed. This can take a few minutes.
          Please do not close this page or make another payment.
        </p>

        {txnref && (
          <p className="text-xs text-gray-400 font-mono">Ref: {txnref}</p>
        )}

        <Link
          href="/checkout"
          className="block w-full mt-4 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </main>
  );
}