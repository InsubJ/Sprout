import { spacing } from "@sprout/design-tokens";

export interface LabResponsiveLayout {
  cardWidth: number;
  columns: number;
  pageSize: number;
}

export function calculateLabResponsiveLayout(contentWidth: number): LabResponsiveLayout {
  if (!Number.isFinite(contentWidth) || contentWidth <= 0)
    throw new RangeError("Lab content width must be a positive finite number");

  const availableWidth = Math.max(1, contentWidth - spacing.lg * 2);
  const columns = availableWidth >= 840 ? 3 : availableWidth >= 520 ? 2 : 1;
  const gapsWidth = spacing.md * (columns - 1);

  return {
    cardWidth: Math.floor((availableWidth - gapsWidth) / columns),
    columns,
    pageSize: columns === 1 ? 4 : columns * 3,
  };
}
