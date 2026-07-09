'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../../components/common/AppProviders';
import { useFriendForest } from '../../../hooks/useFriendForest';
import { HabitCard } from '../../../components/habit/HabitCard';
import styles from './SanctuaryPage.module.css';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

interface SanctuaryPageProps {
  params: {
    username: string;
  };
  searchParams?: {
    currentUserId?: string;
  };
}

export default function SanctuaryPage({
  params,
  searchParams,
}: SanctuaryPageProps) {
  const { currentUser } = useAuth();
  const { username } = params;

  if (!username || username.trim() === '') {
    throw new Error('Username parameter is required');
  }

  const currentUserId = currentUser?.id || searchParams?.currentUserId || '11111111-1111-1111-1111-111111111111';
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

  const getInitials = (displayName: string | null, uname: string) => {
    const name = displayName || uname;
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

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

  // Filter completed habits/trees
  const completedHabits = publicHabits.filter((h) => h.status === 'completed');
  const isOwnProfile = friendProfile?.id === currentUser?.id;

  return (
    <div className={styles.container} data-testid="sanctuary-page">
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
                {friendProfile.display_name || friendProfile.username}&apos;s Sanctuary
              </h1>
              <span className={styles.username} data-testid="profile-username">
                @{friendProfile.username}
              </span>
              {!isOwnProfile && (
                <span
                  className={`${styles.connectionBadge} ${
                    isMutuallyConnected ? styles.connected : styles.notConnected
                  }`}
                  data-testid="connection-status"
                >
                  {isMutuallyConnected ? '🟢 Connected' : '🔒 Mutual Connection Required'}
                </span>
              )}
            </div>
          </header>

          {/* Sub Navigation Tabs */}
          {isMutuallyConnected && (
            <div className={styles.pageTabs}>
              <Link href={`/forest/${friendProfile.username}`} className={styles.pageTab}>
                🌱 Active Forest
              </Link>
              <span className={`${styles.pageTab} ${styles.activePageTab}`}>
                🏆 Completed Sanctuary
              </span>
            </div>
          )}

          {/* Connection Check / Warning */}
          {!isMutuallyConnected ? (
            <div className={styles.warningBox} data-testid="connection-warning">
              <span className={styles.warningIcon}>🔒</span>
              <h2 className={styles.warningTitle} data-testid="warning-title">Connection Required</h2>
              <p className={styles.warningDescription} data-testid="warning-description">
                You must be mutually connected with @{friendProfile.username} to see their completed trees.
              </p>
            </div>
          ) : (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
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
    </div>
  );
}
