import { ComponentType } from "react";
import { PlantProps, PlantSpecies } from "../../types/plant";
import BonsaiPlant from "./BonsaiPlant";
import DesertCactusPlant from "./DesertCactusPlant";
import EtherealSakuraPlant from "./EtherealSakuraPlant";
import GoldenOakPlant from "./GoldenOakPlant";
import PothosPlant from "./PothosPlant";
import SpiderPlant from "./SpiderPlant";
import LavenderPlant from "./LavenderPlant";
import SunflowerPlant from "./SunflowerPlant";
import MidnightRosePlant from "./MidnightRosePlant";
import MarantaPlant from "./MarantaPlant";
import AlocasiaTinyDancerPlant from "./AlocasiaTinyDancerPlant";
import StringOfPearlsPlant from "./StringOfPearlsPlant";
import BegoniaMaculataPlant from "./BegoniaMaculataPlant";
import PhalaenopsisOrchidPlant from "./PhalaenopsisOrchidPlant";
import WaratahPlant from "./WaratahPlant";
import PoinsettiaPlant from "./PoinsettiaPlant";
import JasonPlant from "./JasonPlant";
import RemyPlant from "./RemyPlant";
import BlossomPlant from "./BlossomPlant";

/**
 * plantRegistry
 *
 * Open/Closed: adding a new species means adding one entry here and
 * writing its component — Plant.tsx's dispatch logic never changes.
 */
export const plantRegistry: Partial<Record<PlantSpecies, ComponentType<PlantProps>>> = {
  pothos: PothosPlant,
  spider_plant: SpiderPlant,
  bonsai: BonsaiPlant,
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
};