import React, { useState, useEffect } from 'react';
import { Habit } from '../../types/habit';
import { HabitCard } from './HabitCard';
import styles from './GardenCarousel.module.css';

interface GardenCarouselProps {
  habits: Habit[];
  currentViewerId: string;
  onWater?: (habitId: string) => void;
  onWaterWithDetails?: (habitId: string, note: string, imageUrl?: string) => void;
  onNudge?: (habitId: string) => void;
  nudgedHabits?: Record<string, boolean>;
  nudgeLoading?: Record<string, boolean>;
  isVisitor?: boolean;
}

export const GardenCarousel: React.FC<GardenCarouselProps> = ({
  habits,
  currentViewerId,
  onWater,
  onWaterWithDetails,
  onNudge,
  nudgedHabits = {},
  nudgeLoading = {},
  isVisitor = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'watered' | 'needs_water'>('all');

  // Helper to check if a habit is watered today
  const isWateredToday = (habit: Habit): boolean => {
    let wateredTodayIds: string[] = [];
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
      try {
        const storedLogs = localStorage.getItem('sprout_logs');
        if (storedLogs) {
          const logs = JSON.parse(storedLogs);
          const today = new Date();
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
          const todayEnd = todayStart + 24 * 60 * 60 * 1000;
          
          wateredTodayIds = logs
            .filter((l: any) => {
              const time = new Date(l.created_at).getTime();
              return time >= todayStart && time < todayEnd;
            })
            .map((l: any) => l.habit_id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    return wateredTodayIds.includes(habit.id);
  };

  // Filter and search habits
  const filteredHabits = habits.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isWatered = isWateredToday(h);
    
    if (filterType === 'watered') {
      return matchesSearch && isWatered;
    } else if (filterType === 'needs_water') {
      return matchesSearch && !isWatered;
    }
    return matchesSearch;
  });

  return (
    <div className={styles.carouselContainer}>
      {/* Search and Filters Bar */}
      <section className={styles.controlsBar}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search plant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterChips}>
          <button
            onClick={() => setFilterType('all')}
            className={`${styles.filterChip} ${filterType === 'all' ? styles.activeFilter : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('watered')}
            className={`${styles.filterChip} ${filterType === 'watered' ? styles.activeFilter : ''}`}
          >
            💧 Watered
          </button>
          <button
            onClick={() => setFilterType('needs_water')}
            className={`${styles.filterChip} ${filterType === 'needs_water' ? styles.activeFilter : ''}`}
          >
            🍂 Needs Water
          </button>
        </div>
      </section>

      {/* Grid view of filtered plant cards */}
      {filteredHabits.length === 0 ? (
        <div className={styles.emptySearch}>
          <span className={styles.emptyIcon}>🌾</span>
          <h3>No plants found</h3>
          <p>Try adjusting your search term or filters.</p>
        </div>
      ) : (
        <div className={styles.grid} data-testid="habits-grid">
          {filteredHabits.map((habit) => {
            const handleWaterClick = onWater ? () => onWater(habit.id) : undefined;
            const handleWaterWithDetailsClick = onWaterWithDetails ? (note: string, img?: string) => onWaterWithDetails(habit.id, note, img) : undefined;

            return (
              <HabitCard
                key={habit.id}
                name={habit.name}
                frequency={habit.frequency}
                status={habit.status}
                currentStreak={habit.current_streak}
                currentWaterings={habit.current_waterings}
                targetWaterings={habit.target_waterings}
                witherThreshold={habit.wither_threshold}
                consecutiveMisses={habit.consecutive_misses}
                plantType={habit.plant_type}
                difficultyTier={habit.difficulty_tier}
                witherCount={habit.wither_count}
                onWater={handleWaterClick}
                onWaterWithDetails={handleWaterWithDetailsClick}
                onNudge={onNudge ? () => onNudge(habit.id) : undefined}
                isNudged={!!nudgedHabits[habit.id]}
                nudgeLoading={!!nudgeLoading[habit.id]}
                hideName={habit.hide_name}
                hideDescription={habit.hide_description}
                shareNameFriends={habit.share_name_friends}
                shareDescFriends={habit.share_desc_friends}
                currentViewerId={currentViewerId}
                habitId={habit.id}
                description={habit.description}
                poeticSummary={habit.poetic_summary}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
