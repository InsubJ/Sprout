export const ADS_PER_GENERATION_CREDIT = 20;
export const SUPPORT_PAYMENT_USD_CENTS = 500;
export type GenerationCreditEventType =
  | "rewarded_ad_completed"
  | "stripe_payment_verified"
  | "generation_reserved"
  | "generation_consumed"
  | "generation_refunded"
  | "admin_adjustment";
export interface GenerationCreditBalance {
  availableCredits: number;
  verifiedAdsTowardNextCredit: number;
  adsRequiredPerCredit: 20;
  donationRemainderUsdCents: number;
}
