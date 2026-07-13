import type { GeneratedPlantLayer, GeneratedPlantLayerType } from "../../types/customPlant";
import { computeTreeBranches, type TreeBranch } from "./treeGeometry";

export type GeneratedLeafShape =
  | "oval"
  | "lanceolate"
  | "heart"
  | "round"
  | "eucalyptus"
  | "needle";

export interface GeneratedLeafPosition {
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface GeneratedTreeGeometry {
  baseY: number;
  topY: number;
  translationX: number;
  scale: number;
  branches: TreeBranch[];
  canopyLeaves: GeneratedLeafPosition[];
  leafShape: GeneratedLeafShape;
}

function boundedCount(layer: GeneratedPlantLayer, fallback: number, maximum: number): number {
  return Math.min(maximum, Math.max(1, layer.count ?? layer.petalCount ?? fallback));
}

export function resolveGeneratedLeafShape(
  geometry: string,
  layerType: GeneratedPlantLayerType,
): GeneratedLeafShape {
  const label = geometry.toLowerCase();
  if (label.includes("eucalyptus")) return "eucalyptus";
  if (label.includes("needle") || label.includes("pine") || layerType === "spider_leaf")
    return "needle";
  if (label.includes("willow") || label.includes("lance")) return "lanceolate";
  if (label.includes("heart") || layerType === "pothos_leaf") return "heart";
  if (label.includes("round")) return "round";
  return "oval";
}

export function computeGeneratedFoliage(layer: GeneratedPlantLayer): GeneratedLeafPosition[] {
  const count = boundedCount(layer, 6, 16);
  const spread = layer.type === "spider_leaf" ? 170 : 145;
  const radius = (layer.type === "pothos_leaf" ? 34 : 48) * layer.scale;
  return Array.from({ length: count }, (_, index) => {
    const progress = count === 1 ? 0.5 : index / (count - 1);
    const angle = -spread / 2 + spread * progress + layer.rotation;
    const radians = (angle * Math.PI) / 180;
    const depth = index % 2 === 0 ? 1 : 0.76;
    return {
      x: layer.anchor.x + Math.sin(radians) * radius * depth,
      y: layer.anchor.y - Math.cos(radians) * radius * depth,
      rotation: angle,
      scale: layer.scale * (index % 3 === 0 ? 1.08 : 0.9),
    };
  });
}

export function computeGeneratedTree(layer: GeneratedPlantLayer): GeneratedTreeGeometry {
  const branchCount = Math.min(9, Math.max(6, layer.count ?? 7));
  const scale = Math.min(1.65, Math.max(1.15, layer.scale));
  const topY = Math.min(145, Math.max(75, layer.anchor.y));
  const anchorX = Math.min(235, Math.max(165, layer.anchor.x));
  const label = layer.geometry.toLowerCase();
  const isBonsai = label.includes("bonsai");
  const isWillow = label.includes("willow");
  const spreadBase = (isBonsai ? 30 : isWillow ? 48 : 40) * scale;
  const spreadStep = (isBonsai ? 6 : 8) * scale;
  const branches = computeTreeBranches(100, Math.min(16, Math.abs(layer.rotation) / 4), topY, {
    maxBranches: branchCount,
    branchDensity: 1,
    spreadBase,
    spreadStep,
  });
  const branchLeaves = branches.flatMap((branch, index): GeneratedLeafPosition[] => {
    const side = branch.leafX >= 200 ? 1 : -1;
    const droop = isWillow ? 13 : 0;
    return [
      {
        x: branch.leafX,
        y: branch.leafY + droop,
        rotation: side * (55 + index * 3),
        scale: scale * 1.15,
      },
      {
        x: branch.leafX - side * 15 * scale,
        y: branch.leafY + 8 * scale + droop,
        rotation: side * 25,
        scale: scale * 0.9,
      },
      {
        x: branch.leafX + side * 13 * scale,
        y: branch.leafY - 9 * scale + droop,
        rotation: side * 78,
        scale,
      },
    ];
  });
  const crownLeaves: GeneratedLeafPosition[] = [-2, -1, 0, 1, 2].map((offset) => ({
    x: 200 + offset * 18 * scale,
    y: topY - 18 * scale + Math.abs(offset) * 5,
    rotation: offset * 28,
    scale: scale * (offset === 0 ? 1.3 : 1.05),
  }));
  return {
    baseY: 300,
    topY,
    translationX: anchorX - 200,
    scale,
    branches,
    canopyLeaves: [...branchLeaves, ...crownLeaves],
    leafShape: resolveGeneratedLeafShape(layer.geometry, layer.type),
  };
}
