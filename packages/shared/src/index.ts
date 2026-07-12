// Shared types
export * from './types/friendship';
export * from './types/habit';
export * from './types/habitLog';
export * from './types/interaction';
export * from './types/nudge';
export { type PlantSpecies, type FinalVariant, type PlantProps, type GrowthState } from './types/plant';
export * from './types/profile';
export * from './types/reflection';
export * from './types/syncQueue';
export * from './schemas/habitSchema';
export * from './schemas/profileSchema';
export * from './schemas/logSchema';

// Shared validations & utils
export * from './utils/difficulty';
export * from './utils/friendshipValidation';
export * from './utils/getGrowthState';
export * from './utils/habitValidation';
export * from './utils/interactionValidation';
export * from './utils/logValidation';
export * from './utils/mythicalGlimmer';
export * from './utils/nudgeValidation';
export * from './utils/plantFormatting';
export * from './utils/reflectionValidation';
export * from './domain/dateFormatting';
export * from './domain/habitProgress';
export * from './domain/habitStatus';
export * from './domain/wateringLimits';

// Re-export plant geometry helpers
export * from './utils/plantGeometry/blossomGeometry';
export * from './utils/plantGeometry/cactusGeometry';
export * from './utils/plantGeometry/dogGeometry';
export * from './utils/plantGeometry/humanoidBodyGeometry';
export * from './utils/plantGeometry/jasonGeometry';
export * from './utils/plantGeometry/lavenderGeometry';
export * from './utils/plantGeometry/orchidGeometry';
export * from './utils/plantGeometry/pothosGeometry';
export * from './utils/plantGeometry/radialBloomGeometry';
export * from './utils/plantGeometry/radialLeafGeometry';
export * from './utils/plantGeometry/remyGeometry';
export * from './utils/plantGeometry/roseGeometry';
export * from './utils/plantGeometry/sakuraGeometry';
export * from './utils/plantGeometry/spiderPlantGeometry';
export * from './utils/plantGeometry/stalkGeometry';
export * from './utils/plantGeometry/sunflowerGeometry';
export * from './utils/plantGeometry/treeGeometry';
export * from './utils/plantGeometry/vineGeometry';
