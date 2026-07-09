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
  // Login toggles & inputs
  const [loginMethod, setLoginMethod] = useState<'username' | 'otp'>('username');
  const [usernameInput, setUsernameInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpNotification, setOtpNotification] = useState<string | null>(null);

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
    sendOtp,
    verifyOtp
  } = useAuth();
  
  const [pinInput, setPinInput] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  
  const [showBioScanner, setShowBioScanner] = useState(false);
  const [bioScanning, setBioScanning] = useState(false);
  const [bioSuccess, setBioSuccess] = useState(false);

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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setLoginError('Please enter a valid email address');
      return;
    }
    try {
      const code = await sendOtp(emailInput.trim());
      setGeneratedOtp(code);
      setOtpSent(true);
      setOtpNotification(code);
    } catch (err: any) {
      setLoginError(err.message || 'Failed to send verification code');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!otpInput.trim()) {
      setLoginError('Please enter the 6-digit verification code');
      return;
    }
    try {
      await verifyOtp(emailInput.trim(), otpInput.trim(), generatedOtp);
      setOtpNotification(null);
    } catch (err: any) {
      setLoginError(err.message || 'Verification failed');
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
        {otpNotification && (
          <div className={styles.otpToast} data-testid="otp-notification">
            <span>✉️ Verification code: <strong>{otpNotification}</strong></span>
            <button onClick={() => setOtpNotification(null)} className={styles.otpToastClose}>&times;</button>
          </div>
        )}

        <div className={styles.loginCard}>
          <div className={styles.loginLogo}>🌱</div>
          <h1 className={styles.loginTitle}>Welcome to Sprout</h1>
          <p className={styles.loginSubtitle}>
            Cultivate your habits, grow a beautiful virtual forest, and connect with your friends.
          </p>

          <div className={styles.tabsRow}>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('username');
                setLoginError(null);
              }}
              className={`${styles.tabBtn} ${loginMethod === 'username' ? styles.activeTabBtn : ''}`}
            >
              Username Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('otp');
                setLoginError(null);
                setOtpSent(false);
              }}
              className={`${styles.tabBtn} ${loginMethod === 'otp' ? styles.activeTabBtn : ''}`}
            >
              Email OTP
            </button>
          </div>

          {loginMethod === 'username' ? (
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
                  placeholder="e.g. admin, alice, bob"
                  className={styles.loginInput}
                />
                {loginError && <span className={styles.errorText}>{loginError}</span>}
              </div>

              <button type="submit" className={styles.loginSubmitBtn}>
                Enter Forest
              </button>
            </form>
          ) : (
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className={styles.loginForm}>
              {!otpSent ? (
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.inputLabel}>
                    Enter Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. alice@sprout.com"
                    className={styles.loginInput}
                    required
                  />
                  {loginError && <span className={styles.errorText}>{loginError}</span>}
                </div>
              ) : (
                <div className={styles.inputGroup}>
                  <label htmlFor="otpCode" className={styles.inputLabel}>
                    Verification Code sent to {emailInput}
                  </label>
                  <input
                    id="otpCode"
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit code"
                    className={styles.loginInput}
                    required
                  />
                  {loginError && <span className={styles.errorText}>{loginError}</span>}
                </div>
              )}

              <button type="submit" className={styles.loginSubmitBtn}>
                {otpSent ? 'Confirm & Sign In' : 'Send One-Time Code'}
              </button>

              {otpSent && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpInput('');
                  }}
                  className={styles.resendBtn}
                >
                  Change Email
                </button>
              )}
            </form>
          )}

          {/* Social Auth Buttons */}
          <div className={styles.socialGroup}>
            <p className={styles.socialTitle}>Or continue with social provider:</p>
            <div className={styles.socialButtons}>
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className={`${styles.socialBtn} ${styles.googleBtn}`}
                data-testid="google-login-btn"
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('apple')}
                className={`${styles.socialBtn} ${styles.appleBtn}`}
                data-testid="apple-login-btn"
              >
                Apple
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                className={`${styles.socialBtn} ${styles.facebookBtn}`}
                data-testid="facebook-login-btn"
              >
                Facebook
              </button>
            </div>
          </div>

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
      </div>

      {/* Add Habit Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Plant New Seed">
        <HabitForm onSubmit={handleAddHabit} onCancel={() => setIsAddOpen(false)} isSubmitting={isSubmitting} />
      </Modal>
    </div>
  );
}