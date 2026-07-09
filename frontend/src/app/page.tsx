'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../components/common/AppProviders';
import { useHabits } from '../hooks/useHabits';
import { HabitCard } from '../components/habit/HabitCard';
import { GardenCarousel } from '../components/habit/GardenCarousel';
import { Modal } from '../components/common/Modal';
import { HabitForm, HabitFormData } from '../components/habit/HabitForm';
import { LogServiceContext } from '../services/LogServiceContext';
import { HabitServiceContext } from '../services/HabitServiceContext';
import { ReflectionService } from '../services/reflectionService';
import { getDifficultyTier, assignSpecies } from '../utils/difficulty';
import styles from './Dashboard.module.css';

export default function HomePage() {
  const { currentUser, login, isMockMode } = useAuth();
  const [usernameInput, setUsernameInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Dashboard states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wateringId, setWateringId] = useState<string | null>(null);

  // Custom contexts for watering
  const logService = useContext(LogServiceContext);
  const habitService = useContext(HabitServiceContext);

  // Hook for user's habits (only runs if currentUser is not null)
  const { habits, fetchHabits, addHabit, loading, error } = useHabits(
    currentUser?.id || '11111111-1111-1111-1111-111111111111'
  );

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!usernameInput.trim()) {
      setLoginError('Please enter a username');
      return;
    }
    try {
      await login(usernameInput.trim());
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    }
  };

  const handleWaterHabit = async (habitId: string) => {
    if (!logService || !habitService || !currentUser) return;
    try {
      setWateringId(habitId);
      await logService.createLog({ habit_id: habitId, user_id: currentUser.id });
      const logs = await logService.getLogsByHabitId(habitId);
      await habitService.checkAndCompleteHabit(habitId, logs, new ReflectionService());
      await fetchHabits();
    } catch (err: any) {
      alert(err.message || 'Watering failed');
    } finally {
      setWateringId(null);
    }
  };

  const handleWaterHabitWithDetails = async (habitId: string, note: string, imageUrl?: string) => {
    if (!logService || !habitService || !currentUser) return;
    try {
      setWateringId(habitId);
      await logService.createLog({
        habit_id: habitId,
        user_id: currentUser.id,
        note: note || undefined,
        image_url: imageUrl || undefined,
      });
      const logs = await logService.getLogsByHabitId(habitId);
      await habitService.checkAndCompleteHabit(habitId, logs, new ReflectionService());
      await fetchHabits();
    } catch (err: any) {
      alert(err.message || 'Watering failed');
    } finally {
      setWateringId(null);
    }
  };

  const handleAddHabit = async (data: HabitFormData) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      const difficultyTier = getDifficultyTier({
        frequency: data.frequency,
        wither_threshold: Number(data.wither_threshold),
        target_waterings: Number(data.target_waterings)
      });
      const plantType = assignSpecies(difficultyTier);

      await addHabit({
        user_id: currentUser.id,
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        target_waterings: Number(data.target_waterings),
        wither_threshold: Number(data.wither_threshold),
        plant_type: plantType,
        difficulty_tier: difficultyTier,
        flexible_rules: data.flexible_rules,
        hide_name: data.hide_name,
        hide_description: data.hide_description,
        share_name_friends: data.share_name_friends,
        share_desc_friends: data.share_desc_friends,
      });
      setIsAddOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create habit');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats calculation
  const activeProgress = React.useMemo(() => {
    let healthyCount = 0;
    let witheredCount = 0;
    let completedCount = 0;

    habits.forEach(h => {
      if (h.status === 'healthy') healthyCount++;
      else if (h.status === 'withered') witheredCount++;
      else if (h.status === 'completed') completedCount++;
    });

    return {
      totalHabits: habits.length,
      healthyCount,
      witheredCount,
      completedCount,
    };
  }, [habits]);

  // Filter in-progress active habits
  const activeHabits = habits.filter((h) => h.status !== 'completed');

  // LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginLogo}>🌱</div>
          <h1 className={styles.loginTitle}>Welcome to Sprout</h1>
          <p className={styles.loginSubtitle}>
            Cultivate your habits, grow a beautiful virtual forest, and connect with your friends.
          </p>

          <form onSubmit={handleLoginSubmit} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.inputLabel}>
                Enter Username to Log In
              </label>
              <input
                id="username"
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="e.g. admin, alice, bob, charlie"
                className={styles.loginInput}
              />
              {loginError && <span className={styles.errorText}>{loginError}</span>}
            </div>

            <button type="submit" className={styles.loginSubmitBtn}>
              Enter Forest
            </button>
          </form>

          <div className={styles.demoAccounts}>
            <p className={styles.demoLabel}>Or choose a pre-populated profile:</p>
            <div className={styles.demoChips}>
              {['admin', 'alice', 'bob', 'charlie'].map((uname) => (
                <button
                  key={uname}
                  onClick={() => {
                    setUsernameInput(uname);
                    login(uname);
                  }}
                  className={styles.demoChip}
                >
                  @{uname}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN DASHBOARD
  return (
    <div className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>Your Habits Canopy</h1>
          <p className={styles.dashboardSubtitle}>
            Grow your virtual forest by maintaining real-life consistency.
          </p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className={styles.plantSeedBtn}>
          🌱 Plant New Seed
        </button>
      </header>

      {/* Stats Bar */}
      <section className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{activeProgress.totalHabits}</div>
          <div className={styles.statLabel}>Total Trees</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#2d5a27' }}>
            {activeProgress.healthyCount}
          </div>
          <div className={styles.statLabel}>Healthy</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#c26555' }}>
            {activeProgress.witheredCount}
          </div>
          <div className={styles.statLabel}>Withered</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#eaa89b' }}>
            {activeProgress.completedCount}
          </div>
          <div className={styles.statLabel}>Fully Grown</div>
        </div>
      </section>

      {/* Carousel of active habits */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Walking into the woods...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p>Error: {error}</p>
        </div>
      ) : activeHabits.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🌱</span>
          <h3>Your forest has no active trees in progress!</h3>
          <p>Plant your very first seed or check your completed trees in the Sanctuary.</p>
          <button onClick={() => setIsAddOpen(true)} className={styles.plantSeedBtn}>
            Plant Seed
          </button>
        </div>
      ) : (
        <GardenCarousel
          habits={activeHabits}
          currentViewerId={currentUser.id}
          onWater={handleWaterHabit}
          onWaterWithDetails={handleWaterHabitWithDetails}
        />
      )}

      {/* Add Habit Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Plant New Seed">
        <HabitForm onSubmit={handleAddHabit} onCancel={() => setIsAddOpen(false)} isSubmitting={isSubmitting} />
      </Modal>
    </div>
  );
}