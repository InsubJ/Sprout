import { describe, it, expect, beforeEach } from 'vitest';
import { ReflectionService, ReflectionValidationError } from '../services/reflectionService';

describe('ReflectionService', () => {
  let service: ReflectionService;

  beforeEach(() => {
    service = new ReflectionService();
  });

  describe('Flawless Bloom Category', () => {
    it('should generate Flawless Bloom reflection for 0 withers and 100% consistency', () => {
      const logs = Array(30).fill(true);
      const result = service.generateReflection({
        durationDays: 30,
        witheredCount: 0,
        consistencyLogs: logs,
        plantType: 'Ethereal Sakura'
      });

      expect(result.category).toBe('Flawless Bloom');
      expect(result.summary).toContain('Planted in hope, this Ethereal Sakura rose without a single day of drought');
      expect(result.summary).toContain('unwavering discipline');
    });

    it('should generate Flawless Bloom reflection for 1 wither and 90%+ consistency', () => {
      const logs = Array(27).fill(true).concat([false, false, false]); // 27/30 = 90%
      const result = service.generateReflection({
        durationDays: 30,
        witheredCount: 1,
        consistencyLogs: logs,
        plantType: 'Golden Lily'
      });

      expect(result.category).toBe('Flawless Bloom');
      expect(result.summary).toContain('Planted in hope, this Golden Lily rose without a single day of drought');
    });

    it('should use default plant type Ethereal Sakura if none provided', () => {
      const logs = Array(30).fill(true);
      const result = service.generateReflection({
        durationDays: 30,
        witheredCount: 0,
        consistencyLogs: logs
      });

      expect(result.category).toBe('Flawless Bloom');
      expect(result.summary).toContain('this Ethereal Sakura rose');
    });
  });

  describe('Scarred Resilience Category', () => {
    it('should generate Scarred Resilience reflection for 4 withers', () => {
      const logs = Array(20).fill(true);
      const result = service.generateReflection({
        durationDays: 30,
        witheredCount: 4,
        consistencyLogs: logs,
        plantType: 'Midnight Rose'
      });

      expect(result.category).toBe('Scarred Resilience');
      expect(result.summary).toContain('Though the soil grew cold and dry in its early seasons, this Midnight Rose refused to fade');
      expect(result.summary).toContain('stubborn persistence over perfection');
    });

    it('should generate Scarred Resilience reflection for 5 withers', () => {
      const logs = Array(15).fill(true);
      const result = service.generateReflection({
        durationDays: 30,
        witheredCount: 5,
        consistencyLogs: logs,
        plantType: 'Fire Fern'
      });

      expect(result.category).toBe('Scarred Resilience');
      expect(result.summary).toContain('this Fire Fern refused to fade');
    });

    it('should use default plant type Midnight Rose if none provided', () => {
      const logs = Array(10).fill(true);
      const result = service.generateReflection({
        durationDays: 30,
        witheredCount: 4,
        consistencyLogs: logs
      });

      expect(result.category).toBe('Scarred Resilience');
      expect(result.summary).toContain('this Midnight Rose refused to fade');
    });
  });

  describe('Steady Growth Category', () => {
    it('should generate Steady Growth reflection for 2-3 withers', () => {
      const logs = Array(25).fill(true);
      const result = service.generateReflection({
        durationDays: 30,
        witheredCount: 2,
        consistencyLogs: logs,
        plantType: 'Bonsai'
      });

      expect(result.category).toBe('Steady Growth');
      expect(result.summary).toContain('Rooted deeply through weeks of change, this Bonsai grew slowly, leaf by leaf');
      expect(result.summary).toContain('steady, repeated care');
    });

    it('should generate Steady Growth reflection for 0-1 withers but low (<90%) consistency', () => {
      const logs = Array(20).fill(true).concat(Array(10).fill(false)); // 20/30 = 66.7% consistency
      const result = service.generateReflection({
        durationDays: 30,
        witheredCount: 0,
        consistencyLogs: logs,
        plantType: 'Bonsai'
      });

      expect(result.category).toBe('Steady Growth');
      expect(result.summary).toContain('this Bonsai grew slowly');
    });

    it('should use default plant type Bonsai if none provided', () => {
      const logs = Array(25).fill(true);
      const result = service.generateReflection({
        durationDays: 30,
        witheredCount: 3,
        consistencyLogs: logs
      });

      expect(result.category).toBe('Steady Growth');
      expect(result.summary).toContain('this Bonsai grew slowly');
    });
  });

  describe('Consistency Log Formats', () => {
    it('should calculate consistency correctly with Date objects', () => {
      const logs = [
        new Date('2026-07-01T10:00:00Z'),
        new Date('2026-07-02T10:00:00Z'),
        new Date('2026-07-03T10:00:00Z')
      ];

      const result = service.generateReflection({
        durationDays: 3,
        witheredCount: 0,
        consistencyLogs: logs
      });

      expect(result.category).toBe('Flawless Bloom');
    });

    it('should calculate consistency correctly with HabitLog objects', () => {
      const logs = [
        { created_at: '2026-07-01T10:00:00Z' },
        { created_at: '2026-07-02T10:00:00Z' }
      ];

      const result = service.generateReflection({
        durationDays: 10,
        witheredCount: 0,
        consistencyLogs: logs
      });

      expect(result.category).toBe('Steady Growth');
    });

    it('should calculate consistency correctly with date strings', () => {
      const logs = ['2026-07-01', '2026-07-02', '2026-07-03'];

      const result = service.generateReflection({
        durationDays: 3,
        witheredCount: 0,
        consistencyLogs: logs
      });

      expect(result.category).toBe('Flawless Bloom');
    });
  });

  describe('Design by Contract (Preconditions)', () => {
    it('should throw ReflectionValidationError if durationDays is not positive', () => {
      expect(() => {
        service.generateReflection({
          durationDays: 0,
          witheredCount: 0,
          consistencyLogs: []
        });
      }).toThrow(ReflectionValidationError);
    });

    it('should throw ReflectionValidationError if witheredCount is negative', () => {
      expect(() => {
        service.generateReflection({
          durationDays: 30,
          witheredCount: -1,
          consistencyLogs: []
        });
      }).toThrow(ReflectionValidationError);
    });

    it('should throw ReflectionValidationError if consistencyLogs is not an array', () => {
      expect(() => {
        service.generateReflection({
          durationDays: 30,
          witheredCount: 0,
          consistencyLogs: null as any
        });
      }).toThrow(ReflectionValidationError);
    });

    it('should throw ReflectionValidationError if plantType is too long', () => {
      expect(() => {
        service.generateReflection({
          durationDays: 30,
          witheredCount: 0,
          consistencyLogs: [],
          plantType: 'a'.repeat(51)
        });
      }).toThrow(ReflectionValidationError);
    });
  });
});
