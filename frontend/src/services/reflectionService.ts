import { ReflectionInput, ReflectionResult, ReflectionCategory } from '../types/reflection';
import { validateReflectionInput } from '../utils/reflectionValidation';
import { ValidationError } from '../utils/habitValidation';

export class ReflectionServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReflectionServiceError';
  }
}

export class ReflectionValidationError extends ReflectionServiceError {
  public errors: ValidationError[];
  constructor(message: string, errors: ValidationError[] = []) {
    super(message);
    this.name = 'ReflectionValidationError';
    this.errors = errors;
  }
}

export class ReflectionService {
  /**
   * Generates a poetic journey summary based on habit growth metrics.
   * 
   * Preconditions:
   * - input must be validated via validateReflectionInput.
   * 
   * Postconditions:
   * - Returns a ReflectionResult with category and summary matching specified templates.
   */
  generateReflection(input: ReflectionInput): ReflectionResult {
    // Design by Contract: validate preconditions
    const validation = validateReflectionInput(input);
    if (!validation.success || !validation.data) {
      throw new ReflectionValidationError('Invalid reflection input', validation.errors || []);
    }

    const { durationDays, witheredCount, consistencyLogs, plantType } = validation.data;

    // Calculate consistency score from consistencyLogs
    const consistencyRate = this.calculateConsistency(consistencyLogs, durationDays);

    let category: ReflectionCategory;
    let summary: string;

    // Classification logic:
    // 1. Scarred Resilience: Many setbacks (4+ withers)
    // 2. Flawless Bloom: High consistency (>= 90%) and 0-1 withers
    // 3. Steady Growth: 2-3 withers, or moderate consistency (any other case)
    if (witheredCount >= 4) {
      category = 'Scarred Resilience';
      const actualPlantType = plantType || 'Midnight Rose';
      summary = `Though the soil grew cold and dry in its early seasons, this ${actualPlantType} refused to fade. It weathered many periods of neglect, yet each time, a patient hand returned to water it. In its rugged wood and asymmetrical bloom, it tells a beautiful story of stubborn persistence over perfection.`;
    } else if (witheredCount <= 1 && consistencyRate >= 0.90) {
      category = 'Flawless Bloom';
      const actualPlantType = plantType || 'Ethereal Sakura';
      summary = `Planted in hope, this ${actualPlantType} rose without a single day of drought. Bathed in constant, daily devotion, its shimmering silver branches and floating blossoms stand as a proud, silent monument to your unwavering discipline.`;
    } else {
      category = 'Steady Growth';
      const actualPlantType = plantType || 'Bonsai';
      summary = `Rooted deeply through weeks of change, this ${actualPlantType} grew slowly, leaf by leaf. It survived brief periods of thirst only to emerge stronger. Its balanced, winding trunk is a testament to the quiet power of steady, repeated care.`;
    }

    return {
      category,
      summary
    };
  }

  /**
   * Helper to calculate consistency rate from consistencyLogs.
   */
  private calculateConsistency(
    logs: (string | Date | { created_at: string } | boolean)[],
    durationDays: number
  ): number {
    if (durationDays <= 0) return 0;

    // If logs contains boolean values, count the true ones.
    const isBooleanLogs = logs.length > 0 && logs.every(item => typeof item === 'boolean');
    if (isBooleanLogs) {
      const successfulDays = (logs as boolean[]).filter(Boolean).length;
      return Math.min(successfulDays / durationDays, 1.0);
    }

    // Otherwise, parse dates to count unique calendar days of check-ins.
    const uniqueDays = new Set<string>();
    for (const log of logs) {
      if (typeof log === 'string') {
        const dateStr = log.split('T')[0];
        uniqueDays.add(dateStr);
      } else if (log instanceof Date) {
        const dateStr = log.toISOString().split('T')[0];
        uniqueDays.add(dateStr);
      } else if (log && typeof log === 'object' && 'created_at' in log && typeof log.created_at === 'string') {
        const dateStr = log.created_at.split('T')[0];
        uniqueDays.add(dateStr);
      }
    }

    const successfulDays = uniqueDays.size > 0 ? uniqueDays.size : logs.length;
    return Math.min(successfulDays / durationDays, 1.0);
  }
}
