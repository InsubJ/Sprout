import React, { useState } from 'react';
import { HabitFrequency, HabitStatus, DifficultyTier } from '../../types/habit';
import styles from './HabitCard.module.css';
import { PlantRenderer } from './PlantRenderer';
import { WaterConfirmModal } from './WaterConfirmModal';
import { ReflectionBookModal } from './ReflectionBookModal';
import { formatPlantType } from '../../utils/plantFormatting';

export interface HabitCardProps {
  name: string;
  frequency: HabitFrequency;
  status: HabitStatus;
  currentStreak: number;
  currentWaterings: number;
  targetWaterings: number;
  witherThreshold?: number;
  consecutiveMisses?: number;
  plantType?: string;
  difficultyTier?: DifficultyTier;
  witherCount?: number;
  onWater?: () => void;
  onNudge?: () => void;
  isNudged?: boolean;
  nudgeLoading?: boolean;
  hideName?: boolean;
  hideDescription?: boolean;
  shareNameFriends?: string[];
  shareDescFriends?: string[];
  currentViewerId?: string;
  habitId?: string;
  description?: string | null;
  poeticSummary?: string | null;
  onWaterWithDetails?: (note: string, imageUrl?: string) => void;
}

const FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  twice_daily: 'Twice Daily',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
  flexible: 'Flexible',
};

const DIFFICULTY_COLORS: Record<DifficultyTier, string> = {
  common: styles.tierCommon,
  uncommon: styles.tierUncommon,
  rare: styles.tierRare,
  mythical: styles.tierMythical,
};

