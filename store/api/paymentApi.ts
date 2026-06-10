import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface InitPaymentArgs {
  amount: number;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
}

interface InitPaymentResult {
  txnRef: string;
  amount: number;
  merchantCode: string;
  payItemId: string;
  currency: number;
  redirectUrl: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
}

interface VerifyPaymentResult {
  status: "success" | "failed" | "cancelled";
  txnRef: string;
  amount: number;
  responseCode: string;
  message: string;
  merchantReference?: string;
  paymentReference?: string;
  transactionDate?: string;
}

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/payment" }),
  keepUnusedDataFor: 30,
  endpoints: (builder) => ({
    initPayment: builder.mutation<InitPaymentResult, InitPaymentArgs>({
      query: (body) => ({
        url: "/init",
        method: "POST",
        body,
      }),
    }),
    verifyPayment: builder.query<
      VerifyPaymentResult,
      { txnRef: string; amount: number }
    >({
      query: ({ txnRef, amount }) =>
        `/verify?txnRef=${txnRef}&amount=${amount}`,
    }),
  }),
});

export const { useInitPaymentMutation, useVerifyPaymentQuery } = paymentApi;
