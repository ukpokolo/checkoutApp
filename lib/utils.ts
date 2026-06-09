export function formatToNaira(kobo: number): string{
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
    }).format(kobo/100)
}

/**
 * Generate Interswitch transaction hash for payment integrity
 * Hash = SHA512(txn_ref + merchant_code + amount + secret_key)
 * Required by Interswitch inline checkout to prevent tampering
 */
export function generateInterswitchHash(
  txnRef: string,
  merchantCode: string,
  amount: number,
  secretKey: string
): string {
  const crypto = require("crypto");
  const hashString = `${txnRef}${merchantCode}${amount}${secretKey}`;
  return crypto.createHash("sha512").update(hashString).digest("hex");
}