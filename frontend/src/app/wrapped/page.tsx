'use client';

import React, { useState } from 'react';
import { useYearlyWrapped } from '../../hooks/useYearlyWrapped';
import styles from './wrapped.module.css';

export default function YearlyWrappedPage() {
  const [userId, setUserId] = useState<string>('11111111-1111-1111-1111-111111111111');
  const [year, setYear] = useState<number>(2026);
  const [userIdInput, setUserIdInput] = useState<string>('11111111-1111-1111-1111-111111111111');

  const { data, loading, error, isDemo } = useYearlyWrapped(userId, year);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userIdInput.trim()) {
      setUserId(userIdInput.trim());
    }
  };

  const getInitials = (displayName: string | null, username: string) => {
    const name = displayName || username;
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const calculatePercentage = (count: number, total: number) => {
    if (total <= 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className={styles.container} data-testid="yearly-wrapped-container">
      <a href="#" className={styles.backLink} id="back-to-dashboard-link">
        <span>←</span> Back to Dashboard
      </a>

      {/* Header section */}
      <header className={styles.header}>
        <div className={styles.badge} data-testid="wrapped-badge">
          <span>🌲</span> Sprout Wrapped
        </div>
        <h1 className={styles.title} id="wrapped-title">
          Your Year in the <span className={styles.titleAccent}>Woods</span>
        </h1>
        <p className={styles.description}>
          Look back at the biomes you explored, the seeds you nurtured, and the friends who kept you grounded.
        </p>

        {/* Interactive filters */}
        <form onSubmit={handleFilterSubmit} className={styles.controls} id="wrapped-filter-form">
          <div className={styles.controlGroup}>
            <label htmlFor="user-id-input" className={styles.label}>User ID:</label>
            <input
              type="text"
              id="user-id-input"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              className={styles.input}
              placeholder="Enter User UUID"
            />
          </div>
          <div className={styles.controlGroup}>
            <label htmlFor="year-select" className={styles.label}>Year:</label>
            <select
              id="year-select"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={styles.select}
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
          </div>
          <button type="submit" className={styles.input} style={{ background: 'var(--color-forest-green)', color: 'white', fontWeight: 600, cursor: 'pointer', border: 'none' }} id="apply-filters-btn">
            Apply
          </button>
        </form>
      </header>

      {/* Demo Banner */}
      {isDemo && (
        <div className={styles.demoBanner} data-testid="demo-banner">
          <span>✨</span> Showing Cozy Demo Forest summary (no database records found for this query).
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className={styles.loadingContainer} data-testid="loading-indicator">
          <div className={styles.spinner} />
          <p>Gathering logs and counting rings...</p>
        </div>
      )}

      {/* Error state */}
      {error && !data && (
        <div className={styles.warningBox} data-testid="error-box">
          <span className={styles.warningIcon}>⚠️</span>
          <h2 className={styles.warningTitle}>Failed to load Wrapped data</h2>
          <p className={styles.warningDescription}>{error}</p>
        </div>
      )}

      {/* Dashboard Grid */}
      {!loading && data && (
        <main className={styles.grid} data-testid="wrapped-grid">
          
          {/* Card 1: The Forest Canopy */}
          <section className={`${styles.card} ${styles.cardFullWidth}`} data-testid="card-forest-canopy">
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>The Forest Canopy</h2>
              <span className={styles.cardIcon}>🌳</span>
            </div>
            <div className={styles.cardMainValue}>
              <span className={styles.mainVal} data-testid="planted-vs-completed">
                {data.totalCompleted}
              </span>
              <span className={styles.subVal}>
                out of {data.totalPlanted} seeds successfully matured
              </span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressBar}
                style={{
                  width: `${calculatePercentage(data.totalCompleted, data.totalPlanted)}%`,
                  background: 'var(--color-forest-green)'
                }}
              />
            </div>
            <p style={{ fontSize: '0.95rem', opacity: 0.8, lineHeight: 1.5 }}>
              You completed {calculatePercentage(data.totalCompleted, data.totalPlanted)}% of the habits you set out to build this year. Every matured seed stands as a permanent monument in your forest.
            </p>
          </section>

          {/* Card 2: Biomes Explored */}
          <section className={styles.card} data-testid="card-biomes-explored">
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Biomes Explored</h2>
              <span className={styles.cardIcon}>🌸</span>
            </div>
            <div className={styles.biomeList}>
              {/* Common */}
              <div className={styles.biomeRow}>
                <div className={styles.biomeLabelRow}>
                  <span className={styles.biomeName}>🟢 Common</span>
                  <span className={styles.biomeCount}>{data.tierRatios.common} ({calculatePercentage(data.tierRatios.common, data.totalPlanted)}%)</span>
                </div>
                <div className={styles.progressTrack}>
                  <div
                    className={`${styles.progressBar} ${styles.progressCommon}`}
                    style={{ width: `${calculatePercentage(data.tierRatios.common, data.totalPlanted)}%` }}
                  />
                </div>
              </div>
              {/* Uncommon */}
              <div className={styles.biomeRow}>
                <div className={styles.biomeLabelRow}>
                  <span className={styles.biomeName}>🟡 Uncommon</span>
                  <span className={styles.biomeCount}>{data.tierRatios.uncommon} ({calculatePercentage(data.tierRatios.uncommon, data.totalPlanted)}%)</span>
                </div>
                <div className={styles.progressTrack}>
                  <div
                    className={`${styles.progressBar} ${styles.progressUncommon}`}
                    style={{ width: `${calculatePercentage(data.tierRatios.uncommon, data.totalPlanted)}%` }}
                  />
                </div>
              </div>
              {/* Rare */}
              <div className={styles.biomeRow}>
                <div className={styles.biomeLabelRow}>
                  <span className={styles.biomeName}>🔵 Rare</span>
                  <span className={styles.biomeCount}>{data.tierRatios.rare} ({calculatePercentage(data.tierRatios.rare, data.totalPlanted)}%)</span>
                </div>
                <div className={styles.progressTrack}>
                  <div
                    className={`${styles.progressBar} ${styles.progressRare}`}
                    style={{ width: `${calculatePercentage(data.tierRatios.rare, data.totalPlanted)}%` }}
                  />
                </div>
              </div>
              {/* Mythical */}
              <div className={styles.biomeRow}>
                <div className={styles.biomeLabelRow}>
                  <span className={styles.biomeName}>✨ Mythical</span>
                  <span className={styles.biomeCount}>{data.tierRatios.mythical} ({calculatePercentage(data.tierRatios.mythical, data.totalPlanted)}%)</span>
                </div>
                <div className={styles.progressTrack}>
                  <div
                    className={`${styles.progressBar} ${styles.progressMythical}`}
                    style={{ width: `${calculatePercentage(data.tierRatios.mythical, data.totalPlanted)}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Card 3: Resilience Index */}
          <section className={styles.card} data-testid="card-resilience-index">
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Resilience Index</h2>
              <span className={styles.cardIcon}>🛡️</span>
            </div>
            <div className={styles.cardMainValue}>
              <span className={styles.mainVal} data-testid="resilience-index-val">
                {data.averageResilienceIndex}
              </span>
              <span className={styles.subVal}>days withered before revival</span>
            </div>
            <p style={{ fontSize: '0.95rem', opacity: 0.8, lineHeight: 1.5 }}>
              This index represents the average duration you spent in a withered state before logging a check-in and reviving your tree. Lower values reflect faster rescue speeds and stronger discipline!
            </p>
          </section>

          {/* Card 4: Guardian Angel */}
          <section className={styles.card} data-testid="card-guardian-angel">
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Guardian Angel</h2>
              <span className={styles.cardIcon}>👼</span>
            </div>
            {data.guardianAngel && data.guardianAngel.profile ? (
              <div>
                <div className={styles.angelProfile}>
                  <div className={styles.avatarContainer}>
                    {data.guardianAngel.profile.avatar_url ? (
                      <img
                        src={data.guardianAngel.profile.avatar_url}
                        alt={data.guardianAngel.profile.username}
                        className={styles.avatar}
                      />
                    ) : (
                      <div className={styles.avatarFallback}>
                        {getInitials(data.guardianAngel.profile.display_name, data.guardianAngel.profile.username)}
                      </div>
                    )}
                  </div>
                  <div className={styles.angelDetails}>
                    <div className={styles.angelName}>
                      {data.guardianAngel.profile.display_name || data.guardianAngel.profile.username}
                    </div>
                    <div className={styles.angelUsername}>
                      @{data.guardianAngel.profile.username}
                    </div>
                  </div>
                </div>
                <p className={styles.nudgeStat}>
                  Sent you <span className={styles.nudgeHighlight}>{data.guardianAngel.nudgeCount}</span> rescue droplets to help revive your withered trees.
                </p>
              </div>
            ) : (
              <div className={styles.noAngel} data-testid="no-guardian-angel">
                No rescue droplets received this year. You stood tall on your own!
              </div>
            )}
          </section>

          {/* Card 5: Social Echo */}
          <section className={styles.card} data-testid="card-social-echo">
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Social Echo</h2>
              <span className={styles.cardIcon}>💬</span>
            </div>
            <div className={styles.socialEchoGrid}>
              <div className={styles.echoItem}>
                <span className={styles.echoEmoji}>💬</span>
                <span className={styles.echoVal} data-testid="echo-comments-count">
                  {data.socialEcho.commentCount}
                </span>
                <span className={styles.echoLabel}>Comments</span>
              </div>
              <div className={styles.echoItem}>
                <span className={styles.echoEmoji}>👏</span>
                <span className={styles.echoVal} data-testid="echo-reactions-count">
                  {data.socialEcho.reactionCount}
                </span>
                <span className={styles.echoLabel}>Reactions</span>
              </div>
            </div>
            <p style={{ fontSize: '0.95rem', opacity: 0.8, lineHeight: 1.5, textAlign: 'center', marginTop: '0.25rem' }}>
              You received a total of <strong>{data.socialEcho.totalInteractions}</strong> social interactions from your friends in your shared forests!
            </p>
          </section>

        </main>
      )}
    </div>
  );
}
