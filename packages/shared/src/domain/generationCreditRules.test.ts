import { describe, expect, it } from "vitest";
import {
  creditsFromVerifiedAds,
  generationCreditBalance,
  isQualifyingSupportPayment,
} from "./generationCreditRules";

describe("generation credit rules", () => {
  it("grants one credit for each complete group of twenty verified ads", () => {
    expect(creditsFromVerifiedAds(19)).toBe(0);
    expect(creditsFromVerifiedAds(20)).toBe(1);
    expect(creditsFromVerifiedAds(40)).toBe(2);
  });
  it("accepts USD support payments of at least one dollar", () => {
    expect(isQualifyingSupportPayment(500, "USD")).toBe(true);
    expect(isQualifyingSupportPayment(101, "USD")).toBe(true);
    expect(isQualifyingSupportPayment(100, "USD")).toBe(true);
    expect(isQualifyingSupportPayment(99, "USD")).toBe(false);
    expect(isQualifyingSupportPayment(500, "AUD")).toBe(false);
  });
  it("normalises ad progress without mutating the available balance", () => {
    expect(generationCreditBalance(2, 21)).toEqual({
      availableCredits: 2,
      verifiedAdsTowardNextCredit: 1,
      adsRequiredPerCredit: 20,
      donationRemainderUsdCents: 0,
    });
  });
});
