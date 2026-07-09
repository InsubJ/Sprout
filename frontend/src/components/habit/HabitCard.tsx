import React from 'react';
import { HabitFrequency, HabitStatus, DifficultyTier } from '../../types/habit';
import styles from './HabitCard.module.css';
import { PlantRenderer } from './PlantRenderer';

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

  return (
    <div className={styles.card} data-testid="habit-card">
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.name} data-testid="habit-name">
            {name}
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
          size={160}
        />
        {status !== 'completed' && onWater && (
          <button
            type="button"
            className={styles.wateringCanBtn}
            onClick={onWater}
            data-testid="water-button"
            aria-label="Water plant"
            title="Water plant"
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
              <path d="M3 11a4 4 0 0 0 4 4h7a4 4 0 0 0 4-4v-3H3v3z" />
              <path d="M8 8a3 3 0 0 0-3-3H4a2 2 0 0 0-2 2v2" />
              <path d="M18 10l4-2v4l-4-2" />
              <path d="M9 8h4" />
            </svg>
          </button>
        )}
      </div>

      <div className={styles.plantDetails}>
        <span className={styles.plantLabel}>Plant Specimen:</span>
        <span className={styles.plantValue} data-testid="plant-type">
          {plantType}
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
    </div>
  );
};

