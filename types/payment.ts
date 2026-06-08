export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    currency: string;
}

export type PaymentWidgetParams = {
    merchant_code: string;
    pay_item_id: string;
    pay_item_name: string;
    txn_ref: string;
    amount: number;
    currency: number;
    cust_email: string;
    cust_name: string;
    site_redirect_url: string;
    mode: "TEST" | "LIVE";
}

export type CallbackParams = {
    txnref: string;
    amount: string;
    resp: string;
    desc: string;
    retRef?: string;
}

export type VerifyResponse = {
    ResponseCode: string;
    ResponseDescription: string;
    Amount: number;
    MerchantReference: string;
    TransactionDate: string;
    PaymentReference: string;
}

export type PaymentStatus = "success" | "failure" | "pending";

// What arrives as query params at /callback
export type CallbackSearchParams = {
  txnref: string;
  amount: string;
  resp: string;
  desc?: string;
  retRef?: string;
};