import { NextRequest, NextResponse } from "next/server";

function generateTxnRef(): string {
  return `TXN-${Date.now()}-${Math.random().toString(36).slice(2).toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, customerEmail, customerName, customerPhone } = body;

    if (!amount || !customerEmail || !customerName || !customerPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const txnRef = generateTxnRef();
    const merchantCode = process.env.INTERSWITCH_MERCHANT_CODE!;

    return NextResponse.json({
      txnRef,
      amount,
      merchantCode,
      payItemId: process.env.INTERSWITCH_PAY_ITEM_ID,
      currency: 566,
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
      customerEmail,
      customerName,
      customerPhone,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
