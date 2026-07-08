import { describe, it, expect } from 'vitest';
import {
  FREQUENCY_MULTIPLIERS,
  TIER_SPECIES,
  calculateDifficultyScore,
  mapScoreToTier,
  getDifficultyTier,
  getSpeciesForTier,
  assignSpecies
} from '../utils/difficulty';
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
      expect(getSpeciesForTier('common')).toEqual(['Fern', 'Ivy']);
      expect(getSpeciesForTier('uncommon')).toEqual(['Succulent', 'Bonsai']);
      expect(getSpeciesForTier('rare')).toEqual(['Orchid', 'Venus Flytrap']);
      expect(getSpeciesForTier('mythical')).toEqual(['World Tree', 'Golden Lotus']);
    });

    it('should throw error for invalid tier in getSpeciesForTier', () => {
      expect(() => getSpeciesForTier('invalid_tier' as DifficultyTier)).toThrow();
    });

    it('should assign species deterministically when index is provided', () => {
      expect(assignSpecies('common', 0)).toBe('Fern');
      expect(assignSpecies('common', 1)).toBe('Ivy');
      expect(assignSpecies('common', 2)).toBe('Fern'); // wrap around
      expect(assignSpecies('common', 3)).toBe('Ivy');
    });

    it('should assign a valid species from the list when index is not provided', () => {
      const species = assignSpecies('rare');
      expect(['Orchid', 'Venus Flytrap']).toContain(species);
    });

    it('should throw error if index is negative or not integer (Precondition)', () => {
      expect(() => assignSpecies('common', -1)).toThrow('Precondition failed');
      expect(() => assignSpecies('common', 1.5)).toThrow('Precondition failed');
    });
  });
});