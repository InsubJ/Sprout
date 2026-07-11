'use client';

import React from 'react';
import { useAuth } from '../../../components/common/AppProviders';
import { useFriendForest } from '../../../hooks/useFriendForest';
import { HabitCard } from '../../../components/habit/HabitCard';
import { Modal } from '../../../components/common/Modal';
import { useWitherNudge } from '../../../hooks/useWitherNudge';
import { NudgeService } from '../../../services/nudgeService';
import styles from './SanctuaryPage.module.css';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export interface SanctuaryProps {
  params: {
    username: string;
  };
  searchParams?: {
    currentUserId?: string;
  };
  defaultTab?: 'active' | 'completed';
  customNudgeService?: NudgeService;
}

export function Sanctuary({
  params,
  searchParams,
  defaultTab = 'completed',
  customNudgeService,
}: SanctuaryProps) {
  const { currentUser } = useAuth();
  const { username } = params;

  if (!username || username.trim() === '') {
    throw new Error('Username parameter is required');
  }

  const currentUserId = searchParams?.currentUserId || currentUser?.id || '11111111-1111-1111-1111-111111111111';
  if (!uuidRegex.test(currentUserId)) {
    throw new Error('Current User ID must be a valid UUID');
  }

  const {
    friendProfile,
    isMutuallyConnected,
    publicHabits,
    loading,
    error,
  } = useFriendForest(username, currentUserId);

  const {
    sendNudge,
    checkNudgeStatus,
  } = useWitherNudge(currentUserId, friendProfile?.id, customNudgeService);

  const [isNudgeSuccessOpen, setIsNudgeSuccessOpen] = React.useState(false);

  const handleSendNudge = React.useCallback(async (habitId: string) => {
    try {
      await sendNudge(habitId);
      setIsNudgeSuccessOpen(true);
    } catch (err: any) {
      console.error('Nudge failed:', err);
    }
  }, [sendNudge]);

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

  if (loading) {
    return (
      <div className={styles.loadingContainer} data-testid="loading-indicator">
        <div className={styles.spinner} />
        <p>Opening the sanctuary gates...</p>
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

  // Only show completed habits — active ones live in the Forest (Dashboard)
  const completedHabits = publicHabits.filter((h) => h.status === 'completed');
  const isOwnProfile = friendProfile?.id === currentUser?.id;

  return (
    <div className={styles.container} data-testid="sanctuary-page">
      {friendProfile && (
        <>
          {!isOwnProfile && (
            <div className={styles.visitingBanner} data-testid="visiting-banner">
              <span>👋</span> Visiting {friendProfile.display_name || friendProfile.username}&apos;s Sanctuary
            </div>
          )}

          {/* Profile Header */}
          <header className={styles.profileHeader} data-testid="profile-header">
            <div className={styles.profileDetails}>
              <h1 className={styles.displayName} data-testid="profile-display-name">
                {friendProfile.display_name || friendProfile.username}&apos;s Sanctuary
              </h1>
              {!isOwnProfile && !isMutuallyConnected && (
                <span
                  className={`${styles.connectionBadge} ${styles.notConnected}`}
                  data-testid="connection-status"
                >
                  🔒 Mutual Connection Required
                </span>
              )}
            </div>
          </header>

          {/* Connection Check */}
          {!isMutuallyConnected ? (
            <div className={styles.warningBox} data-testid="connection-warning">
              <span className={styles.warningIcon}>🔒</span>
              <h2 className={styles.warningTitle} data-testid="warning-title">Connection Required</h2>
              <p className={styles.warningDescription} data-testid="warning-description">
                {`You must be mutually connected with @${friendProfile.username} to see their completed trees.`}
              </p>
            </div>
          ) : (
            <section className={styles.section}>
              <h2 className={`${styles.sectionTitle} ${styles.centeredTitle}`}>
                <span>🌸</span> Fully Grown Trees
              </h2>

              {completedHabits.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>🪵</span>
                  <p className={styles.emptyText}>No completed trees in this sanctuary yet.</p>
                  <p className={styles.emptySubtext}>
                    Completed trees (fully watered habits) will be transplanted here to be admired forever.
                  </p>
                </div>
              ) : (
                <div className={styles.grid} data-testid="habits-grid">
                  {completedHabits.map((habit) => (
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
                      hideName={habit.hide_name}
                      hideDescription={habit.hide_description}
                      shareNameFriends={habit.share_name_friends}
                      shareDescFriends={habit.share_desc_friends}
                      currentViewerId={currentUserId}
                      habitId={habit.id}
                      description={habit.description}
                      poeticSummary={habit.poetic_summary}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* Nudge Success Confirmation Modal */}
      <Modal isOpen={isNudgeSuccessOpen} onClose={() => setIsNudgeSuccessOpen(false)} title="Nudge Sent!">
        <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1.25rem' }}>🔔</span>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--color-evergreen)', fontWeight: 700, margin: '0 0 0.75rem 0' }}>
            Nudge Sent Successfully!
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#6e8274', margin: '0 0 1.75rem 0', lineHeight: 1.5 }}>
            You have sent a water reminder nudge to @{friendProfile?.username}. They will see this notification when they check their forest.
          </p>
          <button
            onClick={() => setIsNudgeSuccessOpen(false)}
            data-testid="nudge-confirm-ok"
            style={{
              backgroundColor: 'var(--color-forest-green)',
              color: 'var(--color-sand)',
              border: 'none',
              padding: '0.65rem 2.5rem',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(45, 90, 39, 0.2)',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
            }}
          >
            Okay
          </button>
        </div>
      </Modal>
    </div>
  );
}
