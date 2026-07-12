import React, { useEffect, useRef, useState } from 'react';
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
  /** Controls whether the search input is displayed. Defaults to true. */
  showSearch?: boolean;
  /** Controls whether the Watered / Needs Water filters are displayed. Defaults to true. */
  showFilters?: boolean;
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
  showSearch = true,
  showFilters = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'watered' | 'needs_water'>('all');
  const gridRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

    if (!showFilters) {
      return matchesSearch;
    }

    if (filterType === 'watered') {
      return matchesSearch && isWatered;
    } else if (filterType === 'needs_water') {
      return matchesSearch && !isWatered;
    }
    return matchesSearch;
  });

  // Whether the forest is completely empty (no habits at all, before search)
  const isEmpty = habits.length === 0;

  const updateScrollButtons = React.useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const maxScrollLeft = grid.scrollWidth - grid.clientWidth;
    setCanScrollLeft(grid.scrollLeft > 4);
    setCanScrollRight(grid.scrollLeft < maxScrollLeft - 4);
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleResize = () => updateScrollButtons();

    grid.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', handleResize);

    const frame = window.requestAnimationFrame(updateScrollButtons);

    return () => {
      window.cancelAnimationFrame(frame);
      grid.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', handleResize);
    };
  }, [filteredHabits.length, isEmpty, isVisitor, updateScrollButtons]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    const grid = gridRef.current;
    if (!grid) return;

    const firstCard = grid.firstElementChild as HTMLElement | null;
    const cardWidth =
      firstCard?.getBoundingClientRect().width ?? grid.clientWidth;
    const computedStyle = window.getComputedStyle(grid);
    const gap = Number.parseFloat(
      computedStyle.columnGap || computedStyle.gap || '0'
    );

    grid.scrollBy({
      left:
        direction === 'left'
          ? -(cardWidth + gap)
          : cardWidth + gap,
      behavior: 'smooth',
    });
  };

  return (
    <div className={styles.carouselContainer}>
      {/* Optional search and filter controls */}
      {!isEmpty && (showSearch || showFilters) && (
        <section className={styles.controlsBar}>
          {showSearch && (
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
          )}

          {showFilters && (
            <div className={styles.filterChips}>
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`${styles.filterChip} ${filterType === 'all' ? styles.activeFilter : ''}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType('watered')}
                className={`${styles.filterChip} ${filterType === 'watered' ? styles.activeFilter : ''}`}
              >
                💧 Watered
              </button>
              <button
                type="button"
                onClick={() => setFilterType('needs_water')}
                className={`${styles.filterChip} ${filterType === 'needs_water' ? styles.activeFilter : ''}`}
              >
                🍂 Needs Water
              </button>
            </div>
          )}
        </section>
      )}

      {/* Always-visible horizontal scroll grid */}
      <div className={styles.carouselViewport}>
        <button
          type="button"
          className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
          onClick={() => scrollCarousel('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll carousel left"
        >
          ‹
        </button>

        <div
          ref={gridRef}
          className={styles.grid}
          data-testid="habits-grid"
        >
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
                    type="button"
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
              <p className={styles.emptyCardText}>
                Try adjusting your search term or filters.
              </p>
            </div>
          ) : (
            /* Habit cards */
            filteredHabits.map((habit) => {
              const handleWaterClick = onWater
                ? () => onWater(habit.id)
                : undefined;
              const handleWaterWithDetailsClick = onWaterWithDetails
                ? (note: string, img?: string) =>
                  onWaterWithDetails(habit.id, note, img)
                : undefined;

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
                  isNudged={Boolean(nudgedHabits[habit.id])}
                  nudgeLoading={Boolean(nudgeLoading[habit.id])}
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

        <button
          type="button"
          className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
          onClick={() => scrollCarousel('right')}
          disabled={!canScrollRight}
          aria-label="Scroll carousel right"
        >
          ›
        </button>
      </div>
    </div>
  );
};