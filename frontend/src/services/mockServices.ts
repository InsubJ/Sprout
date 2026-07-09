import { Profile } from '../types/profile';
import { Habit, CreateHabitInput, UpdateHabitInput } from '../types/habit';
import { Friendship } from '../types/friendship';
import { HabitLog } from '../types/habitLog';
import { WitherNudge } from '../types/nudge';
import { ReflectionService } from './reflectionService';

const DEFAULT_PROFILES: Profile[] = [
  { id: '11111111-1111-1111-1111-111111111111', username: 'admin', display_name: 'Admin User', avatar_url: null, created_at: new Date().toISOString() },
  { id: '22222222-2222-2222-2222-222222222222', username: 'alice', display_name: 'Alice Cooper', avatar_url: null, created_at: new Date().toISOString() },
  { id: '33333333-3333-3333-3333-333333333333', username: 'bob', display_name: 'Bob Dylan', avatar_url: null, created_at: new Date().toISOString() },
  { id: '44444444-4444-4444-4444-444444444444', username: 'charlie', display_name: 'Charlie Brown', avatar_url: null, created_at: new Date().toISOString() }
];

const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit-101-uuid',
    user_id: '11111111-1111-1111-1111-111111111111',
    name: 'Morning Walk',
    description: '15 mins',
    plant_type: 'pothos',
    difficulty_tier: 'common',
    frequency: 'daily',
    flexible_rules: null,
    target_waterings: 10,
    current_waterings: 5,
    wither_threshold: 3,
    consecutive_misses: 0,
    wither_count: 0,
    status: 'healthy',
    poetic_summary: null,
    is_public: true,
    current_streak: 5,
    max_streak: 5,
    completed_at: null,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'habit-102-uuid',
    user_id: '11111111-1111-1111-1111-111111111111',
    name: 'Code Sprout App',
    description: 'Build awesome features',
    plant_type: 'midnight_rose',
    difficulty_tier: 'rare',
    frequency: 'daily',
    flexible_rules: null,
    target_waterings: 30,
    current_waterings: 29,
    wither_threshold: 2,
    consecutive_misses: 0,
    wither_count: 1,
    status: 'healthy',
    poetic_summary: null,
    is_public: true,
    current_streak: 15,
    max_streak: 15,
    completed_at: null,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'habit-103-uuid',
    user_id: '11111111-1111-1111-1111-111111111111',
    name: 'Reflective Writing',
    description: 'Journal thoughts daily',
    plant_type: 'bonsai',
    difficulty_tier: 'uncommon',
    frequency: 'daily',
    flexible_rules: null,
    target_waterings: 5,
    current_waterings: 3,
    wither_threshold: 3,
    consecutive_misses: 3,
    wither_count: 2,
    status: 'withered',
    poetic_summary: null,
    is_public: true,
    current_streak: 0,
    max_streak: 3,
    completed_at: null,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'habit-201-uuid',
    user_id: '22222222-2222-2222-2222-222222222222',
    name: 'Morning Yoga',
    description: 'Daily stretches',
    plant_type: 'lavender',
    difficulty_tier: 'uncommon',
    frequency: 'daily',
    flexible_rules: null,
    target_waterings: 20,
    current_waterings: 20,
    wither_threshold: 3,
    consecutive_misses: 0,
    wither_count: 0,
    status: 'completed',
    poetic_summary: 'Planted in hope, this lavender rose without a single day of drought. Bathed in constant, daily devotion, its shimmering branches stand as a proud, silent monument to your unwavering discipline.',
    is_public: true,
    current_streak: 20,
    max_streak: 20,
    completed_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'habit-202-uuid',
    user_id: '22222222-2222-2222-2222-222222222222',
    name: 'Water Real Plants',
    description: 'In the bedroom and lounge',
    plant_type: 'desert_cactus',
    difficulty_tier: 'rare',
    frequency: 'weekly',
    flexible_rules: null,
    target_waterings: 10,
    current_waterings: 2,
    wither_threshold: 2,
    consecutive_misses: 2,
    wither_count: 4,
    status: 'withered',
    poetic_summary: null,
    is_public: true,
    current_streak: 0,
    max_streak: 2,
    completed_at: null,
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_FRIENDSHIPS: Friendship[] = [
  {
    id: 'friendship-12-uuid',
    user_id: '11111111-1111-1111-1111-111111111111',
    friend_id: '22222222-2222-2222-2222-222222222222',
    status: 'accepted',
    created_at: new Date().toISOString()
  },
  {
    id: 'friendship-13-uuid',
    user_id: '11111111-1111-1111-1111-111111111111',
    friend_id: '33333333-3333-3333-3333-333333333333',
    status: 'accepted',
    created_at: new Date().toISOString()
  },
  {
    id: 'friendship-41-uuid',
    user_id: '44444444-4444-4444-4444-444444444444',
    friend_id: '11111111-1111-1111-1111-111111111111',
    status: 'pending',
    created_at: new Date().toISOString()
  }
];

