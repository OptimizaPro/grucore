/* One file per guide added after the first six. Order here is the order on
   the guides index page (after the core guides). */
import type { Guide } from "../guide-kit";
import { guide as paintingCost } from "./painting-cost";
import { guide as exteriorPaintTiming } from "./exterior-paint-timing";
import { guide as builderGradeUpgrades } from "./builder-grade-upgrades";
import { guide as tubToShower } from "./tub-to-shower";
import { guide as flooringHumidity } from "./flooring-humidity";
import { guide as bilingualContractor } from "./bilingual-contractor";
import { guide as studentCondo } from "./student-condo";
import { guide as deckRepair } from "./deck-repair-vs-replace";
import { guide as additionVsMoving } from "./addition-vs-moving";

export const NEW_GUIDES: Guide[] = [paintingCost, exteriorPaintTiming, builderGradeUpgrades, tubToShower, flooringHumidity, bilingualContractor, studentCondo, deckRepair, additionVsMoving];
