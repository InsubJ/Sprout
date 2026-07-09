import React, { useState, useEffect, useRef } from 'react';
import { Habit } from '../../types/habit';
import { Profile } from '../../types/profile';
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
  const [currentIndex, setCurrentIndex] = useState(0);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Helper to check if a habit is watered today
  const isWateredToday = (habit: Habit): boolean => {
    // If the habit is completed, it's not active anymore, but here we only handle in-progress.
    // Let's check streak or waterings. Wait, the cleanest way is comparing logs,
    // but in memory, let's see: we can check if it has been watered today by checking
    // when it was last updated or if its streak is active. 
    // In our MockLogService, when a log is created, it increments current_waterings.
    // Wait, let's look at how we can tell if a habit is watered today:
    // We can query the logs inside our parent component and pass this info,
    // or we can deduce it from streak and misses.
    // Wait! Let's check if the habit has a record of last check-in.
    // Since we don't have a "last_watered_at" field in Habit, we can pass "wateredToday"
    // from the logs list. Let's do that! We can fetch the logs in the parent page
    // and see which habit IDs have logs created today, then pass that.
    // Actually, we can check logs in the parent component easily.
    // Wait, we can also query local storage directly here or write a check!
    // Since mock logs are in local storage under 'sprout_logs':
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

  // Ensure currentIndex stays within bounds
  useEffect(() => {
    if (currentIndex >= filteredHabits.length) {
      setCurrentIndex(Math.max(0, filteredHabits.length - 1));
    }
  }, [filteredHabits.length, currentIndex]);

  // Keypress listener (Left / Right Arrow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredHabits.length === 0) return;
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + filteredHabits.length) % filteredHabits.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % filteredHabits.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredHabits.length]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (filteredHabits.length === 0) return;
    const threshold = 50;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > threshold) {
      // swipe left (next)
      setCurrentIndex((prev) => (prev + 1) % filteredHabits.length);
    } else if (diff < -threshold) {
      // swipe right (prev)
      setCurrentIndex((prev) => (prev - 1 + filteredHabits.length) % filteredHabits.length);
    }
  };

  const handleNavClick = (index: number) => {
    setCurrentIndex(index);
  };

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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentIndex(0);
            }}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterChips}>
          <button
            onClick={() => { setFilterType('all'); setCurrentIndex(0); }}
            className={`${styles.filterChip} ${filterType === 'all' ? styles.activeFilter : ''}`}
          >
            All
          </button>
          <button
            onClick={() => { setFilterType('watered'); setCurrentIndex(0); }}
            className={`${styles.filterChip} ${filterType === 'watered' ? styles.activeFilter : ''}`}
          >
            💧 Watered
          </button>
          <button
            onClick={() => { setFilterType('needs_water'); setCurrentIndex(0); }}
            className={`${styles.filterChip} ${filterType === 'needs_water' ? styles.activeFilter : ''}`}
          >
            🍂 Needs Water
          </button>
        </div>
      </section>

      {/* No plants found message */}
      {filteredHabits.length === 0 ? (
        <div className={styles.emptySearch}>
          <span className={styles.emptyIcon}>🌾</span>
          <h3>No plants found</h3>
          <p>Try adjusting your search term or filters.</p>
        </div>
      ) : (
        <div 
          className={styles.viewport}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Garden 3D Stage (Desktop) / Carousel Stage (Mobile) */}
          <div className={styles.stage}>
            {filteredHabits.map((habit, index) => {
              const len = filteredHabits.length;
              let diff = index - currentIndex;
              
              // Find shortest circular distance
              if (diff > len / 2) diff -= len;
              if (diff < -len / 2) diff += len;

              // Only render nearby elements to preserve DOM and performance
              const isVisible = Math.abs(diff) <= 1 || (len === 2 && Math.abs(diff) === 1);
              if (!isVisible) return null;

              let placementClass = styles.center;
              if (diff < 0) placementClass = styles.left;
              if (diff > 0) placementClass = styles.right;

              // Owner check for passing watering triggers
              const handleWaterClick = onWater ? () => onWater(habit.id) : undefined;
              const handleWaterWithDetailsClick = onWaterWithDetails ? (note: string, img?: string) => onWaterWithDetails(habit.id, note, img) : undefined;

              return (
                <div
                  key={habit.id}
                  onClick={() => handleNavClick(index)}
                  className={`${styles.plantWrapper} ${placementClass}`}
                >
                  <HabitCard
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
                </div>
              );
            })}
          </div>

          {/* Quick Dots Navigator */}
          {filteredHabits.length > 1 && (
            <div className={styles.navigator}>
              {filteredHabits.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(index)}
                  className={`${styles.navDot} ${index === currentIndex ? styles.activeDot : ''}`}
                  aria-label={`Go to plant ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Arrow controls (desktop only helper overlays) */}
          {filteredHabits.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentIndex((prev) => (prev - 1 + filteredHabits.length) % filteredHabits.length)}
                className={`${styles.arrowBtn} ${styles.arrowLeft}`}
                aria-label="Previous plant"
              >
                ‹
              </button>
              <button 
                onClick={() => setCurrentIndex((prev) => (prev + 1) % filteredHabits.length)}
                className={`${styles.arrowBtn} ${styles.arrowRight}`}
                aria-label="Next plant"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
