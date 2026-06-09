export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // in kobo (minor units)
  image: string;
  currency: string;
};

export type PaymentWidgetParams = {
  merchant_code: string;
  pay_item_id: string;
  pay_item_name: string;
  txn_ref: string;
  amount: number; // in kobo (minor units)
  currency: number; // ISO 4217 numeric e.g. 566
  cust_email: string;
  cust_name: string;
  cust_mobile_no?: string;
  site_redirect_url: string;
  mode: "TEST" | "LIVE";
  onComplete: (response: ISWCallbackResponse) => void;
  onClose: () => void;
};

/**
 * Shape returned by the Interswitch inline widget's onComplete callback.
 * Key difference from what many assume: the response code field is `resp`,
 * NOT `responseCode`. `txnref` is also all lowercase.
 */
export type ISWCallbackResponse = {
  resp: string;      // response code e.g. "00" for success
  txnref: string;    // transaction reference (all lowercase)
  amount?: string;   // amount in kobo, as a string
  desc?: string;     // human-readable status description
};

export type VerifyResponse = {
  ResponseCode: string;
  ResponseDescription: string;
  Amount: number;
  MerchantReference: string;
  TransactionDate: string;
  PaymentReference: string;
};

export type PaymentStatus = "success" | "failure" | "pending";

// What arrives as query params at /callback (Web Redirect flow only)
export type CallbackSearchParams = {
  txnref: string;
  amount: string;
  resp: string;
  desc?: string;
  retRef?: string;
};
