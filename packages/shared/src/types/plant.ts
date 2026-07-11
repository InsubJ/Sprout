/**
 * Domain types for Sprout's plant rendering system.
 * Mirrors the relevant columns on the `habits` table.
 *
 * This file must only contain type/interface declarations.
 * Computation belongs in utils/, not here.
 */

export type HabitStatus = "healthy" | "withered" | "completed";

export type DifficultyTier = "common" | "uncommon" | "rare" | "mythical";

export type PlantSpecies =
  | "pothos"
  | "spider_plant"
  | "bonsai"
  | "lavender"
  | "sunflower"
  | "midnight_rose"
  | "desert_cactus"
  | "golden_oak"
  | "ethereal_sakura"
  | "maranta_leuconeura"
  | "alocasia_tiny_dancer"
  | "string_of_pearls"
  | "begonia_maculata"
  | "phalaenopsis_scarlett_jubilee"
  | "waratah"
  | "poinsettia"
  | "jason"
  | "remy"
  | "blossom"
  | "sprig_plant";

export type FinalVariant = "flawless" | "steady" | "scarred";

export interface PlantProps {
  /** habit.current_waterings. Precondition: >= 0. */
  currentWaterings: number;
  /** habit.target_waterings. Precondition: > 0. */
  targetWaterings: number;
  /** habit.wither_count â€” total times withered during growth. Precondition: >= 0. */
  witherCount: number;
  /** habit.status */
  status: HabitStatus;
  /** Rendered width/height in px */
  size?: number;
}

/** Derived, species-agnostic growth state used by every plant renderer. */
export interface GrowthState {
  growthPercent: number;
  isWithered: boolean;
  isCompleted: boolean;
  finalVariant: FinalVariant;
  asymmetry: number;
}


