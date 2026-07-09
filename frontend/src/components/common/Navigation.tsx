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

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const sanctuaryLink = `/sanctuary/${currentUser.username}`;
  
  const navItems = [
    { label: 'Forest', href: '/', icon: '🌿' },
    { label: 'Sanctuary', href: sanctuaryLink, icon: '🌳' },
    { label: 'Friends', href: '/friends', icon: '👥' },
    { label: 'Lab', href: '/demo', icon: '🧪' },
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
                  <Link href={item.href} className={`${styles.navLink} ${isActive ? styles.activeLink : ''}`}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className={styles.userSection}>
          <Link href="/profile" className={styles.profileLinkBtn} title="View and Edit Profile Settings">
            Hello, <strong>{currentUser.display_name || currentUser.username}</strong> 👤
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
            <Link key={item.label} href={item.href} className={`${styles.tabItem} ${isActive ? styles.activeTab : ''}`}>
              <span className={styles.tabIcon}>{item.icon}</span>
              <span className={styles.tabLabel}>{item.label}</span>
            </Link>
          );
        })}
        <Link href="/profile" className={`${styles.tabItem} ${pathname === '/profile' ? styles.activeTab : ''}`}>
          <span className={styles.tabIcon}>👤</span>
          <span className={styles.tabLabel}>Profile</span>
        </Link>
      </nav>
    </>
  );
};