const DEFAULT_LOGS: HabitLog[] = [
  {
    id: 'log-101-uuid',
    habit_id: 'habit-101-uuid',
    user_id: '11111111-1111-1111-1111-111111111111',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export class MockProfileService {
  async searchProfiles(query: string, currentUserId: string): Promise<Profile[]> {
    const profiles = getStored<Profile[]>('sprout_profiles', DEFAULT_PROFILES);
    return profiles.filter(p => p.id !== currentUserId && p.username.toLowerCase().includes(query.toLowerCase()));
  }

  async getProfilesByIds(ids: string[]): Promise<Profile[]> {
    const profiles = getStored<Profile[]>('sprout_profiles', DEFAULT_PROFILES);
    return profiles.filter(p => ids.includes(p.id));
  }

  async getProfileByUsername(username: string): Promise<Profile | null> {
    const profiles = getStored<Profile[]>('sprout_profiles', DEFAULT_PROFILES);
    return profiles.find(p => p.username.toLowerCase() === username.trim().toLowerCase()) || null;
  }

  async createProfile(username: string, displayName: string): Promise<Profile> {
    const profiles = getStored<Profile[]>('sprout_profiles', DEFAULT_PROFILES);
    const existing = profiles.find(p => p.username.toLowerCase() === username.toLowerCase());
    if (existing) throw new Error('Username already exists');
    const newProfile: Profile = {
      id: crypto.randomUUID(),
      username: username.trim(),
      display_name: displayName.trim() || username.trim(),
      avatar_url: null,
      created_at: new Date().toISOString()
    };
    profiles.push(newProfile);
    setStored('sprout_profiles', profiles);
    return newProfile;
  }
}

export class MockHabitService {
  async getHabits(userId: string): Promise<Habit[]> {
    const habits = getStored<Habit[]>('sprout_habits', DEFAULT_HABITS);
    return habits.filter(h => h.user_id === userId);
  }

  async getHabitById(habitId: string): Promise<Habit> {
    const habits = getStored<Habit[]>('sprout_habits', DEFAULT_HABITS);
    const habit = habits.find(h => h.id === habitId);
    if (!habit) throw new Error(`Habit not found with ID ${habitId}`);
    return habit;
  }

  async createHabit(input: CreateHabitInput): Promise<Habit> {
    const habits = getStored<Habit[]>('sprout_habits', DEFAULT_HABITS);
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      user_id: input.user_id,
      name: input.name,
      description: input.description || null,
      plant_type: input.plant_type || 'bonsai',
      difficulty_tier: input.difficulty_tier || 'common',
      frequency: input.frequency || 'daily',
      flexible_rules: input.flexible_rules || null,
      target_waterings: input.target_waterings || 30,
      current_waterings: input.current_waterings || 0,
      wither_threshold: input.wither_threshold || 3,
      consecutive_misses: input.consecutive_misses || 0,
      wither_count: input.wither_count || 0,
      status: input.status || 'healthy',
      poetic_summary: null,
      is_public: input.is_public !== undefined ? input.is_public : true,
      current_streak: input.current_streak || 0,
      max_streak: input.max_streak || 0,
      completed_at: null,
      created_at: new Date().toISOString()
    };
    habits.unshift(newHabit);
    setStored('sprout_habits', habits);
    return newHabit;
  }

  async updateHabit(habitId: string, input: UpdateHabitInput): Promise<Habit> {
    const habits = getStored<Habit[]>('sprout_habits', DEFAULT_HABITS);
    const index = habits.findIndex(h => h.id === habitId);
    if (index === -1) throw new Error(`Habit with ID ${habitId} not found`);
    const updated: Habit = {
      ...habits[index],
      ...input,
      completed_at: input.completed_at !== undefined ? input.completed_at : habits[index].completed_at,
      poetic_summary: input.poetic_summary !== undefined ? input.poetic_summary : habits[index].poetic_summary
    };
    habits[index] = updated;
    setStored('sprout_habits', habits);
    return updated;
  }

  async deleteHabit(habitId: string): Promise<void> {
    const habits = getStored<Habit[]>('sprout_habits', DEFAULT_HABITS);
    const filtered = habits.filter(h => h.id !== habitId);
    setStored('sprout_habits', filtered);
  }

  async checkAndCompleteHabit(habitId: string, logs: HabitLog[], reflectionService: ReflectionService): Promise<Habit> {
    const habit = await this.getHabitById(habitId);
    if (habit.current_waterings >= habit.target_waterings) {
      if (habit.status === 'completed' && habit.poetic_summary) {
        return habit;
      }
      const completedAt = new Date();
      const createdAt = new Date(habit.created_at);
      const durationMs = completedAt.getTime() - createdAt.getTime();
      const durationDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

      const reflection = reflectionService.generateReflection({
        durationDays,
        witheredCount: habit.wither_count,
        consistencyLogs: logs,
        plantType: habit.plant_type
      });

      return this.updateHabit(habitId, {
        status: 'completed',
        poetic_summary: reflection.summary,
        completed_at: completedAt.toISOString()
      });
    }
    return habit;
  }
}

export class MockFriendshipService {
  async getFriendships(userId: string): Promise<Friendship[]> {
    const friendships = getStored<Friendship[]>('sprout_friendships', DEFAULT_FRIENDSHIPS);
    return friendships.filter(f => f.user_id === userId || f.friend_id === userId);
  }

  async getPendingRequests(userId: string): Promise<Friendship[]> {
    const friendships = getStored<Friendship[]>('sprout_friendships', DEFAULT_FRIENDSHIPS);
    return friendships.filter(f => f.friend_id === userId && f.status === 'pending');
  }

  async getAcceptedFriends(userId: string): Promise<Friendship[]> {
    const friendships = getStored<Friendship[]>('sprout_friendships', DEFAULT_FRIENDSHIPS);
    return friendships.filter(f => (f.user_id === userId || f.friend_id === userId) && f.status === 'accepted');
  }

  async sendFriendRequest(input: { user_id: string; friend_id: string }): Promise<Friendship> {
    const friendships = getStored<Friendship[]>('sprout_friendships', DEFAULT_FRIENDSHIPS);
    const existing = friendships.find(
      f => (f.user_id === input.user_id && f.friend_id === input.friend_id) ||
           (f.user_id === input.friend_id && f.friend_id === input.user_id)
    );
    if (existing) throw new Error('Relationship already exists');
    const newFriendship: Friendship = {
      id: crypto.randomUUID(),
      user_id: input.user_id,
      friend_id: input.friend_id,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    friendships.push(newFriendship);
    setStored('sprout_friendships', friendships);
    return newFriendship;
  }

  async acceptFriendRequest(friendshipId: string, currentUserId: string): Promise<Friendship> {
    const friendships = getStored<Friendship[]>('sprout_friendships', DEFAULT_FRIENDSHIPS);
    const index = friendships.findIndex(f => f.id === friendshipId);
    if (index === -1) throw new Error('Friendship not found');
    if (friendships[index].friend_id !== currentUserId) throw new Error('Not authorized to accept');
    friendships[index].status = 'accepted';
    setStored('sprout_friendships', friendships);
    return friendships[index];
  }

  async declineFriendRequest(friendshipId: string, currentUserId: string): Promise<Friendship> {
    const friendships = getStored<Friendship[]>('sprout_friendships', DEFAULT_FRIENDSHIPS);
    const index = friendships.findIndex(f => f.id === friendshipId);
    if (index === -1) throw new Error('Friendship not found');
    if (friendships[index].friend_id !== currentUserId) throw new Error('Not authorized to decline');
    friendships[index].status = 'declined';
    setStored('sprout_friendships', friendships);
    return friendships[index];
  }
}

export class MockLogService {
  async createLog(input: { habit_id: string; user_id: string; note?: string }): Promise<HabitLog> {
    const logs = getStored<HabitLog[]>('sprout_logs', DEFAULT_LOGS);
    const newLog: HabitLog = {
      id: crypto.randomUUID(),
      habit_id: input.habit_id,
      user_id: input.user_id,
      note: input.note || undefined,
      image_url: undefined,
      created_at: new Date().toISOString()
    };
    logs.unshift(newLog);
    setStored('sprout_logs', logs);

    // Also increment habit waterings
    const habits = getStored<Habit[]>('sprout_habits', DEFAULT_HABITS);
    const habitIndex = habits.findIndex(h => h.id === input.habit_id);
    if (habitIndex !== -1) {
      const habit = habits[habitIndex];
      habit.current_waterings = Math.min(habit.target_waterings, habit.current_waterings + 1);
      habit.current_streak = habit.current_streak + 1;
      habit.max_streak = Math.max(habit.max_streak, habit.current_streak);
      habit.consecutive_misses = 0;
      if (habit.status === 'withered') {
        habit.status = 'healthy';
      }
      setStored('sprout_habits', habits);
    }

    return newLog;
  }

  async getLogsByHabitId(habitId: string): Promise<HabitLog[]> {
    const logs = getStored<HabitLog[]>('sprout_logs', DEFAULT_LOGS);
    return logs.filter(l => l.habit_id === habitId);
  }

  async getLogsByUserId(userId: string): Promise<HabitLog[]> {
    const logs = getStored<HabitLog[]>('sprout_logs', DEFAULT_LOGS);
    return logs.filter(l => l.user_id === userId);
  }
}

export class MockNudgeService {
  async sendNudge(input: { sender_id: string; receiver_id: string; habit_id: string }): Promise<WitherNudge> {
    const nudges = getStored<WitherNudge[]>('sprout_nudges', []);
    const todayStr = new Date().toISOString().split('T')[0];
    const exists = nudges.some(n => n.sender_id === input.sender_id && n.habit_id === input.habit_id && n.nudged_at === todayStr);
    if (exists) throw new Error('Nudge limit reached for today');

    const newNudge: WitherNudge = {
      id: crypto.randomUUID(),
      sender_id: input.sender_id,
      receiver_id: input.receiver_id,
      habit_id: input.habit_id,
      nudged_at: todayStr,
      created_at: new Date().toISOString()
    };
    nudges.push(newNudge);
    setStored('sprout_nudges', nudges);
    return newNudge;
  }

  async getNudgesByHabitId(habitId: string): Promise<WitherNudge[]> {
    const nudges = getStored<WitherNudge[]>('sprout_nudges', []);
    return nudges.filter(n => n.habit_id === habitId);
  }

  async hasUserNudgedToday(senderId: string, habitId: string): Promise<boolean> {
    const nudges = getStored<WitherNudge[]>('sprout_nudges', []);
    const todayStr = new Date().toISOString().split('T')[0];
    return nudges.some(n => n.sender_id === senderId && n.habit_id === habitId && n.nudged_at === todayStr);
  }
}
