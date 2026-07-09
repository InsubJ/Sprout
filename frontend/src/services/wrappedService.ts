import { SupabaseClient } from '@supabase/supabase-js';
import { Profile } from '../types/profile';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUuid(id: string): boolean {
  return typeof id === 'string' && uuidRegex.test(id);
}

export interface YearlyWrappedData {
  userId: string;
  year: number;
  totalPlanted: number;
  totalCompleted: number;
  tierRatios: {
    common: number;
    uncommon: number;
    rare: number;
    mythical: number;
  };
  averageResilienceIndex: number;
  guardianAngel: {
    profile: {
      id: string;
      username: string;
      display_name: string | null;
      avatar_url: string | null;
    } | null;
    nudgeCount: number;
  } | null;
  socialEcho: {
    commentCount: number;
    reactionCount: number;
    totalInteractions: number;
  };
}

export class WrappedServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WrappedServiceError';
  }
}

export class WrappedValidationError extends WrappedServiceError {
  public errors: { field: string; message: string }[];
  constructor(message: string, errors: { field: string; message: string }[] = []) {
    super(message);
    this.name = 'WrappedValidationError';
    this.errors = errors;
  }
}

export class WrappedDatabaseError extends WrappedServiceError {
  public originalError: any;
  constructor(message: string, originalError?: any) {
    super(message);
    this.name = 'WrappedDatabaseError';
    this.originalError = originalError;
  }
}