export const HabitCard: React.FC<HabitCardProps> = ({
  name,
  frequency,
  status,
  currentStreak,
  currentWaterings,
  targetWaterings,
  witherThreshold = 3,
  consecutiveMisses = 0,
  plantType = 'Seedling',
  difficultyTier = 'common',
  witherCount = 0,
  onWater,
  onNudge,
  isNudged = false,
  nudgeLoading = false,
  hideName = false,
  hideDescription = false,
  shareNameFriends = [],
  shareDescFriends = [],
  currentViewerId,
  habitId,
  description = null,
  poeticSummary = null,
  onWaterWithDetails,
}) => {
  // Preconditions validation
  if (!name || !name.trim()) {
    throw new Error('Habit name cannot be empty');
  }
  if (targetWaterings <= 0) {
    throw new Error('Target waterings must be a positive integer');
  }
  if (currentWaterings < 0) {
    throw new Error('Current waterings cannot be negative');
  }
  if (witherThreshold <= 0) {
    throw new Error('Wither threshold must be a positive integer');
  }
  if (consecutiveMisses < 0) {
    throw new Error('Consecutive misses cannot be negative');
  }
  if (witherCount < 0) {
    throw new Error('Wither count cannot be negative');
  }

  const [isWaterOpen, setIsWaterOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);

  const isOwner = !!onWater;

  // Determine if name is hidden from this viewer
  const isNameHidden =
    !isOwner &&
    hideName &&
    (!currentViewerId || !shareNameFriends.includes(currentViewerId));

  // Determine if description is hidden from this viewer
  const isDescHidden =
    !isOwner &&
    hideDescription &&
    (!currentViewerId || !shareDescFriends.includes(currentViewerId));

  const displayName = isNameHidden ? 'Private Plant' : name;
  const displayDescription = isDescHidden ? 'Private description' : description;

  // Calculate progress
  const progressPercentage = Math.min(
    100,
    Math.round((currentWaterings / targetWaterings) * 100)
  );

  // Consistency Dots rendering logic
  const renderConsistencyDots = () => {
    if (status === 'completed') return null;

    const dots = [];
    // Number of active (hydrated) dots is witherThreshold - consecutiveMisses
    const activeDotsCount = Math.max(0, witherThreshold - consecutiveMisses);

    for (let i = 0; i < witherThreshold; i++) {
      const isHydrated = i < activeDotsCount;
      dots.push(
        <span
          key={i}
          className={`${styles.dot} ${isHydrated ? styles.dotHydrated : styles.dotDehydrated}`}
          data-testid={isHydrated ? 'dot-hydrated' : 'dot-dehydrated'}
          title={isHydrated ? 'Hydrated day' : 'Missed day'}
        />
      );
    }

    return (
      <div className={styles.consistencyContainer} data-testid="consistency-indicator">
        <span className={styles.consistencyLabel}>Hydration:</span>
        <div className={styles.dotsRow}>{dots}</div>
      </div>
    );
  };

  // Get status badge
  const renderStatusBadge = () => {
    let statusText = 'Healthy';
    let badgeClass = styles.statusHealthy;
    let statusIcon = '🌱';

    if (status === 'withered') {
      statusText = 'Withered';
      badgeClass = styles.statusWithered;
      statusIcon = '🍂';
    } else if (status === 'completed') {
      statusText = 'Completed';
      badgeClass = styles.statusCompleted;
      statusIcon = '🌸';
    }

    return (
      <div className={`${styles.statusBadge} ${badgeClass}`} data-testid={`status-${status}`}>
        <span className={styles.statusIcon}>{statusIcon}</span>
        <span>{statusText}</span>
      </div>
    );
  };

  // Check daily watering limits
  const getWateringsToday = (): number => {
    if (!habitId) return 0;
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return 0;
    try {
      const stored = localStorage.getItem('sprout_logs');
      if (!stored) return 0;
      const logs = JSON.parse(stored);
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const todayEnd = todayStart + 24 * 60 * 60 * 1000;

      const todaysLogs = logs.filter((l: any) => {
        const time = new Date(l.created_at).getTime();
        return l.habit_id === habitId && time >= todayStart && time < todayEnd;
      });
      return todaysLogs.length;
    } catch {
      return 0;
    }
  };

  const wateringsToday = getWateringsToday();
  const maxPerDay = frequency === 'twice_daily' ? 2 : 1;
  const isLimitReached = wateringsToday >= maxPerDay;

  const [showWateringTooltip, setShowWateringTooltip] = useState(false);
  const [tooltipTimeoutId, setTooltipTimeoutId] = useState<any>(null);

  const handleWaterTap = (e: React.MouseEvent) => {
    if (isLimitReached) {
      e.stopPropagation();
      setShowWateringTooltip(true);
      if (tooltipTimeoutId) {
        clearTimeout(tooltipTimeoutId);
      }
      const timeout = setTimeout(() => {
        setShowWateringTooltip(false);
      }, 3000);
      setTooltipTimeoutId(timeout);
    }
  };

  return (
    <div className={styles.card} data-testid="habit-card">
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.name} data-testid="habit-name">
            {displayName}
          </h3>
          <div className={styles.metaRow}>
            <span className={styles.frequencyBadge} data-testid="habit-frequency">
              {FREQUENCY_LABELS[frequency]}
            </span>
            <span className={`${styles.tierBadge} ${DIFFICULTY_COLORS[difficultyTier]}`} data-testid="habit-tier">
              {difficultyTier}
            </span>
          </div>
        </div>
        {renderStatusBadge()}
      </div>

      <div className={styles.plantVisualContainer} data-testid="plant-visual-container">
        <PlantRenderer
          plantType={plantType}
          currentWaterings={currentWaterings}
          targetWaterings={targetWaterings}
          witherCount={witherCount}
          status={status}
          size={185}
        />
        {status !== 'completed' && onWater && (
          <div
            className={styles.wateringCanWrapper}
            onMouseEnter={() => {
              if (isLimitReached) {
                setShowWateringTooltip(true);
              }
            }}
            onMouseLeave={() => {
              setShowWateringTooltip(false);
            }}
            onClick={handleWaterTap}
          >
            <button
              type="button"
              className={styles.wateringCanBtn}
              onClick={(e) => {
                if (isLimitReached) {
                  e.stopPropagation();
                  return;
                }
                if (onWaterWithDetails) {
                  setIsWaterOpen(true);
                } else {
                  onWater();
                }
              }}
              disabled={isLimitReached}
              data-testid="water-button"
              aria-label="Water plant"
            >
              <svg
                className={styles.wateringCanIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 12h8v5a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3v-5z" />
                <path d="M7 12V9a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" />
                <path d="M15 16l5-4" />
                <path d="M19 10l2.5 2.5" />
                <path d="M7 14a4 4 0 0 1-4-4v0a4 4 0 0 1 4-4h1" />
              </svg>
            </button>
            {showWateringTooltip && (
              <div className={styles.wateringTooltip} data-testid="watering-tooltip">
                daily watering limit reached
              </div>
            )}
          </div>
        )}

        {/* Book Button */}
        {habitId && (
          <button
            type="button"
            className={styles.bookBtn}
            onClick={() => setIsBookOpen(true)}
            data-testid="book-button"
            aria-label="Open Reflection Book"
            title="Reflection Book"
          >
            📖
          </button>
        )}
      </div>

      <div className={styles.plantDetails}>
        <span className={styles.plantLabel}>Plant Specimen:</span>
        <span className={styles.plantValue} data-testid="plant-type">
          {formatPlantType(plantType)}
        </span>
      </div>

      {/* Consistency Indicators */}
      {renderConsistencyDots()}

      {/* Progress Bar Section */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Growth Progress</span>
          <span className={styles.progressText} data-testid="progress-text">
            {currentWaterings} / {targetWaterings} ({progressPercentage}%)
          </span>
        </div>
        <div className={styles.progressBarBg}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${progressPercentage}%` }}
            data-testid="progress-bar-fill"
          />
        </div>
      </div>

      {/* Card Footer / Stats */}
      <div className={styles.footer}>
        <div className={styles.streakContainer} data-testid="habit-streak">
          <span className={styles.streakIcon}>🔥</span>
          <span className={styles.streakCount}>{currentStreak}</span>
          <span className={styles.streakText}>streak</span>
        </div>

        {status === 'withered' && onNudge && (
          <button
            type="button"
            className={styles.nudgeButton}
            onClick={onNudge}
            disabled={isNudged || nudgeLoading}
            data-testid="nudge-button"
            aria-label={isNudged ? "Already nudged today" : "Nudge friend"}
            title={isNudged ? "Already nudged today (Limit: 1 per day)" : "Nudge friend to water this habit (Limit: 1 per day)"}
          >
            {isNudged ? 'Nudged' : 'Nudge'}
          </button>
        )}
        {status === 'completed' && (
          <div className={styles.completedMessage} data-testid="completed-msg">
            ✨ Fully Grown
          </div>
        )}
      </div>

      {isWaterOpen && (
        <WaterConfirmModal
          isOpen={isWaterOpen}
          onClose={() => setIsWaterOpen(false)}
          onSubmit={(note, imageUrl) => {
            if (onWaterWithDetails) {
              onWaterWithDetails(note, imageUrl);
            } else if (onWater) {
              onWater();
            }
          }}
          plantName={displayName}
        />
      )}

      {isBookOpen && habitId && (
        <ReflectionBookModal
          isOpen={isBookOpen}
          onClose={() => setIsBookOpen(false)}
          habitId={habitId}
          plantName={displayName}
          plantType={plantType}
          description={displayDescription}
          poeticSummary={poeticSummary}
        />
      )}
    </div>
  );
};

