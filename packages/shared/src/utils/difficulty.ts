import { DifficultyTier, HabitFrequency } from "../types/habit";
import { PlantSpecies } from "../types/plant";

/**
 * Frequency Multiplier table for plants.
 * More frequent waterings or flexible requirements increase the difficulty score.
 */
export const FREQUENCY_MULTIPLIERS: Record<HabitFrequency, number> = {
  twice_daily: 2.5,
  daily: 2.0,
  weekly: 1.5,
  fortnightly: 1.25,
  monthly: 1.0,
  yearly: 0.5,
  flexible: 1.8,
};

/**
 * Species mapping for each difficulty tier.
 */
export const TIER_SPECIES: Record<DifficultyTier, PlantSpecies[]> = {
  common: ["pothos", "spider_plant", "jason", "bonsai", "maranta_leuconeura", "lavender"],
  uncommon: [
    "sunflower",
    "alocasia_tiny_dancer",
    "remy",
    "waratah",
    "phalaenopsis_scarlett_jubilee",
    "sprig_plant",
  ],
  rare: [
    "midnight_rose",
    "desert_cactus",
    "string_of_pearls",
    "begonia_maculata",
    "poinsettia",
    "blossom",
  ],
  mythical: ["golden_oak", "ethereal_sakura"],
};

/**
 * Input contract for difficulty calculation.
 */
export interface DifficultyCalculationInput {
  frequency: HabitFrequency;
  wither_threshold: number;
  target_waterings: number;
}

/**
 * Calculates difficulty score using formula:
 * Score = Frequency Multiplier * (1 / Wither Threshold) * Math.log(Target Waterings)
 *
 * Preconditions:
 * - wither_threshold must be greater than 0
 * - target_waterings must be greater than 0
 * - frequency must be a valid HabitFrequency
 *
 * Postcondition:
 * - Returns a non-negative number representing the difficulty score
 */
export function calculateDifficultyScore(input: DifficultyCalculationInput): number {
  const { frequency, wither_threshold, target_waterings } = input;

  // Preconditions validation
  if (typeof wither_threshold !== "number" || isNaN(wither_threshold) || wither_threshold <= 0) {
    throw new Error("Precondition failed: wither_threshold must be a positive number");
  }

  if (typeof target_waterings !== "number" || isNaN(target_waterings) || target_waterings <= 0) {
    throw new Error("Precondition failed: target_waterings must be a positive number");
  }

  const multiplier = FREQUENCY_MULTIPLIERS[frequency];
  if (multiplier === undefined) {
    throw new Error(`Precondition failed: invalid frequency '${frequency}'`);
  }

  // Calculate difficulty score
  const score = multiplier * (1 / wither_threshold) * Math.log(target_waterings);

  // Guard against negative score (e.g. if target_waterings is between 0 and 1, Math.log is negative)
  return Math.max(0, score);
}

/**
 * Maps a difficulty score to a DifficultyTier.
 *
 * Preconditions:
 * - score must be non-negative
 *
 * Postcondition:
 * - Returns one of the valid DifficultyTier values ('common', 'uncommon', 'rare', 'mythical')
 */
export function mapScoreToTier(score: number): DifficultyTier {
  if (typeof score !== "number" || isNaN(score) || score < 0) {
    throw new Error("Precondition failed: score must be a non-negative number");
  }

  if (score < 1.0) {
    return "common";
  } else if (score < 2.0) {
    return "uncommon";
  } else if (score < 4.0) {
    return "rare";
  } else {
    return "mythical";
  }
}

/**
 * Convenience function to directly get DifficultyTier from calculation input.
 */
export function getDifficultyTier(input: DifficultyCalculationInput): DifficultyTier {
  const score = calculateDifficultyScore(input);
  return mapScoreToTier(score);
}

/**
 * Returns the list of possible species for a given difficulty tier.
 */
export function getSpeciesForTier(tier: DifficultyTier): PlantSpecies[] {
  const species = TIER_SPECIES[tier];
  if (!species) {
    throw new Error(`Precondition failed: invalid difficulty tier '${tier}'`);
  }
  return [...species];
}

/**
 * Assigns a species for a given tier. If index is provided, chooses deterministically;
 * otherwise chooses a random species from the list.
 */
export function assignSpecies(tier: DifficultyTier, index?: number): PlantSpecies {
  const speciesList = getSpeciesForTier(tier);
  if (index !== undefined) {
    if (!Number.isInteger(index) || index < 0) {
      throw new Error("Precondition failed: index must be a non-negative integer");
    }
    return speciesList[index % speciesList.length];
  }
  const randomIndex = Math.floor(Math.random() * speciesList.length);
  return speciesList[randomIndex];
}

/**
 * Resolves the DifficultyTier of a given PlantSpecies.
 *
 * Preconditions:
 * - species must be a valid PlantSpecies
 *
 * Postcondition:
 * - Returns one of the valid DifficultyTier values
 */
export function getTierForSpecies(species: PlantSpecies): DifficultyTier {
  if (!species) {
    throw new Error("Precondition failed: species is required");
  }
  for (const [tier, list] of Object.entries(TIER_SPECIES)) {
    if (list.includes(species)) {
      return tier as DifficultyTier;
    }
  }
  throw new Error(`Precondition failed: species '${species}' is not registered under any tier`);
}
