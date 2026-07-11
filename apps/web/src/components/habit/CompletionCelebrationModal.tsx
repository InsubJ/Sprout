'use client';

import React from 'react';
import styles from './CompletionCelebrationModal.module.css';

interface CompletionCelebrationModalProps {
  plantName: string;
  plantType?: string;
  poeticSummary?: string | null;
  onClose: () => void;
}

export function CompletionCelebrationModal({
  plantName,
  plantType,
  poeticSummary,
  onClose,
}: CompletionCelebrationModalProps) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Plant completed" onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Confetti burst */}
        <div className={styles.confettiRow} aria-hidden="true">
          {['🎊','🌸','✨','🎉','🌟','💐','🎊','✨'].map((emoji, i) => (
            <span key={i} className={styles.confetti} style={{ animationDelay: `${i * 0.08}s` }}>
              {emoji}
            </span>
          ))}
        </div>

        <div className={styles.trophyIcon}>🏆</div>

        <h2 className={styles.title}>Fully Grown!</h2>

        <p className={styles.plantName}>
          <strong>{plantName}</strong>
          {plantType ? <span className={styles.plantType}> · {plantType}</span> : null}
        </p>

        <p className={styles.congrats}>
          Congratulations on nurturing this habit to completion. Your dedication has paid off — this tree has flourished!
        </p>

        {poeticSummary && (
          <blockquote className={styles.poeticSummary}>
            <span className={styles.quoteIcon}>🌿</span>
            {poeticSummary}
          </blockquote>
        )}

        <div className={styles.sanctuaryNote}>
          <span className={styles.sanctuaryIcon}>🏛️</span>
          <p>
            This plant has been moved to your <strong>Sanctuary</strong> where it will be displayed and admired forever.
          </p>
        </div>

        <button className={styles.okBtn} onClick={onClose} autoFocus>
          Visit Sanctuary 🌸
        </button>
      </div>
    </div>
  );
}
