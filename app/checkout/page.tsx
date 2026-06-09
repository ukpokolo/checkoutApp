"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getProductById, DEFAULT_PRODUCT_ID } from "@/lib/data/products";
import { formatToNaira } from "@/lib/utils";
import OrderSummary from "@/components/checkout/OrderSummary";
import { CustomerForm, CustomerData } from "@/components/checkout/CustomerForm";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setInitiating,
  setProcessing,
  sdkCompleted,
  setFailed,
  resetPayment,
} from "@/store/slices/paymentSlice";
import { useInitPaymentMutation } from "@/store/api/paymentApi";
import { useInterswitch } from "@/hooks/useInterswitch";

declare global {
  interface Window {
    webpayCheckout: (request: object) => void;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const paymentStatus = useAppSelector((state) => state.payment.status);
  const isInitialMount = useRef(true);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);

  const product = getProductById(DEFAULT_PRODUCT_ID);
  const [initPayment, { isLoading: isInitiating }] = useInitPaymentMutation();

  // Load the Interswitch inline-checkout.js script
  useInterswitch();

  // Reset payment state when landing on checkout (prevents redirect loops from failed payments)
  useEffect(() => {
    dispatch(resetPayment());
  }, [dispatch]);

  // FSM-driven navigation — same pattern as luxe2
  useEffect(() => {
    // Skip redirect on initial mount to allow state reset to complete
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (paymentStatus === "verifying") {
      const txnRef = sessionStorage.getItem("txn_ref");
      const amount = sessionStorage.getItem("txn_amount");
      if (txnRef && amount) {
        router.push(`/result?txnref=${txnRef}&amount=${amount}`);
      }
    }
    if (paymentStatus === "cancelled" || paymentStatus === "failed") {
      const txnRef = sessionStorage.getItem("txn_ref");
      const amount = sessionStorage.getItem("txn_amount");
      if (txnRef && amount) {
        router.push(`/result?txnref=${txnRef}&amount=${amount}`);
      } else {
        router.push("/result?ref=none");
      }
    }
  }, [paymentStatus, router]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Product not found.</p>
      </div>
    );
  }

  async function handleFormSubmit(data: CustomerData) {
    setCustomerData(data);
    await initiatePayment(data);
  }

  async function initiatePayment(customer: CustomerData) {
    if (!product) return;

    dispatch(setInitiating());

    try {
      const result = await initPayment({
        amount: product.price,
        customerEmail: customer.email,
        customerName: customer.name,
        customerPhone: customer.phone,
      }).unwrap();

      dispatch(setProcessing({ txnRef: result.txnRef, amount: result.amount }));

      sessionStorage.setItem("txn_ref", result.txnRef);
      sessionStorage.setItem("txn_amount", String(result.amount));

      window.webpayCheckout({
        merchant_code: result.merchantCode,
        pay_item_id: result.payItemId,
        pay_item_name: product.name,
        txn_ref: result.txnRef,
        amount: result.amount,
        currency: result.currency,
        cust_email: result.customerEmail,
        cust_name: result.customerName,
        cust_mobile_no: result.customerPhone,
        site_redirect_url: result.redirectUrl,
        mode: process.env.NEXT_PUBLIC_INTERSWITCH_ENV === "TEST" ? "TEST" : "LIVE",
        onComplete: (response: { responseCode: string; txnref: string }) => {
          sessionStorage.setItem("txn_ref", response.txnref);
          dispatch(
            sdkCompleted({
              responseCode: response.responseCode,
              txnRef: response.txnref,
            })
          );
        },
        onClose: () => {
          // User closed modal without completing — go back to idle
            dispatch(setFailed("Payment cancelled by user."));
        },
      });
    } catch {
      dispatch(setFailed("Could not initiate payment. Please try again."));
    }
  }

  const isProcessing = isInitiating || paymentStatus === "initiating" || paymentStatus === "processing";

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review your order and enter your details
        </p>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Order Summary */}
        <OrderSummary product={product} />

        {/* Customer Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Customer Details
          </h2>
          <CustomerForm
            onSubmit={handleFormSubmit}
            isLoading={isProcessing}
          />
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Secured by Interswitch. Your payment info is encrypted.
      </p>
    </main>
  );
}
