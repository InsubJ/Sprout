'use client';

import React from 'react';
import { useFriendForest } from '../../../hooks/useFriendForest';
import { HabitCard } from '../../../components/habit/HabitCard';
import { useWitherNudge } from '../../../hooks/useWitherNudge';
import { NudgeService } from '../../../services/nudgeService';
import styles from './FriendForestPage.module.css';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export interface FriendForestPageProps {
  params: {
    username: string;
  };
  searchParams?: {
    currentUserId?: string;
  };
  customNudgeService?: NudgeService;
}

function FriendForestPage({
  params,
  searchParams,
  customNudgeService,
}: FriendForestPageProps) {
  // Preconditions Check
  const { username } = params;
  if (!username || username.trim() === '') {
    throw new Error('Username parameter is required');
  }

  const currentUserId = searchParams?.currentUserId || '11111111-1111-1111-1111-111111111111';
  if (!uuidRegex.test(currentUserId)) {
    throw new Error('Current User ID must be a valid UUID');
  }

  const {
    friendProfile,
    isMutuallyConnected,
    publicHabits,
    recentLogs,
    activeProgress,
    loading,
    error,
  } = useFriendForest(username, currentUserId);

  const {
    nudgedHabits,
    loadingHabits,
    sendNudge,
    checkNudgeStatus,
  } = useWitherNudge(currentUserId, friendProfile?.id, customNudgeService);

  // Load nudge statuses for withered public habits
  React.useEffect(() => {
    if (friendProfile && friendProfile.id !== currentUserId) {
      publicHabits.forEach(habit => {
        if (habit.status === 'withered') {
          checkNudgeStatus(habit.id);
        }
      });
    }
  }, [friendProfile, publicHabits, currentUserId, checkNudgeStatus]);

  const getInitials = (displayName: string | null, uname: string) => {
    const name = displayName || uname;
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getHabitName = (habitId: string) => {
    const habit = publicHabits.find(h => h.id === habitId);
    return habit ? habit.name : 'a habit';
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer} data-testid="loading-indicator">
        <div className={styles.spinner} />
        <p>Walking into the forest...</p>
      </div>
    );
  }

  if (error && !friendProfile) {
    return (
      <div className={styles.container} data-testid="error-container">
        <div className={styles.warningBox}>
          <span className={styles.warningIcon}>⚠️</span>
          <h2 className={styles.warningTitle}>Something went wrong</h2>
          <p className={styles.warningDescription}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} data-testid="friend-forest-page">
      <a href="#" className={styles.backLink}>
        <span>←</span> Back to Dashboard
      </a>

      {friendProfile && (
        <>
          {/* Profile Header */}
          <header className={styles.profileHeader} data-testid="profile-header">
            <div className={styles.avatarContainer}>
              {friendProfile.avatar_url ? (
                <img
                  src={friendProfile.avatar_url}
                  alt={friendProfile.username}
                  className={styles.avatar}
                  data-testid="profile-avatar"
                />
              ) : (
                <div className={styles.avatarFallback} data-testid="profile-avatar-fallback">
                  {getInitials(friendProfile.display_name, friendProfile.username)}
                </div>
              )}
            </div>
            <div className={styles.profileDetails}>
              <h1 className={styles.displayName} data-testid="profile-display-name">
                {friendProfile.display_name || friendProfile.username}
              </h1>
              <span className={styles.username} data-testid="profile-username">
                @{friendProfile.username}
              </span>
              <span
                className={`${styles.connectionBadge} ${
                  isMutuallyConnected ? styles.connected : styles.notConnected
                }`}
                data-testid="connection-status"
              >
                {isMutuallyConnected ? '🟢 Connected' : '🔒 Mutual Connection Required'}
              </span>
            </div>
          </header>

          {/* Connection Check / Warning */}
          {!isMutuallyConnected ? (
            <div className={styles.warningBox} data-testid="connection-warning">
              <span className={styles.warningIcon}>🔒</span>
              <h2 className={styles.warningTitle} data-testid="warning-title">Connection Required</h2>
              <p className={styles.warningDescription} data-testid="warning-description">
                You must be mutually connected with @{friendProfile.username} to see their forest trees and habit activities.
              </p>
            </div>
          ) : (
            <>
              {/* Stats / Active Progress Overview */}
              <section className={styles.statsBar} data-testid="active-progress-stats">
                <div className={styles.statCard}>
                  <div className={styles.statValue} data-testid="stat-total-habits">
                    {activeProgress.totalHabits}
                  </div>
                  <div className={styles.statLabel}>Total Trees</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue} data-testid="stat-healthy" style={{ color: '#2d5a27' }}>
                    {activeProgress.healthyCount}
                  </div>
                  <div className={styles.statLabel}>Healthy</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue} data-testid="stat-withered" style={{ color: '#c26555' }}>
                    {activeProgress.witheredCount}
                  </div>
                  <div className={styles.statLabel}>Withered</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue} data-testid="stat-completed" style={{ color: '#eaa89b' }}>
                    {activeProgress.completedCount}
                  </div>
                  <div className={styles.statLabel}>Fully Grown</div>
                </div>
              </section>

              {/* public trees list */}
              <section className={styles.section} data-testid="trees-section">
                <h2 className={styles.sectionTitle}>
                  <span>🌳</span> Public Trees
                </h2>
                {publicHabits.length === 0 ? (
                  <div className={styles.emptyState} data-testid="empty-trees-state">
                    <span className={styles.emptyIcon}>🌱</span>
                    <p className={styles.emptyText}>This forest has no public trees planted yet.</p>
                  </div>
                ) : (
                  <div className={styles.grid} data-testid="habits-grid">
                    {publicHabits.map(habit => {
                      const isVisitor = friendProfile && friendProfile.id !== currentUserId;
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
                          onNudge={isVisitor && habit.status === 'withered' ? () => sendNudge(habit.id) : undefined}
                          isNudged={!!nudgedHabits[habit.id]}
                          nudgeLoading={!!loadingHabits[habit.id]}
                        />
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Activity Feed */}
              <section className={styles.section} data-testid="activities-section">
                <h2 className={styles.sectionTitle}>
                  <span>💧</span> Recent Activity
                </h2>
                {recentLogs.length === 0 ? (
                  <div className={styles.emptyState} data-testid="empty-activities-state">
                    <span className={styles.emptyIcon}>💨</span>
                    <p className={styles.emptyText}>No recent watering activity recorded.</p>
                  </div>
                ) : (
                  <div className={styles.activityList} data-testid="activity-list">
                    {recentLogs.map(log => (
                      <div key={log.id} className={styles.activityItem} data-testid="activity-item">
                        <div className={styles.activityIcon}>💧</div>
                        <div className={styles.activityDetails}>
                          <p className={styles.activityText}>
                            Watered <strong>{getHabitName(log.habit_id)}</strong>
                          </p>
                          <span className={styles.activityTime}>{formatTime(log.created_at)}</span>
                          {log.note && (
                            <span className={styles.activityNote} data-testid="activity-note">
                              &ldquo;{log.note}&rdquo;
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default FriendForestPage as any;

