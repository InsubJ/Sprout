import {
  ADS_PER_GENERATION_CREDIT,
  SUPPORT_PAYMENT_USD_CENTS,
  type GenerationCreditBalance,
} from "../types/generationCredit";
export function creditsFromVerifiedAds(count: number): number {
  if (!Number.isInteger(count) || count < 0)
    throw new Error("Verified ad count must be a non-negative integer");
  return Math.floor(count / ADS_PER_GENERATION_CREDIT);
}
export function isQualifyingSupportPayment(amountUsdCents: number, currency: string): boolean {
  return (
    Number.isInteger(amountUsdCents) && amountUsdCents >= 100 && currency.toLowerCase() === "usd"
  );
}
export function generationCreditBalance(
  ledgerBalance: number,
  uncreditedVerifiedAds: number,
  donationRemainderUsdCents = 0,
): GenerationCreditBalance {
  if (
    !Number.isInteger(ledgerBalance) ||
    ledgerBalance < 0 ||
    !Number.isInteger(uncreditedVerifiedAds) ||
    uncreditedVerifiedAds < 0 ||
    !Number.isInteger(donationRemainderUsdCents) ||
    donationRemainderUsdCents < 0
  )
    throw new Error("Credit state cannot be negative or fractional");
  return {
    availableCredits: Math.min(5, ledgerBalance),
    verifiedAdsTowardNextCredit: uncreditedVerifiedAds % ADS_PER_GENERATION_CREDIT,
    adsRequiredPerCredit: ADS_PER_GENERATION_CREDIT,
    donationRemainderUsdCents: donationRemainderUsdCents % SUPPORT_PAYMENT_USD_CENTS,
  };
}
