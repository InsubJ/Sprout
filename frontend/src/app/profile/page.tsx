'use client';

import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/common/AppProviders';
import { ProfileServiceContext } from '../../services/ProfileServiceContext';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const {
    currentUser,
    updateCurrentUser,
    logout,
    pinCode,
    biometricsEnabled,
    setPinCode,
    setBiometricsEnabled
  } = useAuth();
  const profileService = useContext(ProfileServiceContext);
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Security Lock state options
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [biometricsInput, setBiometricsInput] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync state with current user and theme
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setDisplayName(currentUser.display_name || '');
      setAvatarUrl(currentUser.avatar_url || '');
      
      const theme = localStorage.getItem('sprout_theme');
      setDarkMode(theme === 'dark');

      setPinEnabled(!!pinCode);
      setPinValue(pinCode || '');
      setBiometricsInput(biometricsEnabled);
    } else {
      router.push('/');
    }
  }, [currentUser, router, pinCode, biometricsEnabled]);

  const handleThemeToggle = (checked: boolean) => {
    setDarkMode(checked);
    if (typeof window !== 'undefined') {
      if (checked) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('sprout_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('sprout_theme', 'light');
      }
    }
  };

  if (!currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }

    if (pinEnabled && (pinValue.length !== 4 || isNaN(Number(pinValue)))) {
      setError('PIN code must be exactly 4 digits.');
      return;
    }

    setSaving(true);
    setSuccess(null);
    setError(null);

    if (!profileService) {
      setError('Profile service is not available.');
      setSaving(false);
      return;
    }

    try {
      const updatedProfile = await profileService.updateProfile({
        ...currentUser,
        username: username.trim(),
        display_name: displayName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      });

      updateCurrentUser(updatedProfile);

      // Save security keys to localstorage via context
      if (pinEnabled) {
        setPinCode(pinValue);
      } else {
        setPinCode(null);
      }
      setBiometricsEnabled(biometricsInput);

      setSuccess('Profile and security settings updated successfully!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className={styles.container} data-testid="profile-page">
      <Link href="/" className={styles.backLink}>
        <span>←</span> Back to Dashboard
      </Link>

      <div className={styles.card}>
        <h1 className={styles.title}>👤 Profile Settings</h1>
        <p className={styles.subtitle}>Update your Sprout profile details and preferences.</p>

        {success && <div className={styles.successMessage} data-testid="success-message">{success}</div>}
        {error && <div className={styles.errorMessage} data-testid="error-message">{error}</div>}

        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              placeholder="e.g. janesmith"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="displayName" className={styles.label}>Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={styles.input}
              placeholder="e.g. Jane Smith"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="avatarUrl" className={styles.label}>Avatar Image URL</label>
            <input
              id="avatarUrl"
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className={styles.input}
              placeholder="https://example.com/avatar.jpg"
            />
            {avatarUrl.trim() && (
              <div className={styles.avatarPreviewWrapper}>
                <img
                  src={avatarUrl.trim()}
                  alt="Avatar preview"
                  className={styles.avatarPreview}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+Image';
                  }}
                />
              </div>
            )}
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => handleThemeToggle(e.target.checked)}
                className={styles.checkbox}
                data-testid="dark-mode-checkbox"
              />
              Enable Dark Mode
            </label>
          </div>

          <hr className={styles.divider} />
          
          <h3 className={styles.securityTitle}>🔒 Security & Convenience</h3>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={pinEnabled}
                onChange={(e) => {
                  setPinEnabled(e.target.checked);
                  if (!e.target.checked) setPinValue('');
                }}
                className={styles.checkbox}
                data-testid="pin-lock-checkbox"
              />
              Enable PIN Security Lock
            </label>
          </div>

          {pinEnabled && (
            <div className={styles.inputGroup} data-testid="pin-input-group">
              <label htmlFor="pinValue" className={styles.label}>Set 4-Digit PIN</label>
              <input
                id="pinValue"
                type="password"
                maxLength={4}
                value={pinValue}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ''); // digits only
                  setPinValue(val);
                }}
                className={styles.input}
                placeholder="e.g. 1234"
                required
                data-testid="pin-input"
              />
            </div>
          )}

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={biometricsInput}
                onChange={(e) => setBiometricsInput(e.target.checked)}
                className={styles.checkbox}
                data-testid="biometrics-checkbox"
              />
              Enable Biometric Lock (Simulated TouchID/FaceID)
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={styles.saveBtn}
            data-testid="save-profile-btn"
          >
            {saving ? 'Saving changes...' : 'Save Changes'}
          </button>
        </form>

        <hr className={styles.divider} />

        <div className={styles.dangerZone}>
          <h3 className={styles.dangerTitle}>Account Actions</h3>
          <p className={styles.dangerDesc}>Disconnect your current session and sign out from Sprout.</p>
          <button
            type="button"
            onClick={handleLogout}
            className={styles.logoutBtn}
            data-testid="profile-logout-btn"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
