import { useState, type Dispatch, type SetStateAction } from "react";
import type { HabitFrequency } from "@sprout/shared";

export interface HabitFormInput {
  name: string;
  description: string;
  frequency: HabitFrequency;
  target_waterings: number;
  wither_threshold: number;
  is_public: boolean;
  hide_name: boolean;
  hide_description: boolean;
  share_name_friends: string[];
  share_desc_friends: string[];
  flexible_rules?: { days_required: number; days_total: number } | null;
}
export type HabitFormField = "name" | "target" | "witherThreshold" | "daysRequired" | "daysTotal";
export type HabitFormErrors = Partial<Record<HabitFormField, string>>;
type Setter<T> = Dispatch<SetStateAction<T>>;
export interface HabitFormState {
  name: string;
  setName: Setter<string>;
  description: string;
  setDescription: Setter<string>;
  target: string;
  setTarget: Setter<string>;
  frequency: HabitFrequency;
  setFrequency: Setter<HabitFrequency>;
  witherThreshold: string;
  setWitherThreshold: Setter<string>;
  daysRequired: string;
  setDaysRequired: Setter<string>;
  daysTotal: string;
  setDaysTotal: Setter<string>;
  isPublic: boolean;
  setIsPublic: Setter<boolean>;
  hideName: boolean;
  setHideName: Setter<boolean>;
  hideDescription: boolean;
  setHideDescription: Setter<boolean>;
  shareNameFriends: string[];
  setShareNameFriends: Setter<string[]>;
  shareDescFriends: string[];
  setShareDescFriends: Setter<string[]>;
  fieldErrors: HabitFormErrors;
  submitError: string | null;
  setSubmitError: Setter<string | null>;
  clearError: (field: HabitFormField) => void;
  validate: () => { input: HabitFormInput | null; errors: HabitFormErrors };
  reset: () => void;
}

export function useHabitForm(): HabitFormState {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("30");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [witherThreshold, setWitherThreshold] = useState("3");
  const [daysRequired, setDaysRequired] = useState("3");
  const [daysTotal, setDaysTotal] = useState("7");
  const [isPublic, setIsPublic] = useState(true);
  const [hideName, setHideName] = useState(false);
  const [hideDescription, setHideDescription] = useState(false);
  const [shareNameFriends, setShareNameFriends] = useState<string[]>([]);
  const [shareDescFriends, setShareDescFriends] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<HabitFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const validate = (): { input: HabitFormInput | null; errors: HabitFormErrors } => {
    const parsedTarget = Number(target);
    const parsedWither = Number(witherThreshold);
    const required = Number(daysRequired);
    const total = Number(daysTotal);
    const errors: HabitFormErrors = {};
    if (!name.trim()) errors.name = "Give your new habit a name";
    if (!Number.isInteger(parsedTarget) || parsedTarget < 1)
      errors.target = "Enter a positive whole number";
    if (!Number.isInteger(parsedWither) || parsedWither < 1)
      errors.witherThreshold = "Enter a positive whole number";
    if (frequency === "flexible") {
      if (!Number.isInteger(required) || required < 1) errors.daysRequired = "Enter at least 1 day";
      if (!Number.isInteger(total) || total < 1) errors.daysTotal = "Enter at least 1 day";
      if (!errors.daysRequired && !errors.daysTotal && required > total)
        errors.daysRequired = "Must not exceed total days";
    }
    setFieldErrors(errors);
    setSubmitError(null);
    if (Object.keys(errors).length) return { input: null, errors };
    return {
      input: {
        name: name.trim(),
        description: description.trim(),
        frequency,
        target_waterings: parsedTarget,
        wither_threshold: parsedWither,
        is_public: isPublic,
        hide_name: hideName,
        hide_description: hideDescription,
        share_name_friends: shareNameFriends,
        share_desc_friends: shareDescFriends,
        flexible_rules:
          frequency === "flexible" ? { days_required: required, days_total: total } : null,
      },
      errors,
    };
  };
  const clearError = (field: HabitFormField): void =>
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  const reset = (): void => {
    setName("");
    setDescription("");
    setTarget("30");
    setFrequency("daily");
    setWitherThreshold("3");
    setDaysRequired("3");
    setDaysTotal("7");
    setIsPublic(true);
    setHideName(false);
    setHideDescription(false);
    setShareNameFriends([]);
    setShareDescFriends([]);
    setFieldErrors({});
    setSubmitError(null);
  };
  return {
    name,
    setName,
    description,
    setDescription,
    target,
    setTarget,
    frequency,
    setFrequency,
    witherThreshold,
    setWitherThreshold,
    daysRequired,
    setDaysRequired,
    daysTotal,
    setDaysTotal,
    isPublic,
    setIsPublic,
    hideName,
    setHideName,
    hideDescription,
    setHideDescription,
    shareNameFriends,
    setShareNameFriends,
    shareDescFriends,
    setShareDescFriends,
    fieldErrors,
    submitError,
    setSubmitError,
    clearError,
    validate,
    reset,
  };
}
