import type { ComponentType } from "react";
import type { PlantProps, PlantSpecies } from "@sprout/shared";
import { AlocasiaTinyDancerPlant } from "./components/AlocasiaTinyDancerPlant";
import { BegoniaMaculataPlant } from "./components/BegoniaMaculataPlant";
import { BlossomPlant } from "./components/BlossomPlant";
import { BonsaiPlant } from "./components/BonsaiPlant";
import { DesertCactusPlant } from "./components/DesertCactusPlant";
import { EtherealSakuraPlant } from "./components/EtherealSakuraPlant";
import { GoldenOakPlant } from "./components/GoldenOakPlant";
import { JasonPlant } from "./components/JasonPlant";
import { LavenderPlant } from "./components/LavenderPlant";
import { MarantaPlant } from "./components/MarantaPlant";
import { MidnightRosePlant } from "./components/MidnightRosePlant";
import { PhalaenopsisOrchidPlant } from "./components/PhalaenopsisOrchidPlant";
import { PoinsettiaPlant } from "./components/PoinsettiaPlant";
import { PothosPlant } from "./components/PothosPlant";
import { RemyPlant } from "./components/RemyPlant";
import { SpiderPlant } from "./components/SpiderPlant";
import { SprigPlant } from "./components/SprigPlant";
import { StringOfPearlsPlant } from "./components/StringOfPearlsPlant";
import { SunflowerPlant } from "./components/SunflowerPlant";
import { WaratahPlant } from "./components/WaratahPlant";

export const nativePlantRegistry: Record<PlantSpecies, ComponentType<PlantProps>> = {
  bonsai: BonsaiPlant,
  pothos: PothosPlant,
  spider_plant: SpiderPlant,
  lavender: LavenderPlant,
  sunflower: SunflowerPlant,
  midnight_rose: MidnightRosePlant,
  desert_cactus: DesertCactusPlant,
  golden_oak: GoldenOakPlant,
  ethereal_sakura: EtherealSakuraPlant,
  maranta_leuconeura: MarantaPlant,
  alocasia_tiny_dancer: AlocasiaTinyDancerPlant,
  string_of_pearls: StringOfPearlsPlant,
  begonia_maculata: BegoniaMaculataPlant,
  phalaenopsis_scarlett_jubilee: PhalaenopsisOrchidPlant,
  waratah: WaratahPlant,
  poinsettia: PoinsettiaPlant,
  jason: JasonPlant,
  remy: RemyPlant,
  blossom: BlossomPlant,
  sprig_plant: SprigPlant,
};

export function plantDisplayName(species: PlantSpecies): string {
  if (species === "maranta_leuconeura") return "Prayer Plant (Maranta)";
  if (species === "phalaenopsis_scarlett_jubilee") return "Orchid Scarlett Jubilee";
  return species.split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
}
