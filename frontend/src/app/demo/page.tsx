'use client';

import React, { useState } from 'react';
import { plantRegistry } from '../../components/plants/plantRegistry';
import { PlantSpecies, HabitStatus, FinalVariant } from '../../types/plant';
import BonsaiPlant from '../../components/plants/BonsaiPlant';
import styles from './DemoPage.module.css';

export default function DemoPage() {
  const [growthPercent, setGrowthPercent] = useState<number>(50);
  const [witherCount, setWitherCount] = useState<number>(0);
  const [status, setStatus] = useState<HabitStatus>('healthy');
  const [selectedVariant, setSelectedVariant] = useState<FinalVariant>('steady');

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
    maranta_leuconeura: { name: 'Prayer Plant (Maranta)', tier: 'Named / Custom', color: '#3F51B5' },
    alocasia_tiny_dancer: { name: 'Alocasia Tiny Dancer', tier: 'Named / Custom', color: '#00BCD4' },
    string_of_pearls: { name: 'String of Pearls', tier: 'Named / Custom', color: '#4CAF50' },
    begonia_maculata: { name: 'Begonia Maculata', tier: 'Named / Custom', color: '#FF5722' },
    phalaenopsis_scarlett_jubilee: { name: 'Orchid Scarlett Jubilee', tier: 'Named / Custom', color: '#E91E63' },
    waratah: { name: 'Waratah', tier: 'Named / Custom', color: '#D32F2F' },
    poinsettia: { name: 'Poinsettia', tier: 'Named / Custom', color: '#F44336' },
  };

  const handleStatusChange = (newStatus: HabitStatus) => {
    setStatus(newStatus);
  };

  const speciesKeys = Object.keys(plantRegistry) as PlantSpecies[];

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
          <label className={styles.controlLabel}>Maturity Variant (Completed):</label>
          <select
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value as FinalVariant)}
            className={styles.selectInput}
          >
            <option value="flawless">Flawless Bloom (0-1 Withers)</option>
            <option value="steady">Steady Growth (2-3 Withers)</option>
            <option value="scarred">Scarred Resilience (4+ Withers)</option>
          </select>
        </div>
      </section>

      {/* Plants Grid */}
      <section className={styles.plantsGrid}>
        {speciesKeys.map((key) => {
          const Renderer = plantRegistry[key] || BonsaiPlant;
          const meta = speciesMeta[key];
          
          // Calculate waterings matching the slider %
          const targetWaterings = 100;
          const currentWaterings = Math.round((growthPercent / 100) * targetWaterings);

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
                <span>Variant: {selectedVariant}</span>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