export class WrappedService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    if (!supabaseClient) {
      throw new Error('Supabase client is required');
    }
    this.supabase = supabaseClient;
  }

  /**
   * Generates the Yearly Wrapped summary metrics for a specific user and year.
   * Preconditions:
   * - userId must be a valid UUID.
   * - year must be a valid calendar year between 2000 and 2100.
   */
  async getYearlyWrapped(userId: string, year: number): Promise<YearlyWrappedData> {
    // Design by Contract: Precondition checking
    const errors: { field: string; message: string }[] = [];

    if (!userId) {
      errors.push({ field: 'userId', message: 'User ID is required' });
    } else if (!isValidUuid(userId)) {
      errors.push({ field: 'userId', message: 'User ID must be a valid UUID' });
    }

    if (year === undefined || year === null) {
      errors.push({ field: 'year', message: 'Year is required' });
    } else if (typeof year !== 'number' || !Number.isInteger(year)) {
      errors.push({ field: 'year', message: 'Year must be an integer' });
    } else if (year < 2000 || year > 2100) {
      errors.push({ field: 'year', message: 'Year must be a valid calendar year between 2000 and 2100' });
    }

    if (errors.length > 0) {
      throw new WrappedValidationError('Invalid input for Yearly Wrapped', errors);
    }

    try {
      // 1. Fetch habits for user
      const { data: habits, error: habitsError } = await this.supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId);

      if (habitsError) {
        throw new WrappedDatabaseError(`Failed to fetch habits: ${habitsError.message}`, habitsError);
      }

      const userHabits = habits || [];

      // Filter habits created in the given year
      const habitsInYear = userHabits.filter(h => {
        const date = new Date(h.created_at);
        return date.getFullYear() === year;
      });

      // Filter habits completed in the given year
      const completedInYear = userHabits.filter(h => {
        if (h.status !== 'completed' || !h.completed_at) return false;
        const date = new Date(h.completed_at);
        return date.getFullYear() === year;
      });

      // 2. Tier ratios (counts of habits created in the year grouped by tier)
      const commonCount = habitsInYear.filter(h => h.difficulty_tier === 'common').length;
      const uncommonCount = habitsInYear.filter(h => h.difficulty_tier === 'uncommon').length;
      const rareCount = habitsInYear.filter(h => h.difficulty_tier === 'rare').length;
      const mythicalCount = habitsInYear.filter(h => h.difficulty_tier === 'mythical').length;

      // 3. Average Resilience Index
      let averageResilienceIndex = 0;
      const habitIds = userHabits.map(h => h.id);

      let logs: any[] = [];
      if (habitIds.length > 0) {
        const { data: logsData, error: logsError } = await this.supabase
          .from('habit_logs')
          .select('*')
          .in('habit_id', habitIds);

        if (logsError) {
          throw new WrappedDatabaseError(`Failed to fetch habit logs: ${logsError.message}`, logsError);
        }
        logs = logsData || [];
      }

      let totalWitherDays = 0;
      let totalWitherEpisodes = 0;

      for (const habit of userHabits) {
        const habitLogs = logs
          .filter(l => l.habit_id === habit.id)
          .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());

        let intervalDays = 1;
        if (habit.frequency === 'twice_daily') intervalDays = 0.5;
        else if (habit.frequency === 'daily') intervalDays = 1;
        else if (habit.frequency === 'weekly') intervalDays = 7;
        else if (habit.frequency === 'monthly') intervalDays = 30;
        else if (habit.frequency === 'yearly') intervalDays = 365;
        else if (habit.frequency === 'flexible') {
          if (habit.flexible_rules && typeof habit.flexible_rules === 'object') {
            const rules = habit.flexible_rules as any;
            if (rules.days_total && rules.days_required) {
              intervalDays = rules.days_total / rules.days_required;
            }
          }
        }

        const threshold = habit.wither_threshold || 3;
        const maxHealthyGapDays = threshold * intervalDays;

        const timestamps = [
          new Date(habit.created_at).getTime(),
          ...habitLogs.map(l => new Date(l.completed_at).getTime())
        ];

        if (habit.status === 'completed' && habit.completed_at) {
          timestamps.push(new Date(habit.completed_at).getTime());
        } else {
          const now = new Date().getTime();
          const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`).getTime();
          const lastTime = Math.min(now, endOfYear);
          if (lastTime > timestamps[timestamps.length - 1]) {
            timestamps.push(lastTime);
          }
        }

        for (let i = 0; i < timestamps.length - 1; i++) {
          const tA = timestamps[i];
          const tB = timestamps[i + 1];
          const gapDays = (tB - tA) / (1000 * 60 * 60 * 24);

          if (gapDays > maxHealthyGapDays) {
            const witherDuration = gapDays - maxHealthyGapDays;
            totalWitherDays += witherDuration;
            totalWitherEpisodes += 1;
          }
        }
      }

      if (totalWitherEpisodes > 0) {
        averageResilienceIndex = Number((totalWitherDays / totalWitherEpisodes).toFixed(1));
      }

      // 4. Guardian Angel
      const { data: nudges, error: nudgesError } = await this.supabase
        .from('wither_nudges')
        .select('*')
        .eq('receiver_id', userId);

      if (nudgesError) {
        throw new WrappedDatabaseError(`Failed to fetch nudges: ${nudgesError.message}`, nudgesError);
      }

      const nudgesInYear = (nudges || []).filter(n => {
        const date = new Date(n.created_at || n.nudged_at);
        return date.getFullYear() === year;
      });

      const nudgeCountsBySender: Record<string, number> = {};
      for (const nudge of nudgesInYear) {
        nudgeCountsBySender[nudge.sender_id] = (nudgeCountsBySender[nudge.sender_id] || 0) + 1;
      }

      let maxNudges = 0;
      let angelId: string | null = null;
      for (const [senderId, count] of Object.entries(nudgeCountsBySender)) {
        if (count > maxNudges) {
          maxNudges = count;
          angelId = senderId;
        }
      }

      let guardianAngel = null;
      if (angelId) {
        const { data: profile, error: profileError } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('id', angelId)
          .maybeSingle();

        guardianAngel = {
          profile: profile ? (profile as Profile) : null,
          nudgeCount: maxNudges
        };
      }

      // 5. Social Echo
      let commentCount = 0;
      let reactionCount = 0;

      const logIds = logs.map(l => l.id);
      if (logIds.length > 0) {
        // Fetch comments
        const { data: comments, error: commentsError } = await this.supabase
          .from('log_comments')
          .select('*')
          .in('log_id', logIds);

        if (commentsError) {
          throw new WrappedDatabaseError(`Failed to fetch comments: ${commentsError.message}`, commentsError);
        }

        const commentsInYear = (comments || []).filter(c => {
          const date = new Date(c.created_at);
          return date.getFullYear() === year && c.user_id !== userId;
        });
        commentCount = commentsInYear.length;

        // Fetch reactions
        const { data: reactions, error: reactionsError } = await this.supabase
          .from('log_reactions')
          .select('*')
          .in('log_id', logIds);

        if (reactionsError) {
          throw new WrappedDatabaseError(`Failed to fetch reactions: ${reactionsError.message}`, reactionsError);
        }

        const reactionsInYear = (reactions || []).filter(r => {
          const date = new Date(r.created_at);
          return date.getFullYear() === year && r.user_id !== userId;
        });
        reactionCount = reactionsInYear.length;
      }

      return {
        userId,
        year,
        totalPlanted: habitsInYear.length,
        totalCompleted: completedInYear.length,
        tierRatios: {
          common: commonCount,
          uncommon: uncommonCount,
          rare: rareCount,
          mythical: mythicalCount
        },
        averageResilienceIndex,
        guardianAngel,
        socialEcho: {
          commentCount,
          reactionCount,
          totalInteractions: commentCount + reactionCount
        }
      };
    } catch (err) {
      if (err instanceof WrappedServiceError) {
        throw err;
      }
      throw new WrappedDatabaseError(`An unexpected database error occurred: ${(err as any).message}`, err);
    }
  }
}
