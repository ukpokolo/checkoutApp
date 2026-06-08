import { VerifyResponse } from "@/types/payment";
import { formatToNaira } from "@/lib/utils";
import Link from "next/link";

type Props = { data: VerifyResponse };

export default function SuccessView({ data }: Props) {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Successful</h1>
        <p className="text-gray-500 text-sm">Your order has been confirmed.</p>

        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-left">
          <div className="flex justify-between">
            <span className="text-gray-500">Amount paid</span>
            <span className="font-semibold text-gray-900">
              {formatToNaira(data.Amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Reference</span>
            <span className="font-mono text-xs text-gray-700">{data.MerchantReference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment ref</span>
            <span className="font-mono text-xs text-gray-700">{data.PaymentReference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span className="text-gray-700">
              {new Date(data.TransactionDate).toLocaleString("en-NG")}
            </span>
          </div>
        </div>

        <Link
          href="/checkout"
          className="block w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
        >
          Back to Shop
        </Link>
      </div>
    </main>
  );
}