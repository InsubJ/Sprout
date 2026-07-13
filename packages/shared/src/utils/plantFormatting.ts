/**
 * Formats a raw plant type identifier (e.g. "midnight_rose", "desert_cactus")
 * into a user-friendly, capitalized display name (e.g. "Midnight Rose", "Desert Cactus").
 *
 * @param plantType The raw plant type string
 * @returns The formatted display string
 */
export function formatPlantType(plantType: string): string {
  if (!plantType) return "";

  // If it's already mixed case with spaces and no underscores, return as is
  if (
    !plantType.includes("_") &&
    !plantType.includes("-") &&
    /[A-Z]/.test(plantType) &&
    /\s/.test(plantType)
  ) {
    return plantType;
  }

  return plantType
    .split(/[_-]/)
    .map((word) => {
      if (!word) return "";
      // Capitalize the first letter and keep the rest lowercase
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
