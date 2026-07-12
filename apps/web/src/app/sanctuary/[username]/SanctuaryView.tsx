'use client';

import React from 'react';
import { useAuth } from '../../../components/common/AppProviders';
import { useFriendForest } from '../../../hooks/useFriendForest';
import { GardenCarousel } from '../../../components/habit/GardenCarousel';
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
  const [plantView, setPlantView] = React.useState<'active' | 'completed'>(defaultTab);

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

  const activeHabits = publicHabits.filter((habit) => habit.status !== 'completed');
  const completedHabits = publicHabits.filter((habit) => habit.status === 'completed');
  const isOwnProfile = friendProfile?.id === currentUser?.id;

  // A user's own Sanctuary remains a completed-tree archive.
  // Friend view can switch between the friend's active and completed plants.
  const visiblePlantView = isOwnProfile ? 'completed' : plantView;
  const visibleHabits =
    visiblePlantView === 'active' ? activeHabits : completedHabits;

  const sectionTitle =
    visiblePlantView === 'active' ? 'Active Plants' : 'Fully Grown Trees';

  const sectionIcon = visiblePlantView === 'active' ? '🌿' : '🌸';

  return (
    <div className={styles.container} data-testid="sanctuary-page">
      {friendProfile && (
        <>
          {!isOwnProfile && (
            <div className={styles.visitingBanner} data-testid="visiting-banner">
              <span>👋</span> Visiting {friendProfile.display_name || friendProfile.username}&apos;s Sanctuary
            </div>
          )}

          {/* Page title — matches the Forest dashboard title treatment */}
          <header className={styles.profileHeader} data-testid="profile-header">
            <div className={styles.profileTitleGroup}>
              <h1 className={styles.displayName} data-testid="profile-display-name">
                {friendProfile.display_name || friendProfile.username}&apos;s Sanctuary
              </h1>
            </div>

            {!isOwnProfile && !isMutuallyConnected && (
              <span
                className={`${styles.connectionBadge} ${styles.notConnected}`}
                data-testid="connection-status"
              >
                🔒 Mutual Connection Required
              </span>
            )}
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
              {!isOwnProfile && (
                <div
                  className={styles.plantViewTabs}
                  role="tablist"
                  aria-label="Filter sanctuary plants"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={plantView === 'active'}
                    className={`${styles.plantViewTab} ${plantView === 'active' ? styles.activePlantViewTab : ''
                      }`}
                    onClick={() => setPlantView('active')}
                  >
                    🌿 Active ({activeHabits.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={plantView === 'completed'}
                    className={`${styles.plantViewTab} ${plantView === 'completed' ? styles.activePlantViewTab : ''
                      }`}
                    onClick={() => setPlantView('completed')}
                  >
                    🌸 Completed ({completedHabits.length})
                  </button>
                </div>
              )}

              <h2 className={`${styles.sectionTitle} ${styles.centeredTitle}`}>
                <span>{sectionIcon}</span> {sectionTitle}
              </h2>

              {visibleHabits.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>
                    {visiblePlantView === 'active' ? '🌱' : '🪵'}
                  </span>
                  <p className={styles.emptyText}>
                    {visiblePlantView === 'active'
                      ? 'No active plants in this forest.'
                      : 'No completed trees in this sanctuary yet.'}
                  </p>
                  <p className={styles.emptySubtext}>
                    {visiblePlantView === 'active'
                      ? 'Active habits will appear here while they are still growing.'
                      : 'Completed trees will be transplanted here to be admired forever.'}
                  </p>
                </div>
              ) : (
                <GardenCarousel
                  habits={visibleHabits}
                  currentViewerId={currentUserId}
                  isVisitor
                  showSearch
                  showFilters={false}
                  onNudge={
                    visiblePlantView === 'active' && !isOwnProfile
                      ? handleSendNudge
                      : undefined
                  }
                />
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