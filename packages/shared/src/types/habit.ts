export type DifficultyTier = 'common' | 'uncommon' | 'rare' | 'mythical';
export type HabitFrequency = 'twice_daily' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'flexible';
export type HabitStatus = 'healthy' | 'withered' | 'completed';

export interface FlexibleRules {
  days_required: number;
  days_total: number;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  plant_type: string;
  difficulty_tier: DifficultyTier;
  frequency: HabitFrequency;
  flexible_rules: FlexibleRules | null;
  target_waterings: number;
  current_waterings: number;
  wither_threshold: number;
  consecutive_misses: number;
  wither_count: number;
  status: HabitStatus;
  poetic_summary: string | null;
  is_public: boolean;
  current_streak: number;
  max_streak: number;
  completed_at: string | null;
  created_at: string;
  hide_name?: boolean;
  hide_description?: boolean;
  share_name_friends?: string[];
  share_desc_friends?: string[];
}

export interface CreateHabitInput {
  user_id: string;
  name: string;
  description?: string | null;
  plant_type?: string;
  difficulty_tier?: DifficultyTier;
  frequency?: HabitFrequency;
  flexible_rules?: FlexibleRules | null;
  target_waterings?: number;
  current_waterings?: number;
  wither_threshold?: number;
  consecutive_misses?: number;
  wither_count?: number;
  status?: HabitStatus;
  is_public?: boolean;
  current_streak?: number;
  max_streak?: number;
  hide_name?: boolean;
  hide_description?: boolean;
  share_name_friends?: string[];
  share_desc_friends?: string[];
}

export interface UpdateHabitInput {
  name?: string;
  description?: string | null;
  plant_type?: string;
  difficulty_tier?: DifficultyTier;
  frequency?: HabitFrequency;
  flexible_rules?: FlexibleRules | null;
  target_waterings?: number;
  current_waterings?: number;
  wither_threshold?: number;
  consecutive_misses?: number;
  wither_count?: number;
  status?: HabitStatus;
  poetic_summary?: string | null;
  is_public?: boolean;
  current_streak?: number;
  max_streak?: number;
  completed_at?: string | null;
  hide_name?: boolean;
  hide_description?: boolean;
  share_name_friends?: string[];
  share_desc_friends?: string[];
}
