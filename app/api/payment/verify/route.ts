import { NextRequest, NextResponse } from "next/server";

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

  try {
    const isTest = process.env.NEXT_PUBLIC_INTERSWITCH_ENV === "TEST";
    const passportUrl = isTest
      ? "https://sandbox.interswitchng.com"
      : "https://webpay.interswitchng.com";
    const requeryBase = isTest
      ? "https://sandbox.interswitchng.com"
      : "https://webpay.interswitchng.com";

    // Step 1 — get OAuth token
    const credentials = Buffer.from(
      `${process.env.INTERSWITCH_CLIENT_ID}:${process.env.INTERSWITCH_SECRET_KEY}`
    ).toString("base64");

    const tokenRes = await fetch(`${passportUrl}/passport/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials&scope=profile",
    });

    if (!tokenRes.ok) {
      return NextResponse.json(
        { error: "Failed to get access token" },
        { status: 502 }
      );
    }

    const { access_token } = await tokenRes.json();

    // Step 2 — requery transaction
    const requeryRes = await fetch(
      `${requeryBase}/collections/api/v1/gettransaction.json` +
        `?merchantcode=${process.env.INTERSWITCH_MERCHANT_CODE}` +
        `&transactionreference=${txnRef}` +
        `&amount=${amount}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
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
      amount: data.Amount,
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
