'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../components/common/AppProviders';
import { HabitServiceContext } from '../../services/HabitServiceContext';
import { plantRegistry } from '../../components/plants/plantRegistry';
import { PlantSpecies, HabitStatus, DifficultyTier } from '../../types/plant';
import { Habit } from '../../types/habit';
import BonsaiPlant from '../../components/plants/BonsaiPlant';
import { getTierForSpecies } from '../../utils/difficulty';
import { FormDropdown } from '../../components/common/FormDropdown';
import styles from './LabPage.module.css';

type SortOption = 'alphabetical' | 'rarity' | 'newest';

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'alphabetical', label: 'A-Z Name' },
  { value: 'rarity', label: 'Rarity (Mythical to Common)' },
  { value: 'newest', label: 'Newest Discovered' },
];

const TIER_COLORS: Record<DifficultyTier, string> = {
  common: '#689F38',
  uncommon: '#4CAF50',
  rare: '#E91E63',
  mythical: '#FFC107',
};

const getSpeciesMeta = (species: PlantSpecies) => {
  const tier = getTierForSpecies(species);
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
  const color = TIER_COLORS[tier];

  let name = species
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (species === 'maranta_leuconeura') name = 'Prayer Plant (Maranta)';
  if (species === 'alocasia_tiny_dancer') name = 'Alocasia Tiny Dancer';
  if (species === 'phalaenopsis_scarlett_jubilee') name = 'Orchid Scarlett Jubilee';

  return { name, tier: tierName, color, tierKey: tier };
};

