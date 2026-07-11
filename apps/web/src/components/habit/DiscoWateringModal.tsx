'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './DiscoWateringModal.module.css';

interface DiscoWateringModalProps {
  onWater: () => void;
  onClose: () => void;
}

type ModalTab = 'ad' | 'donate';

const AD_DURATION_SECONDS = 5;

export function DiscoWateringModal({ onWater, onClose }: DiscoWateringModalProps) {
  const [tab, setTab] = useState<ModalTab>('ad');
  const [adCountdown, setAdCountdown] = useState<number | null>(null);
  const [adDone, setAdDone] = useState(false);
  const [donated, setDonated] = useState(false);

  const startAd = useCallback(() => {
    setAdCountdown(AD_DURATION_SECONDS);
    setAdDone(false);
  }, []);

  useEffect(() => {
    if (adCountdown === null) return;
    if (adCountdown <= 0) {
      setAdDone(true);
      setAdCountdown(null);
      return;
    }
    const timer = setTimeout(() => setAdCountdown(c => (c ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [adCountdown]);

  const handleAdReward = () => {
    onWater();
    onClose();
  };

  const handleDonate = () => {
    setDonated(true);
    setTimeout(() => {
      onWater();
      onClose();
    }, 1500);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        <h2 className={styles.title}>💧 Water the Disco Plant</h2>
        <p className={styles.desc}>
          The disco plant needs some love. Watch a short ad or make a small donation to water it!
        </p>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${tab === 'ad' ? styles.activeTab : ''}`}
            onClick={() => setTab('ad')}
          >
            🎬 Watch Ad
          </button>
          <button
            className={`${styles.tabBtn} ${tab === 'donate' ? styles.activeTab : ''}`}
            onClick={() => setTab('donate')}
          >
            💳 Donate
          </button>
        </div>

        {/* Ad Tab */}
        {tab === 'ad' && (
          <div className={styles.panel}>
            {adCountdown === null && !adDone && (
              <>
                <div className={styles.adPlaceholder}>
                  <span className={styles.adIcon}>📺</span>
                  <p>A short ad will play here</p>
                  <small>(Powered by Google IMA SDK — coming soon)</small>
                </div>
                <button className={styles.actionBtn} onClick={startAd}>
                  ▶ Start Ad
                </button>
              </>
            )}
            {adCountdown !== null && (
              <div className={styles.countdown}>
                <div className={styles.countdownRing}>
                  <span className={styles.countdownNum}>{adCountdown}</span>
                </div>
                <p>Ad playing… please wait</p>
              </div>
            )}
            {adDone && (
              <div className={styles.rewardSection}>
                <div className={styles.rewardIcon}>🎉</div>
                <p className={styles.rewardText}>Thanks for watching! Tap below to water your disco plant.</p>
                <button className={styles.waterBtn} onClick={handleAdReward}>
                  💧 Water Now!
                </button>
              </div>
            )}
          </div>
        )}

        {/* Donate Tab */}
        {tab === 'donate' && (
          <div className={styles.panel}>
            {!donated ? (
              <>
                <div className={styles.donateInfo}>
                  <div className={styles.donateIcon}>🌟</div>
                  <p>Make a small donation to support Sprout and keep the disco plant dancing!</p>
                  <p className={styles.donateAmount}>Suggested: <strong>$1.00</strong></p>
                  <small>(Stripe integration — coming soon)</small>
                </div>
                <button className={styles.actionBtn} onClick={handleDonate}>
                  💳 Donate $1.00
                </button>
              </>
            ) : (
              <div className={styles.rewardSection}>
                <div className={styles.rewardIcon}>✅</div>
                <p className={styles.rewardText}>Thank you for your donation! Watering your disco plant…</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
