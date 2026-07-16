import { useCustomPlants } from "../customPlants/hooks/useCustomPlants";
import { useSanctuary } from "./useSanctuary";
import { useSanctuaryCatalogueFilter } from "./useSanctuaryCatalogueFilter";

export function useSanctuaryCatalogue() {
  const classic = useSanctuary();
  const custom = useCustomPlants();
  const catalogue = useSanctuaryCatalogueFilter(classic.habits, custom.plants);
  return {
    ...catalogue,
    classicHabits: classic.habits,
    loading: classic.loading || custom.loading,
    error: classic.error ?? custom.error,
    deleteCustomPlant: custom.deletePlant,
    deleteHabit: classic.deleteHabit,
  };
}
