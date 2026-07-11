'use client';

import React, { useState, useEffect, useContext, useRef } from 'react';
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

  // Webcam States
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Security Lock state options
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [biometricsInput, setBiometricsInput] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Revert previewed theme if leaving without saving
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem('sprout_theme');
        if (storedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
  }, []);

  // Cleanup camera stream on unmount or stream change
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Link camera stream to video element when active
  useEffect(() => {
    if (showCamera && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => {
        console.error('Failed to play video stream:', err);
      });
    }
  }, [showCamera, cameraStream]);

  const handleThemeToggle = (checked: boolean) => {
    setDarkMode(checked);
    if (typeof window !== 'undefined') {
      if (checked) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (err: any) {
      setError('Could not access camera: ' + (err.message || 'please check permissions'));
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatarUrl(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.onerror = () => {
        setError('Failed to read uploaded photo.');
      };
      reader.readAsDataURL(file);
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

      // Save theme to localStorage only when "Save Changes" is clicked
      if (typeof window !== 'undefined') {
        localStorage.setItem('sprout_theme', darkMode ? 'dark' : 'light');
      }

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
  const [showAvatarModal, setShowAvatarModal] = React.useState(false);

  return (
    <div className={styles.container} data-testid="profile-page">
      <Link href="/" className={styles.backLink}>
        <span>←</span> Back to Dashboard
      </Link>

      <div className={styles.card}>
        {/* Avatar Hero — top center */}
        <div className={styles.avatarHeroSection}>
          <button
            type="button"
            className={styles.avatarHeroBtn}
            onClick={() => setShowAvatarModal(true)}
            aria-label="Change profile photo"
          >
            {avatarUrl.trim() ? (
              <img
                src={avatarUrl.trim()}
                alt="Your avatar"
                className={styles.avatarHeroImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                  setAvatarUrl('');
                }}
              />
            ) : (
              <div className={styles.avatarHeroEmoji}>👤</div>
            )}
            <div className={styles.avatarEditBadge}>✏️</div>
          </button>
          <p className={styles.avatarHeroName}>{displayName || username}</p>
        </div>

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

      {/* Avatar Photo Modal — rendered outside .card to avoid backdrop-filter stacking context */}
      {showAvatarModal && (
        <div className={styles.avatarModalOverlay} onClick={() => setShowAvatarModal(false)}>
          <div className={styles.avatarModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.avatarModalTitle}>Update Profile Photo</h3>

            {!showCamera ? (
              <div className={styles.avatarModalActions}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={styles.uploadPhotoBtn}
                  disabled={saving}
                >
                  📁 Upload Photo
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className={styles.takePhotoBtn}
                  disabled={saving}
                >
                  📷 Take Photo
                </button>
                {avatarUrl.trim() && (
                  <button
                    type="button"
                    onClick={() => { setAvatarUrl(''); setShowAvatarModal(false); }}
                    className={styles.removePhotoBtn}
                    disabled={saving}
                  >
                    🗑️ Remove Photo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className={styles.cancelCameraBtn}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className={styles.cameraContainer}>
                <video
                  ref={videoRef}
                  className={styles.webcamVideo}
                  playsInline
                  muted
                />
                <div className={styles.cameraControls}>
                  <button
                    type="button"
                    onClick={() => { capturePhoto(); setShowAvatarModal(false); }}
                    className={styles.captureBtn}
                  >
                    📸 Capture
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className={styles.cancelCameraBtn}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => { handleFileChange(e); setShowAvatarModal(false); }}
              disabled={saving}
            />
          </div>
        </div>
      )}
    </div>
  );
}
