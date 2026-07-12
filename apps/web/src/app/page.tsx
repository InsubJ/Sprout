'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../components/common/AppProviders';
import { useHabits } from '../hooks/useHabits';
import { HabitCard } from '../components/habit/HabitCard';
import { GardenCarousel } from '../components/habit/GardenCarousel';
import { Modal } from '../components/common/Modal';
import { HabitForm, HabitFormData } from '../components/habit/HabitForm';
import { CompletionCelebrationModal } from '../components/habit/CompletionCelebrationModal';
import { LogServiceContext } from '../services/LogServiceContext';
import { HabitServiceContext } from '../services/HabitServiceContext';
import { ProfileServiceContext } from '../services/ProfileServiceContext';
import { ReflectionService } from '../services/reflectionService';
import { getDifficultyTier, assignSpecies } from '../utils/difficulty';
import styles from './Dashboard.module.css';

export default function HomePage() {
  // Login error state
  const [loginError, setLoginError] = useState<string | null>(null);

  // Lock screen inputs & simulation states
  const {
    currentUser,
    login,
    logout,
    isMockMode,
    isAppLocked,
    unlockApp,
    pinCode,
    biometricsEnabled,
    loginWithProvider,
    googleClientId
  } = useAuth();

  const [pinInput, setPinInput] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [googleSdkReady, setGoogleSdkReady] = useState(false);

  // Check if Google SDK script is ready on window object
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ((window as any).google) {
        setGoogleSdkReady(true);
      } else {
        const interval = setInterval(() => {
          if ((window as any).google) {
            setGoogleSdkReady(true);
            clearInterval(interval);
          }
        }, 500);
        return () => clearInterval(interval);
      }
    }
  }, []);

  const [showBioScanner, setShowBioScanner] = useState(false);
  const [bioScanning, setBioScanning] = useState(false);
  const [bioSuccess, setBioSuccess] = useState(false);

  // Dashboard states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wateringId, setWateringId] = useState<string | null>(null);
  // Completion celebration
  const [completedHabit, setCompletedHabit] = useState<{ name: string; plantType?: string; poeticSummary?: string | null } | null>(null);

  // Custom contexts for watering
  const logService = useContext(LogServiceContext);
  const habitService = useContext(HabitServiceContext);
  const profileService = useContext(ProfileServiceContext);

  // Load official Google Sign-In button programmatically when client ID is loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && googleSdkReady && googleClientId) {
      try {
        const handleCredential = async (response: any) => {
          if (response.credential) {
            setLoginError(null);
            try {
              // Decode JWT payload safely supporting unicode
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                  })
                  .join('')
              );
              const payload = JSON.parse(jsonPayload);
              const email = payload.email;
              const name = payload.name || payload.given_name || 'Google User';
              const username = email ? email.split('@')[0] : `google_${payload.sub}`;

              // Handle login/creation
              if (profileService) {
                let profile = await profileService.getProfileByUsername(username);
                if (!profile) {
                  if (isMockMode) {
                    profile = await (profileService as any).createProfile(username, name);
                  }
                }
                if (profile && payload.picture) {
                  profile.avatar_url = payload.picture;
                  await profileService.updateProfile(profile);
                }
              }

              await login(username);
            } catch (err: any) {
              setLoginError(err.message || 'Google Sign-In failed');
            }
          }
        };

        // Expose globally on window so the HTML data-callback can locate it if needed
        (window as any).handleGoogleCredentialResponse = handleCredential;

        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredential,
          use_fedcm_for_prompt: true, // Support FedCM API
        });

        const container = document.getElementById('google-signin-btn-container');
        if (container) {
          (window as any).google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'medium',
            text: 'continue_with',
            shape: 'pill',
          });
        }
      } catch (e) {
        console.error('Failed to initialize Google branded sign-in button:', e);
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).handleGoogleCredentialResponse;
      }
    };
  }, [googleClientId, googleSdkReady, isMockMode, login, profileService]);

  // Hook for user's habits (only runs if currentUser is not null)
  const { habits, fetchHabits, addHabit, loading, error } = useHabits(
    currentUser?.id || '11111111-1111-1111-1111-111111111111'
  );

  // Automatically trigger biometrics lock verification on mount if set
  useEffect(() => {
    if (currentUser && isAppLocked && biometricsEnabled) {
      handleBiometricTrigger();
    }
  }, [currentUser, isAppLocked, biometricsEnabled]);

  const handleBiometricTrigger = () => {
    setShowBioScanner(true);
    setBioScanning(true);
    setBioSuccess(false);
    setUnlockError(null);

    // Simulate scanning delay
    setTimeout(() => {
      setBioScanning(false);
      setBioSuccess(true);
      setTimeout(() => {
        const ok = unlockApp(undefined, true);
        if (ok) {
          setShowBioScanner(false);
        } else {
          setUnlockError('Simulated biometric authentication failed.');
          setBioSuccess(false);
        }
      }, 600);
    }, 1200);
  };

  const handlePinUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);
    if (pinInput.length !== 4) {
      setUnlockError('PIN code must be exactly 4 digits');
      return;
    }
    const ok = unlockApp(pinInput);
    if (ok) {
      setPinInput('');
    } else {
      setUnlockError('Invalid PIN code. Please try again.');
      setPinInput('');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    setLoginError(null);
    try {
      await loginWithProvider(provider);
    } catch (err: any) {
      setLoginError(err.message || `Login with ${provider} failed`);
    }
  };

  const handleWaterHabit = async (habitId: string) => {
    if (!logService || !habitService || !currentUser) return;
    try {
      setWateringId(habitId);
      // Snapshot status before watering
      const habitBefore = habits.find(h => h.id === habitId);
      await logService.createLog({ habit_id: habitId, user_id: currentUser.id });
      const logs = await logService.getLogsByHabitId(habitId);
      await habitService.checkAndCompleteHabit(habitId, logs, new ReflectionService());
      await fetchHabits();
      // Check if it just completed
      const habitAfter = habits.find(h => h.id === habitId);
      if (habitBefore?.status !== 'completed' && habitAfter?.status === 'completed') {
        setCompletedHabit({ name: habitAfter.name, plantType: habitAfter.plant_type, poeticSummary: habitAfter.poetic_summary });
      }
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
      // Snapshot status before watering
      const habitBefore = habits.find(h => h.id === habitId);
      await logService.createLog({
        habit_id: habitId,
        user_id: currentUser.id,
        note: note || undefined,
        image_url: imageUrl || undefined,
      });
      const logs = await logService.getLogsByHabitId(habitId);
      await habitService.checkAndCompleteHabit(habitId, logs, new ReflectionService());
      await fetchHabits();
      // Check if it just completed — re-read from the habits list that fetchHabits refreshed
      const habitAfter = habits.find(h => h.id === habitId);
      if (habitBefore?.status !== 'completed' && habitAfter?.status === 'completed') {
        setCompletedHabit({ name: habitAfter.name, plantType: habitAfter.plant_type, poeticSummary: habitAfter.poetic_summary });
      }
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

  // const plantButtonStyle = React.useMemo(() => {
  //   if (activeProgress.totalHabits - activeProgress.completedCount === 0) {
  //     return `${styles.plantButtonHiddenMobile}${styles.plantSeedBtn}`;
  //   }
  //   return `${styles.plantSeedBtn}`;
  // }, [activeProgress.totalHabits, activeProgress.completedCount]);

  // LOCK SCREEN OVERLAY
  if (currentUser && isAppLocked) {
    return (
      <div className={styles.lockContainer} data-testid="lock-screen">
        <div className={styles.lockCard}>
          <div className={styles.lockLogo}>🔒</div>
          <h1 className={styles.lockTitle}>Sprout Locked</h1>
          <p className={styles.lockSubtitle}>
            Please authenticate using your configured lock parameters to access your virtual habits canopy.
          </p>

          {unlockError && <div className={styles.lockError} data-testid="lock-error">{unlockError}</div>}

          {pinCode && (
            <form onSubmit={handlePinUnlock} className={styles.lockForm} data-testid="lock-pin-form">
              <div className={styles.inputGroup} style={{ alignItems: 'center' }}>
                <input
                  id="lockPin"
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPinInput(val);
                  }}
                  className={styles.pinInput}
                  placeholder="••••"
                  required
                  data-testid="lock-pin-input"
                  autoFocus
                />
              </div>
              <button type="submit" className={styles.loginSubmitBtn} style={{ marginTop: '0.5rem' }}>
                Unlock Canopy
              </button>
            </form>
          )}

          <div className={styles.lockActionRow}>
            {biometricsEnabled && (
              <button
                type="button"
                onClick={handleBiometricTrigger}
                className={styles.bioTriggerBtn}
                data-testid="bio-trigger-btn"
              >
                🧬 Scan Biometrics
              </button>
            )}
            <button
              type="button"
              onClick={() => logout()}
              className={styles.lockLogoutBtn}
              data-testid="lock-logout-btn"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>

        {/* Biometric Scanning Simulator Screen */}
        {showBioScanner && (
          <div className={styles.bioOverlay} data-testid="bio-scanner-modal">
            <div className={styles.bioDialog}>
              <div className={styles.bioIndicator}>
                {bioScanning ? (
                  <span className={styles.bioScanAnim}>🧬</span>
                ) : bioSuccess ? (
                  <span className={styles.bioSuccessCheck}>✔️</span>
                ) : (
                  <span>❌</span>
                )}
              </div>
              <h3>
                {bioScanning ? 'Authenticating...' : bioSuccess ? 'Success!' : 'Verification Failed'}
              </h3>
              <p className={styles.bioText}>
                {bioScanning ? 'Contacting biometric hardware layer...' : bioSuccess ? 'Lock validation confirmed.' : 'Failed.'}
              </p>
              <button
                type="button"
                onClick={() => setShowBioScanner(false)}
                className={styles.bioCancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginLogo}>🌱</div>
          <h1 className={styles.loginTitle}>Welcome to Sprout</h1>
          <p className={styles.loginSubtitle}>
            Cultivate your habits, grow a beautiful virtual forest, and connect with your buds.
          </p>

          {loginError && <div className={styles.errorText} style={{ marginBottom: '1rem' }}>{loginError}</div>}

          {/* Google Sign-In */}
          <div className={styles.socialGroup}>
            <div className={styles.socialButtons}>
              {googleClientId && googleSdkReady ? (
                <div
                  id="google-signin-btn-container"
                  data-testid="google-login-btn"
                  className={styles.googleGsiContainer}
                ></div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className={`${styles.socialBtn} ${styles.googleBtn}`}
                  data-testid="google-login-btn"
                >
                  🔑 Continue with Google
                </button>
              )}
            </div>
          </div>

          {/* Demo accounts for offline/mock mode */}
          {isMockMode && (
            <div className={styles.demoAccounts}>
              <p className={styles.demoLabel}>Offline Mode — choose a demo profile:</p>
              <div className={styles.demoChips}>
                {['admin', 'alice', 'bob', 'charlie'].map((uname) => (
                  <button
                    key={uname}
                    onClick={() => login(uname)}
                    className={styles.demoChip}
                  >
                    @{uname}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LOGGED IN DASHBOARD
  return (
    <div className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>{currentUser.display_name || currentUser.username}&apos;s Nursery</h1>
          <p className={styles.dashboardSubtitle}>
            Grow your virtual forest by maintaining real-life consistency.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className={`${styles.plantSeedBtn} ${styles.plantSeedBtnHideMobile}`}
        >
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

      {/* Carousel — always visible; handles empty state and disco plant internally */}
      <div className={styles.carouselSection}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Walking into the woods...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>Error: {error}</p>
          </div>
        ) : (
          <GardenCarousel
            habits={activeHabits}
            currentViewerId={currentUser.id}
            onWater={handleWaterHabit}
            onWaterWithDetails={handleWaterHabitWithDetails}
            onPlantSeed={() => setIsAddOpen(true)}
          />
        )}
      </div>

      {/* Mobile-only button: below carousel and above stats */}
      <button
        type="button"
        onClick={() => setIsAddOpen(true)}
        className={`${styles.plantSeedBtn} ${styles.plantSeedBtnMobileInline}`}
      >
        🌱 Plant New Seed
      </button>

      {/* Add Habit Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} closeOnOverlayClick={false} title="Plant New Seed">
        <HabitForm onSubmit={handleAddHabit} onCancel={() => setIsAddOpen(false)} isSubmitting={isSubmitting} />
      </Modal>

      {/* Completion Celebration Modal */}
      {completedHabit && (
        <CompletionCelebrationModal
          plantName={completedHabit.name}
          plantType={completedHabit.plantType}
          poeticSummary={completedHabit.poeticSummary}
          onClose={() => setCompletedHabit(null)}
        />
      )}
    </div>
  );
}