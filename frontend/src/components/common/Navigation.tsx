'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AppProviders';
import styles from './Navigation.module.css';

export const Navigation: React.FC = () => {
  const { currentUser, logout, isMockMode } = useAuth();
  const pathname = usePathname();

  if (!currentUser) return null;

  const forestLink = `/forest/${currentUser.username}`;
  
  const navItems = [
    { label: 'Habits', href: '/', icon: '🌿' },
    { label: 'Forest', href: forestLink, icon: '🌳' },
    { label: 'Friends', href: '/friends', icon: '👥' },
    { label: 'Demo', href: '/demo', icon: '🧪' },
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
          <span className={styles.welcomeText}>
            Hello, <strong>{currentUser.display_name || currentUser.username}</strong>
          </span>
          <button onClick={logout} className={styles.logoutBtn}>
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
        <button onClick={logout} className={styles.tabItemButton}>
          <span className={styles.tabIcon}>🚪</span>
          <span className={styles.tabLabel}>Logout</span>
        </button>
      </nav>
    </>
  );
};
