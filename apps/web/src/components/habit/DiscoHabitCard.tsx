'use client';

import React, { useState } from 'react';
import { DiscoPlant } from '../plants/DiscoPlant';
import { DiscoWateringModal } from './DiscoWateringModal';
import { useDiscoPlant } from '../../hooks/useDiscoPlant';
import styles from './DiscoHabitCard.module.css';

const STATE_META = {
  dancing: { label: 'Dancing!', icon: '🎉', badgeClass: 'statusDancing' },
  smiling: { label: 'Happy',    icon: '😄', badgeClass: 'statusSmiling' },
  withered: { label: 'Wilting', icon: '🍂', badgeClass: 'statusWithered' },
} as const;

export function DiscoHabitCard() {
  const { state, lastWateredAt, waterPlant } = useDiscoPlant();
  const [showModal, setShowModal] = useState(false);

  const { label, icon, badgeClass } = STATE_META[state];

  // Progress: days since last watering within 7-day window
  const daysSince = lastWateredAt
    ? Math.min(7, Math.floor((Date.now() - new Date(lastWateredAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 7;
  const progressPct = Math.round(((7 - daysSince) / 7) * 100);

  const lastWateredText = lastWateredAt
    ? `Last watered ${new Date(lastWateredAt).toLocaleDateString()}`
    : 'Never watered';

  return (
    <>
      <div className={styles.card} data-testid="disco-habit-card">

        {/* Header — mirrors HabitCard .header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h3 className={styles.name}>🪩 Disco Plant</h3>
            <div className={styles.metaRow}>
              <span className={styles.frequencyBadge}>Special</span>
              <span className={`${styles.tierBadge} ${styles.tierMythical}`}>mythical</span>
            </div>
          </div>
          <div className={`${styles.statusBadge} ${styles[badgeClass]}`}>
            <span className={styles.statusIcon}>{icon}</span>
            <span>{label}</span>
          </div>
        </div>

        {/* Plant visual — mirrors HabitCard .plantVisualContainer */}
        <div className={styles.plantVisualContainer}>
          <DiscoPlant state={state} />

          {/* Water button — mirrors HabitCard watering can */}
          <button
            type="button"
            className={styles.wateringCanBtn}
            onClick={() => setShowModal(true)}
            data-testid="disco-water-btn"
            aria-label="Water disco plant"
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
        </div>

        {/* Plant details — mirrors HabitCard .plantDetails */}
        <div className={styles.plantDetails}>
          <span className={styles.plantLabel}>Plant Specimen:</span>
          <span className={styles.plantValue}>Disco Ball</span>
        </div>

        {/* Progress section — mirrors HabitCard .progressSection */}
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Disco Energy</span>
            <span className={styles.progressText}>{progressPct}%</span>
          </div>
          <div className={styles.progressBarBg}>
            <div
              className={`${styles.progressBarFill} ${state === 'dancing' ? styles.discoFill : ''}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Footer — mirrors HabitCard .footer */}
        <div className={styles.footer}>
          <div className={styles.lastWatered}>{lastWateredText}</div>
        </div>
      </div>

      {showModal && (
        <DiscoWateringModal
          onWater={waterPlant}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

