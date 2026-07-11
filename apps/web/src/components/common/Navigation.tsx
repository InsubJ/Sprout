'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AppProviders';
import styles from './Navigation.module.css';

export const Navigation: React.FC = () => {
  const { currentUser, logout, isMockMode } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [targetHref, setTargetHref] = React.useState<string | null>(null);

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const sanctuaryLink = `/sanctuary/${currentUser.username}`;

  // Check if current page is visiting a friend's active forest or completed sanctuary
  const isVisitingFriend = 
    (pathname.startsWith('/forest/') && !pathname.endsWith(`/${currentUser.username}`)) ||
    (pathname.startsWith('/sanctuary/') && !pathname.endsWith(`/${currentUser.username}`));

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If clicking the current page's active tab or links, don't show prompt
    if (pathname === href) return;

    if (isVisitingFriend) {
      e.preventDefault();
      setTargetHref(href);
    }
  };

  const handleConfirmLeave = () => {
    if (targetHref) {
      router.push(targetHref);
      setTargetHref(null);
    }
  };

  const navItems = [
    { label: 'Forest', href: '/', icon: '🌿' },
    { label: 'Sanctuary', href: sanctuaryLink, icon: '🌳' },
    { label: 'Buds', href: '/friends', icon: '👥' },
    { label: 'Lab', href: '/lab', icon: '🧪' },
  ];

  return (
    <>
      {/* Desktop Top Navigation */}
      <header className={styles.desktopHeader}>
        <div className={styles.logoSection}>
          <span className={styles.logoIcon}>🌱</span>
          <strong className={styles.logoText}>Sprout</strong>
          {isMockMode && <span className={styles.offlineBadge}>Offline Mode</span>}
        </div>
        <nav className={styles.desktopNav}>
          <ul className={styles.navList}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`${styles.navLink} ${isActive ? styles.activeLink : ''}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className={styles.userSection}>
          <Link
            href="/profile"
            onClick={(e) => handleNavClick(e, '/profile')}
            className={styles.profileLinkBtn}
            title="View and Edit Profile Settings"
          >
            Hello, <strong>{currentUser.display_name || currentUser.username}</strong>{' '}
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt="Avatar"
                className={styles.navAvatar}
                data-testid="nav-avatar-img"
              />
            ) : (
              '👤'
            )}
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className={styles.mobileTabBar}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className={`${styles.tabItem} ${isActive ? styles.activeTab : ''}`}
            >
              <span className={styles.tabIcon}>{item.icon}</span>
              <span className={styles.tabLabel}>{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/profile"
          onClick={(e) => handleNavClick(e, '/profile')}
          className={`${styles.tabItem} ${pathname === '/profile' ? styles.activeTab : ''}`}
        >
          {currentUser.avatar_url ? (
            <img
              src={currentUser.avatar_url}
              alt="Avatar"
              className={styles.tabAvatar}
              data-testid="tab-avatar-img"
            />
          ) : (
            <span className={styles.tabIcon}>👤</span>
          )}
          <span className={styles.tabLabel}>Profile</span>
        </Link>
      </nav>

      {/* Leave Forest Confirmation Dialog */}
      {targetHref && (
        <div className={styles.confirmOverlay} data-testid="leave-confirm-modal">
          <div className={styles.confirmDialog}>
            <h3>Leave Friend's Forest?</h3>
            <p>Are you sure you want to leave your friend's forest and return to your own dashboard?</p>
            <div className={styles.confirmButtons}>
              <button
                onClick={handleConfirmLeave}
                className={styles.confirmBtn}
                data-testid="confirm-leave-btn"
              >
                Yes, Leave
              </button>
              <button
                onClick={() => setTargetHref(null)}
                className={styles.cancelBtn}
                data-testid="cancel-leave-btn"
              >
                Stay Here
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
