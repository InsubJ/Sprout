// @vitest-environment happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { PlantRenderer, normalizePlantSpecies } from '../components/habit/PlantRenderer';

describe('PlantRenderer Component', () => {
  let container: HTMLDivElement | null = null;
  let root: any = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount();
      });
    }
    if (container) {
      document.body.removeChild(container);
    }
    container = null;
    root = null;
  });

  const renderComponent = (props: any) => {
    act(() => {
      root.render(React.createElement(PlantRenderer, props));
    });
  };

  describe('normalizePlantSpecies', () => {
    it('returns bonsai for undefined or empty input', () => {
      expect(normalizePlantSpecies()).toBe('bonsai');
      expect(normalizePlantSpecies('')).toBe('bonsai');
    });

    it('returns matching registered species', () => {
      expect(normalizePlantSpecies('pothos')).toBe('pothos');
      expect(normalizePlantSpecies('desert_cactus')).toBe('desert_cactus');
      expect(normalizePlantSpecies('Desert Cactus')).toBe('desert_cactus');
      expect(normalizePlantSpecies('desert-cactus')).toBe('desert_cactus');
    });

    it('returns bonsai for unregistered/unknown species', () => {
      expect(normalizePlantSpecies('unknown_alien_plant')).toBe('bonsai');
    });
  });

  describe('Rendering', () => {
    it('renders the SVG for a valid species (Bonsai)', () => {
      renderComponent({
        plantType: 'bonsai',
        currentWaterings: 10,
        targetWaterings: 20,
        witherCount: 1,
        status: 'healthy',
      });

      const containerEl = document.querySelector('[data-testid="plant-renderer"]');
      expect(containerEl).toBeTruthy();

      const svgEl = containerEl?.querySelector('svg');
      expect(svgEl).toBeTruthy();
      expect(svgEl?.getAttribute('aria-label')).toContain('Bonsai');
      expect(svgEl?.getAttribute('aria-label')).toContain('50% growth');
    });

    it('renders the fallback species (Bonsai) for invalid plantType', () => {
      renderComponent({
        plantType: 'invalid_type_here',
        currentWaterings: 15,
        targetWaterings: 30,
        witherCount: 0,
        status: 'healthy',
      });

      const containerEl = document.querySelector('[data-testid="plant-renderer"]');
      const svgEl = containerEl?.querySelector('svg');
      expect(svgEl).toBeTruthy();
      expect(svgEl?.getAttribute('aria-label')).toContain('Bonsai');
    });

    it('renders different species correctly (e.g. desert_cactus)', () => {
      renderComponent({
        plantType: 'desert_cactus',
        currentWaterings: 5,
        targetWaterings: 10,
        witherCount: 2,
        status: 'withered',
      });

      const containerEl = document.querySelector('[data-testid="plant-renderer"]');
      const svgEl = containerEl?.querySelector('svg');
      expect(svgEl).toBeTruthy();
      expect(svgEl?.getAttribute('aria-label')).toContain('cactus');
      expect(svgEl?.getAttribute('aria-label')).toContain('withered');
    });
  });

  describe('Design by Contract (Preconditions)', () => {
    it('throws error if currentWaterings is negative', () => {
      expect(() => {
        PlantRenderer({
          plantType: 'bonsai',
          currentWaterings: -1,
          targetWaterings: 10,
          witherCount: 0,
          status: 'healthy',
        });
      }).toThrow('Current waterings cannot be negative');
    });

    it('throws error if targetWaterings is non-positive', () => {
      expect(() => {
        PlantRenderer({
          plantType: 'bonsai',
          currentWaterings: 5,
          targetWaterings: 0,
          witherCount: 0,
          status: 'healthy',
        });
      }).toThrow('Target waterings must be greater than 0');

      expect(() => {
        PlantRenderer({
          plantType: 'bonsai',
          currentWaterings: 5,
          targetWaterings: -5,
          witherCount: 0,
          status: 'healthy',
        });
      }).toThrow('Target waterings must be greater than 0');
    });

    it('throws error if witherCount is negative', () => {
      expect(() => {
        PlantRenderer({
          plantType: 'bonsai',
          currentWaterings: 5,
          targetWaterings: 10,
          witherCount: -2,
          status: 'healthy',
        });
      }).toThrow('Wither count cannot be negative');
    });

    it('throws error if status is invalid', () => {
      expect(() => {
        PlantRenderer({
          plantType: 'bonsai',
          currentWaterings: 5,
          targetWaterings: 10,
          witherCount: 0,
          status: 'invalid-status-value' as any,
        });
      }).toThrow('Invalid status:');
    });
  });
});

