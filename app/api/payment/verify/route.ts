import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/data/products";

interface ISWTransactionResponse {
  Amount: number;
  ResponseCode: string;
  ResponseDescription: string;
  MerchantReference: string;
  PaymentReference: string;
  TransactionDate: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const txnRef = searchParams.get("txnRef");
  const amount = searchParams.get("amount");

  if (!txnRef || !amount) {
    return NextResponse.json(
      { error: "txnRef and amount are required" },
      { status: 400 }
    );
  }

  const claimedAmount = Number(amount);
  if (isNaN(claimedAmount) || claimedAmount <= 0) {
    return NextResponse.json(
      { error: "Invalid amount" },
      { status: 400 }
    );
  }

  try {
    const isTest = process.env.NEXT_PUBLIC_INTERSWITCH_ENV === "TEST";
    const requeryBase = isTest
      ? "https://sandbox.interswitchng.com"
      : "https://webpay.interswitchng.com";

    const requeryRes = await fetch(
      `${requeryBase}/collections/api/v1/gettransaction.json` +
        `?merchantcode=${process.env.INTERSWITCH_MERCHANT_CODE}` +
        `&transactionreference=${txnRef}` +
        `&amount=${claimedAmount}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!requeryRes.ok) {
      return NextResponse.json(
        { error: "Requery request failed" },
        { status: 502 }
      );
    }

    const data: ISWTransactionResponse = await requeryRes.json();
    const responseCode = data.ResponseCode ?? "XX";

    // Step 3 — server-side amount validation.
    // Compare what Interswitch says was charged against every known product price.
    // This prevents a client from passing a manipulated amount in the query string
    // to unlock value for a lower payment.
    const returnedAmount = data.Amount;
    const knownPrices = products.map((p) => p.price);
    const amountIsValid = knownPrices.includes(returnedAmount);

    if (!amountIsValid) {
      console.error("Amount mismatch — possible tampering:", {
        returnedAmount,
        knownPrices,
        txnRef,
      });
      return NextResponse.json(
        {
          status: "failed",
          txnRef,
          amount: returnedAmount,
          responseCode: "XX",
          message: "Amount mismatch. Transaction could not be verified.",
        },
        { status: 200 } // 200 so the client FSM handles it gracefully
      );
    }

    let status: "success" | "failed" | "cancelled";
    if (responseCode === "00") {
      status = "success";
    } else if (responseCode === "09" || responseCode === "021") {
      status = "cancelled";
    } else {
      status = "failed";
    }

    return NextResponse.json({
      status,
      txnRef,
      amount: returnedAmount,
      responseCode,
      message: data.ResponseDescription ?? "Unknown",
    });
  } catch {
    return NextResponse.json(
      {
        error: "Internal server error",
        status: "failed",
        responseCode: "XX",
        message: "Network error during verification",
      },
      { status: 500 }
    );
  }
}
