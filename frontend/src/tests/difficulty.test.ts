import { describe, it, expect } from 'vitest';
import {
  FREQUENCY_MULTIPLIERS,
  TIER_SPECIES,
  calculateDifficultyScore,
  mapScoreToTier,
  getDifficultyTier,
  getSpeciesForTier,
  assignSpecies,
  RECOMMENDED_SPECIES_FREQUENCIES,
  getRecommendedFrequencyForSpecies
} from '../utils/difficulty';
import { PlantSpecies } from '../types/plant';
import { DifficultyTier, HabitFrequency } from '../types/habit';

describe('Difficulty Utility (difficulty.ts)', () => {
  describe('calculateDifficultyScore', () => {
    it('should correctly calculate difficulty score based on formula', () => {
      // Score = Frequency Multiplier * (1 / Wither Threshold) * Math.log(Target Waterings)
      // daily = 2.0, wither_threshold = 2, target_waterings = 10
      // 2.0 * (1 / 2) * Math.log(10) = 1.0 * 2.302585 = 2.302585
      const score = calculateDifficultyScore({
        frequency: 'daily',
        wither_threshold: 2,
        target_waterings: 10,
      });
      expect(score).toBeCloseTo(Math.log(10), 5);
    });

    it('should return 0 or positive values even if log(Target Waterings) is negative (e.g. target_waterings < 1)', () => {
      // In practice target_waterings should be >= 1, but if it's 0.5, log(0.5) is negative.
      // The function must clamp it to 0.
      const score = calculateDifficultyScore({
        frequency: 'daily',
        wither_threshold: 2,
        target_waterings: 0.5,
      });
      expect(score).toBe(0);
    });

    it('should throw an error if wither_threshold is negative or zero (Precondition)', () => {
      expect(() => calculateDifficultyScore({
        frequency: 'daily',
        wither_threshold: 0,
        target_waterings: 10
      })).toThrow('Precondition failed');

      expect(() => calculateDifficultyScore({
        frequency: 'daily',
        wither_threshold: -1,
        target_waterings: 10
      })).toThrow('Precondition failed');
    });

    it('should throw an error if target_waterings is negative or zero (Precondition)', () => {
      expect(() => calculateDifficultyScore({
        frequency: 'daily',
        wither_threshold: 2,
        target_waterings: 0
      })).toThrow('Precondition failed');

      expect(() => calculateDifficultyScore({
        frequency: 'daily',
        wither_threshold: 2,
        target_waterings: -5
      })).toThrow('Precondition failed');
    });

    it('should throw an error if frequency is invalid (Precondition)', () => {
      expect(() => calculateDifficultyScore({
        frequency: 'invalid_freq' as HabitFrequency,
        wither_threshold: 2,
        target_waterings: 10
      })).toThrow('Precondition failed');
    });
  });

  describe('mapScoreToTier', () => {
    it('should correctly map score to common (< 1.0)', () => {
      expect(mapScoreToTier(0.0)).toBe('common');
      expect(mapScoreToTier(0.99)).toBe('common');
    });

    it('should correctly map score to uncommon (1.0 <= score < 2.0)', () => {
      expect(mapScoreToTier(1.0)).toBe('uncommon');
      expect(mapScoreToTier(1.99)).toBe('uncommon');
    });

    it('should correctly map score to rare (2.0 <= score < 4.0)', () => {
      expect(mapScoreToTier(2.0)).toBe('rare');
      expect(mapScoreToTier(3.99)).toBe('rare');
    });

    it('should correctly map score to mythical (score >= 4.0)', () => {
      expect(mapScoreToTier(4.0)).toBe('mythical');
      expect(mapScoreToTier(10.0)).toBe('mythical');
    });

    it('should throw an error if score is negative (Precondition)', () => {
      expect(() => mapScoreToTier(-0.5)).toThrow('Precondition failed');
    });
  });

  describe('getDifficultyTier (Convenience Integration)', () => {
    it('should correctly determine DifficultyTier from input parameters', () => {
      // daily = 2.0, wither_threshold = 10, target_waterings = 2
      // score = 2.0 * 0.1 * log(2) = 0.2 * 0.693 = 0.1386 (< 1.0 -> common)
      expect(getDifficultyTier({
        frequency: 'daily',
        wither_threshold: 10,
        target_waterings: 2
      })).toBe('common');

      // twice_daily = 2.5, wither_threshold = 1, target_waterings = 10
      // score = 2.5 * 1.0 * log(10) = 2.5 * 2.302585 = 5.756 (>= 4.0 -> mythical)
      expect(getDifficultyTier({
        frequency: 'twice_daily',
        wither_threshold: 1,
        target_waterings: 10
      })).toBe('mythical');
    });
  });

  describe('Species Mapping', () => {
    it('should return correct species list for each tier', () => {
      expect(getSpeciesForTier('common')).toEqual(['pothos', 'spider_plant', 'poinsettia']);
      expect(getSpeciesForTier('uncommon')).toEqual(['bonsai', 'lavender', 'sunflower', 'maranta_leuconeura', 'alocasia_tiny_dancer']);
      expect(getSpeciesForTier('rare')).toEqual(['midnight_rose', 'desert_cactus', 'string_of_pearls', 'begonia_maculata', 'phalaenopsis_scarlett_jubilee']);
      expect(getSpeciesForTier('mythical')).toEqual(['golden_oak', 'ethereal_sakura', 'waratah']);
    });

    it('should throw error for invalid tier in getSpeciesForTier', () => {
      expect(() => getSpeciesForTier('invalid_tier' as DifficultyTier)).toThrow();
    });

    it('should assign species deterministically when index is provided', () => {
      expect(assignSpecies('common', 0)).toBe('pothos');
      expect(assignSpecies('common', 1)).toBe('spider_plant');
      expect(assignSpecies('common', 2)).toBe('poinsettia'); // wrap around
      expect(assignSpecies('common', 3)).toBe('pothos');
    });

    it('should assign a valid species from the list when index is not provided', () => {
      const species = assignSpecies('rare');
      expect(['midnight_rose', 'desert_cactus', 'string_of_pearls', 'begonia_maculata', 'phalaenopsis_scarlett_jubilee']).toContain(species);
    });

    it('should throw error if index is negative or not integer (Precondition)', () => {
      expect(() => assignSpecies('common', -1)).toThrow('Precondition failed');
      expect(() => assignSpecies('common', 1.5)).toThrow('Precondition failed');
    });
  });

  describe('Species Frequency Mapping', () => {
    it('should map species to natural/recommended frequencies in RECOMMENDED_SPECIES_FREQUENCIES', () => {
      expect(RECOMMENDED_SPECIES_FREQUENCIES['pothos']).toBe('weekly');
      expect(RECOMMENDED_SPECIES_FREQUENCIES['spider_plant']).toBe('weekly');
      expect(RECOMMENDED_SPECIES_FREQUENCIES['bonsai']).toBe('daily');
      expect(RECOMMENDED_SPECIES_FREQUENCIES['lavender']).toBe('daily');
      expect(RECOMMENDED_SPECIES_FREQUENCIES['sunflower']).toBe('daily');
      expect(RECOMMENDED_SPECIES_FREQUENCIES['midnight_rose']).toBe('twice_daily');
      expect(RECOMMENDED_SPECIES_FREQUENCIES['desert_cactus']).toBe('monthly');
      expect(RECOMMENDED_SPECIES_FREQUENCIES['golden_oak']).toBe('yearly');
      expect(RECOMMENDED_SPECIES_FREQUENCIES['ethereal_sakura']).toBe('flexible');
    });

    it('should retrieve correct frequency via getRecommendedFrequencyForSpecies helper', () => {
      expect(getRecommendedFrequencyForSpecies('pothos')).toBe('weekly');
      expect(getRecommendedFrequencyForSpecies('bonsai')).toBe('daily');
      expect(getRecommendedFrequencyForSpecies('midnight_rose')).toBe('twice_daily');
      expect(getRecommendedFrequencyForSpecies('desert_cactus')).toBe('monthly');
      expect(getRecommendedFrequencyForSpecies('golden_oak')).toBe('yearly');
      expect(getRecommendedFrequencyForSpecies('ethereal_sakura')).toBe('flexible');
    });

    it('should throw error for invalid species in getRecommendedFrequencyForSpecies', () => {
      expect(() => getRecommendedFrequencyForSpecies('invalid_species' as PlantSpecies)).toThrow('Precondition failed');
    });
  });
});