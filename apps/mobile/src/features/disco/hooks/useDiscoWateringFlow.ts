import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import * as Linking from "expo-linking";
import { useAuth } from "../../../providers/AuthProvider";
import { useServices } from "../../../providers/ServicesProvider";

export type DiscoWateringStep = "choice" | "ad" | "donation" | "thank-you";
export interface DiscoWateringFlowState {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  step: DiscoWateringStep;
  setStep: Dispatch<SetStateAction<DiscoWateringStep>>;
  donationAmount: string;
  setDonationAmount: Dispatch<SetStateAction<string>>;
  donation: number;
  donationValid: boolean;
  busy: boolean;
  error: string | null;
  completeAd: () => Promise<void>;
  completeDonation: () => Promise<void>;
  complete: () => Promise<void>;
}

export async function applyCompletedDiscoReward(
  action: () => Promise<boolean>,
  onWater: () => Promise<void>,
  onRewardRecorded: () => Promise<void>,
): Promise<boolean> {
  const completed = await action();
  if (!completed) return false;
  await onWater();
  await onRewardRecorded();
  return true;
}

export function useDiscoWateringFlow(
  onWater: () => Promise<void>,
  onRewardRecorded: () => Promise<void>,
): DiscoWateringFlowState {
  const { user } = useAuth();
  const { rewardedAds, supportPayments } = useServices();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<DiscoWateringStep>("choice");
  const [donationAmount, setDonationAmount] = useState("0.00");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) return;
    const timer = setTimeout(() => {
      setStep("choice");
      setDonationAmount("0.00");
      setError(null);
    }, 250);
    return () => clearTimeout(timer);
  }, [open]);
  const donation = Number.parseFloat(donationAmount);
  const donationValid = Number.isFinite(donation) && donation >= 1;
  const requireUser = (): string => {
    if (!user) throw new Error("Sign in to earn generation rewards");
    return user.id;
  };
  const runReward = async (action: () => Promise<boolean>): Promise<void> => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const completed = await applyCompletedDiscoReward(action, onWater, onRewardRecorded);
      if (!completed) return;
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to record reward");
    } finally {
      setBusy(false);
    }
  };
  const completeAd = async (): Promise<void> =>
    runReward(async () => {
      await rewardedAds.completeRewardedAd(requireUser());
      return true;
    });
  const completeDonation = async (): Promise<void> =>
    runReward(async () => {
      const result = await supportPayments.createCheckout(
        Math.round(donation * 100),
        requireUser(),
      );
      if (result.checkoutUrl) await Linking.openURL(result.checkoutUrl);
      return result.completed;
    });
  const complete = async (): Promise<void> => {
    if (busy) return;
    setBusy(true);
    try {
      await onWater();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };
  return {
    open,
    setOpen,
    step,
    setStep,
    donationAmount,
    setDonationAmount,
    donation,
    donationValid,
    busy,
    error,
    completeAd,
    completeDonation,
    complete,
  };
}
