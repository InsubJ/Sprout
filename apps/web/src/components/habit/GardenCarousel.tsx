import React, { useState, useEffect } from 'react';
import { Habit } from '../../types/habit';
import { HabitCard } from './HabitCard';
import { DiscoHabitCard } from './DiscoHabitCard';
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
  /** Called when the user clicks "Plant New Seed" from the inline empty card */
  onPlantSeed?: () => void;
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
  onPlantSeed,
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

  // Whether the forest is completely empty (no habits at all, before search)
  const isEmpty = habits.length === 0;

  return (
    <div className={styles.carouselContainer}>
      {/* Search and Filters Bar — only shown when there are habits to filter */}
      {!isEmpty && (
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
      )}

      {/* Always-visible horizontal scroll grid */}
      <div className={styles.grid} data-testid="habits-grid">
        {isEmpty ? (
          /* Empty forest — show a prompt card as the first item */
          !isVisitor && (
            <div className={styles.emptyCard}>
              <span className={styles.emptyCardIcon}>🌱</span>
              <h3 className={styles.emptyCardTitle}>Your forest is empty!</h3>
              <p className={styles.emptyCardText}>
                Plant your first seed and start growing your virtual forest.
              </p>
              {onPlantSeed && (
                <button
                  className={styles.emptyCardBtn}
                  onClick={onPlantSeed}
                >
                  🌱 Plant New Seed
                </button>
              )}
            </div>
          )
        ) : filteredHabits.length === 0 ? (
          /* Search/filter produced no results — show inline no-match card */
          <div className={styles.emptyCard}>
            <span className={styles.emptyCardIcon}>🌾</span>
            <h3 className={styles.emptyCardTitle}>No plants found</h3>
            <p className={styles.emptyCardText}>Try adjusting your search term or filters.</p>
          </div>
        ) : (
          /* Habit cards */
          filteredHabits.map((habit) => {
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
          })
        )}

        {/* Disco Plant — always last, always visible to the owner */}
        {!isVisitor && <DiscoHabitCard />}
      </div>
    </div>
  );
};
