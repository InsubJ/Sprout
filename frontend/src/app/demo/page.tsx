'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../components/common/AppProviders';
import { HabitServiceContext } from '../../services/HabitServiceContext';
import { plantRegistry } from '../../components/plants/plantRegistry';
import { PlantSpecies, HabitStatus } from '../../types/plant';
import { Habit } from '../../types/habit';
import BonsaiPlant from '../../components/plants/BonsaiPlant';
import styles from './DemoPage.module.css';

type SortOption = 'alphabetical' | 'rarity' | 'newest';

export default function DemoPage() {
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

  // Species descriptions/tiers for aesthetic cards
  const speciesMeta: Record<PlantSpecies, { name: string; tier: string; color: string }> = {
    pothos: { name: 'Pothos', tier: 'Common', color: '#689F38' },
    spider_plant: { name: 'Spider Plant', tier: 'Common', color: '#8BC34A' },
    bonsai: { name: 'Bonsai', tier: 'Uncommon', color: '#4CAF50' },
    lavender: { name: 'Lavender', tier: 'Uncommon', color: '#9C27B0' },
    sunflower: { name: 'Sunflower', tier: 'Uncommon', color: '#FFEB3B' },
    midnight_rose: { name: 'Midnight Rose', tier: 'Rare', color: '#E91E63' },
    desert_cactus: { name: 'Desert Cactus', tier: 'Rare', color: '#009688' },
    golden_oak: { name: 'Golden Oak', tier: 'Mythical', color: '#FFC107' },
    ethereal_sakura: { name: 'Ethereal Sakura', tier: 'Mythical', color: '#FF80AB' },
    maranta_leuconeura: { name: 'Prayer Plant (Maranta)', tier: 'Uncommon', color: '#3F51B5' },
    alocasia_tiny_dancer: { name: 'Alocasia Tiny Dancer', tier: 'Uncommon', color: '#00BCD4' },
    string_of_pearls: { name: 'String of Pearls', tier: 'Rare', color: '#4CAF50' },
    begonia_maculata: { name: 'Begonia Maculata', tier: 'Rare', color: '#FF5722' },
    phalaenopsis_scarlett_jubilee: { name: 'Orchid Scarlett Jubilee', tier: 'Rare', color: '#E91E63' },
    waratah: { name: 'Waratah', tier: 'Mythical', color: '#D32F2F' },
    poinsettia: { name: 'Poinsettia', tier: 'Common', color: '#F44336' },
  };

  const handleStatusChange = (newStatus: HabitStatus) => {
    setStatus(newStatus);
  };

  const speciesKeys = Object.keys(plantRegistry) as PlantSpecies[];

  // Filter keys by search term
  const filteredKeys = speciesKeys.filter((key) => {
    const meta = speciesMeta[key];
    if (!meta) return false;
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

    // Apply sorting logic when unlocked states are equivalent
    if (sortBy === 'alphabetical') {
      const nameA = speciesMeta[keyA]?.name || '';
      const nameB = speciesMeta[keyB]?.name || '';
      return nameA.localeCompare(nameB);
    }
    
    if (sortBy === 'rarity') {
      const tierRank: Record<string, number> = { mythical: 0, rare: 1, uncommon: 2, common: 3 };
      const rankA = tierRank[speciesMeta[keyA]?.tier.toLowerCase() || ''] ?? 4;
      const rankB = tierRank[speciesMeta[keyB]?.tier.toLowerCase() || ''] ?? 4;
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return (speciesMeta[keyA]?.name || '').localeCompare(speciesMeta[keyB]?.name || '');
    }
    
    if (sortBy === 'newest') {
      const dateA = speciesCompletionDates[keyA] ? new Date(speciesCompletionDates[keyA]).getTime() : 0;
      const dateB = speciesCompletionDates[keyB] ? new Date(speciesCompletionDates[keyB]).getTime() : 0;
      if (dateA !== dateB) {
        return dateB - dateA; // Newest first
      }
      return (speciesMeta[keyA]?.name || '').localeCompare(speciesMeta[keyB]?.name || '');
    }

    return 0;
  });

  // Calculate pagination bounds
  const totalPages = Math.ceil(sortedKeys.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentKeys = sortedKeys.slice(startIndex, startIndex + pageSize);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Botanical Laboratory</h1>
      <p className={styles.subtitle}>
        Simulate growth, setbacks, and variants for all 16 plant species.
      </p>

      {/* Control Panel */}
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
          <label className={styles.controlLabel}>
            Wither Count (Setbacks): <strong>{witherCount}</strong>
          </label>
          <input
            type="range"
            min="0"
            max="6"
            value={witherCount}
            onChange={(e) => setWitherCount(Number(e.target.value))}
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
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={styles.sortSelect}
          >
            <option value="alphabetical">A-Z Name</option>
            <option value="rarity">Rarity (Mythical to Common)</option>
            <option value="newest">Newest Discovered</option>
          </select>
        </div>
      </section>

      {/* Plants Grid */}
      <section className={styles.plantsGrid}>
        {currentKeys.map((key) => {
          const Renderer = plantRegistry[key] || BonsaiPlant;
          const meta = speciesMeta[key];
          const isUnlocked = revealAll || completedSpecies.has(key);

          // Calculate waterings matching the slider %
          const targetWaterings = 100;
          const currentWaterings = Math.round((growthPercent / 100) * targetWaterings);

          if (!isUnlocked) {
            return (
              <div key={key} className={`${styles.plantCard} ${styles.lockedCard}`}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.plantName}>❓ Unknown Plant</h3>
                  <span className={styles.tierBadge} style={{ backgroundColor: '#e5e7eb', color: '#9ca3af' }}>
                    Locked
                  </span>
                </div>
                <div className={styles.svgContainer}>
                  <span className={styles.lockIcon}>🔒</span>
                </div>
                <div className={styles.cardDetails} style={{ justifyContent: 'center', textAlign: 'center', color: '#8c9c91' }}>
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
                  size={200}
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