export default function LabPage() {
  const { currentUser } = useAuth();
  const habitService = useContext(HabitServiceContext);

  const [growthPercent, setGrowthPercent] = useState<number>(50);
  const [witherCount, setWitherCount] = useState<number>(0);
  const [status, setStatus] = useState<HabitStatus>('healthy');

  // Developer simulation & user discovery states
  const [completedSpecies, setCompletedSpecies] = useState<Set<string>>(new Set());
  const [speciesCompletionDates, setSpeciesCompletionDates] = useState<Record<string, string>>({});
  const [revealAll, setRevealAll] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');

  const [controlsOpen, setControlsOpen] = useState<boolean>(false);

  // Responsive Pagination
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sync mobile viewport width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch completed plants for discovery status
  useEffect(() => {
    if (currentUser && habitService) {
      habitService
        .getHabits(currentUser.id)
        .then((habits: Habit[]) => {
          const completed = habits.filter((h: Habit) => h.status === 'completed');
          const completedSet = new Set(completed.map((h: Habit) => h.plant_type));
          setCompletedSpecies(new Set(completedSet));

          // Map species to latest completion dates
          const dates: Record<string, string> = {};
          completed.forEach((h: Habit) => {
            const currentMax = dates[h.plant_type];
            if (!currentMax || new Date(h.completed_at || 0) > new Date(currentMax)) {
              dates[h.plant_type] = h.completed_at || new Date().toISOString();
            }
          });
          setSpeciesCompletionDates(dates);
        })
        .catch((err: any) => console.error('Failed to load completed plants for laboratory:', err));
    }
  }, [currentUser, habitService]);

  // Reset page when searching, sorting or resizing
  const pageSize = isMobile ? 4 : 8;
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, pageSize]);

  const handleStatusChange = (newStatus: HabitStatus) => {
    setStatus(newStatus);
  };

  const speciesKeys = Object.keys(plantRegistry) as PlantSpecies[];

  // Filter keys by search term
  const filteredKeys = speciesKeys.filter((key) => {
    const meta = getSpeciesMeta(key);
    const nameMatch = meta.name.toLowerCase().includes(searchTerm.toLowerCase());
    const tierMatch = meta.tier.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || tierMatch;
  });

  // Sort the keys: Discovered plants always take precedence over undiscovered ones.
  const sortedKeys = [...filteredKeys].sort((keyA, keyB) => {
    const isUnlockedA = revealAll || completedSpecies.has(keyA);
    const isUnlockedB = revealAll || completedSpecies.has(keyB);

    if (isUnlockedA && !isUnlockedB) return -1;
    if (!isUnlockedA && isUnlockedB) return 1;

    const metaA = getSpeciesMeta(keyA);
    const metaB = getSpeciesMeta(keyB);

    // Apply sorting logic when unlocked states are equivalent
    if (sortBy === 'alphabetical') {
      return metaA.name.localeCompare(metaB.name);
    }

    if (sortBy === 'rarity') {
      const tierRank: Record<DifficultyTier, number> = { mythical: 0, rare: 1, uncommon: 2, common: 3 };
      const rankA = tierRank[metaA.tierKey] ?? 4;
      const rankB = tierRank[metaB.tierKey] ?? 4;
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return metaA.name.localeCompare(metaB.name);
    }

    if (sortBy === 'newest') {
      const dateA = speciesCompletionDates[keyA] ? new Date(speciesCompletionDates[keyA]).getTime() : 0;
      const dateB = speciesCompletionDates[keyB] ? new Date(speciesCompletionDates[keyB]).getTime() : 0;
      if (dateA !== dateB) {
        return dateB - dateA; // Newest first
      }
      return metaA.name.localeCompare(metaB.name);
    }

    return 0;
  });

  // Calculate pagination bounds
  const totalPages = Math.ceil(sortedKeys.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentKeys = sortedKeys.slice(startIndex, startIndex + pageSize);

  const panelContent = (
    <section className={styles.controlPanel}>
      <div className={styles.controlGroup}>
        <label className={styles.controlLabel}>
          Growth Progress: <strong>{growthPercent}%</strong>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={growthPercent}
          onChange={(e) => setGrowthPercent(Number(e.target.value))}
          className={styles.slider}
        />
      </div>

      <div className={styles.controlGroup}>
        <span className={styles.controlLabel}>Plant Status:</span>
        <div className={styles.buttonRow}>
          <button
            onClick={() => handleStatusChange('healthy')}
            className={`${styles.statusBtn} ${status === 'healthy' ? styles.activeHealthy : ''}`}
          >
            🌱 Healthy
          </button>
          <button
            onClick={() => handleStatusChange('withered')}
            className={`${styles.statusBtn} ${status === 'withered' ? styles.activeWithered : ''}`}
          >
            🍂 Withered
          </button>
          <button
            onClick={() => handleStatusChange('completed')}
            className={`${styles.statusBtn} ${status === 'completed' ? styles.activeCompleted : ''}`}
          >
            🌸 Completed
          </button>
        </div>
      </div>

      <div className={styles.controlGroup}>
        <span className={styles.controlLabel}>Discovery Simulator:</span>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={revealAll}
            onChange={(e) => setRevealAll(e.target.checked)}
            className={styles.checkbox}
          />
          Reveal all species (Admin Mode)
        </label>
      </div>
    </section>
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Botanical Laboratory</h1>
      <p className={styles.subtitle}>
        Simulate growth, setbacks, and variants for all {speciesKeys.length} plant species.
      </p>

      {isMobile ? (
        <>
          {controlsOpen && <div className={styles.backdrop} onClick={() => setControlsOpen(false)} />}

          <button className={styles.toggleBtn} onClick={() => setControlsOpen(true)}>
            Simulate
          </button>

          <div className={`${styles.mobileDrawer} ${controlsOpen ? styles.mobileDrawerOpen : ''}`}>
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>Simulation Controls</h2>
              <button className={styles.closeBtn} onClick={() => setControlsOpen(false)}>
                &times;
              </button>
            </div>
            {panelContent}
          </div>
        </>
      ) : (
        panelContent
      )}

      {/* Search & Sort Controls */}
      <section className={styles.filterSection}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search species by name or rarity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.sortGroup}>
          <label htmlFor="sortBy" className={styles.sortLabel}>Sort by:</label>
          <div className={styles.sortDropdown}>
            <FormDropdown
              id="sortBy"
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={setSortBy}
              ariaLabel="Sort plants"
            />
          </div>
        </div>
      </section>

      {/* Plants Grid */}
      <section className={styles.plantsGrid}>
        {currentKeys.map((key) => {
          const Renderer = plantRegistry[key] || BonsaiPlant;
          const meta = getSpeciesMeta(key);
          const isUnlocked = revealAll || completedSpecies.has(key);

          // Calculate waterings matching the slider %
          const targetWaterings = 100;
          const currentWaterings = Math.round((growthPercent / 100) * targetWaterings);

          if (!isUnlocked) {
            return (
              <div key={key} className={`${styles.plantCard} ${styles.lockedCard}`}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.plantName}>❓ Unknown Plant</h3>
                  <span className={styles.tierBadge} style={{ backgroundColor: '#e5e7eb', color: '#4b5563' }}>
                    Locked
                  </span>
                </div>
                <div className={styles.svgContainer}>
                  <span className={styles.lockIcon}>🔒</span>
                </div>
                <div className={styles.cardDetails} style={{ justifyContent: 'center', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <span>Not discovered yet. Grow and complete this species in Sprout to unlock.</span>
                </div>
              </div>
            );
          }

          return (
            <div key={key} className={styles.plantCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.plantName}>{meta.name}</h3>
                <span
                  className={styles.tierBadge}
                  style={{ backgroundColor: meta.color + '20', color: meta.color }}
                >
                  {meta.tier}
                </span>
              </div>

              <div className={styles.svgContainer}>
                <Renderer
                  currentWaterings={currentWaterings}
                  targetWaterings={targetWaterings}
                  witherCount={witherCount}
                  status={status}
                  size={230}
                />
              </div>

              <div className={styles.cardDetails}>
                <span>Waterings: {currentWaterings} / {targetWaterings}</span>
                <span>Setbacks: {witherCount}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className={styles.pageBtn}
          >
            ◀ Prev
          </button>
          <span className={styles.pageInfo}>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className={styles.pageBtn}
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}