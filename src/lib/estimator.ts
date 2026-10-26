/* ---------------------------------------------------------------------------
   Cost-estimator model. One table drives the interactive calculator, the
   "typical range" lines on service pages and the cost guides, so the numbers
   a visitor sees never disagree with each other.

   Ranges are mid-range-finish planning numbers for Lee County, AL in 2026,
   installed, labor + materials. TODO(owner): calibrate against your last
   10–20 signed jobs every January. Standard finishes × 0.85, premium × 1.3.
   ------------------------------------------------------------------------- */
import type { Locale } from "./i18n";

export type EstimatorType = "kitchen" | "bath" | "addition" | "remodel" | "interior" | "exterior" | "cabinets" | "flooring" | "rental";
export type Finish = "standard" | "mid" | "premium";

type Tier = { lo: number; hi: number; l: Record<Locale, string>; d: Record<Locale, string> };

export const FINISH_MULT: Record<Finish, number> = { standard: 0.85, mid: 1, premium: 1.3 };

export const ESTIMATOR: Record<EstimatorType, { form: string; l: Record<Locale, string>; tiers: [Tier, Tier, Tier] }> = {
  kitchen: {
    form: "kitchensBaths", l: { en: "Kitchen", es: "Cocina" },
    tiers: [
      { lo: 8000, hi: 18000, l: { en: "Refresh", es: "Renovación ligera" }, d: { en: "Paint or reface cabinets, new counters, backsplash, lighting", es: "Pintar gabinetes, cubiertas nuevas, salpicadero, iluminación" } },
      { lo: 25000, hi: 45000, l: { en: "Full remodel, same layout", es: "Remodelación completa, misma distribución" }, d: { en: "New cabinets, counters, tile, fixtures, appliances in place", es: "Gabinetes, cubiertas, azulejo y accesorios nuevos, sin mover nada" } },
      { lo: 45000, hi: 80000, l: { en: "Full remodel, new layout", es: "Remodelación completa, nueva distribución" }, d: { en: "Move walls, plumbing or add an island", es: "Mover paredes o plomería, o agregar una isla" } },
    ],
  },
  bath: {
    form: "kitchensBaths", l: { en: "Bathroom", es: "Baño" },
    tiers: [
      { lo: 6000, hi: 12000, l: { en: "Refresh", es: "Renovación ligera" }, d: { en: "Vanity, toilet, fixtures, paint, floor", es: "Tocador, inodoro, accesorios, pintura, piso" } },
      { lo: 14000, hi: 26000, l: { en: "Full hall bath", es: "Baño completo" }, d: { en: "Down to studs, tiled tub or shower, new everything", es: "Hasta la estructura, tina o regadera de azulejo, todo nuevo" } },
      { lo: 26000, hi: 48000, l: { en: "Primary bath / layout change", es: "Baño principal / cambio de distribución" }, d: { en: "Curbless shower, double vanity, moved plumbing", es: "Regadera a ras de piso, doble lavabo, plomería reubicada" } },
    ],
  },
  addition: {
    form: "additions", l: { en: "Home addition", es: "Ampliación" },
    tiers: [
      { lo: 40000, hi: 75000, l: { en: "Garage or sunroom", es: "Cochera o solario" }, d: { en: "Attached garage, sunroom or screened porch", es: "Cochera adosada, solario o porche con mosquitero" } },
      { lo: 55000, hi: 95000, l: { en: "Bedroom or bonus room", es: "Dormitorio o cuarto extra" }, d: { en: "Roughly 250–350 sq ft, heated and cooled", es: "Unos 250–350 pies², con clima" } },
      { lo: 95000, hi: 170000, l: { en: "Primary or in-law suite", es: "Suite principal o para la familia" }, d: { en: "Roughly 400–500 sq ft with a full bath", es: "Unos 400–500 pies² con baño completo" } },
    ],
  },
  remodel: {
    form: "remodeling", l: { en: "Whole-home / multi-room", es: "Casa completa / varios cuartos" },
    tiers: [
      { lo: 10000, hi: 25000, l: { en: "One room or open a wall", es: "Un cuarto o abrir una pared" }, d: { en: "Single-room remodel or open-concept conversion", es: "Un solo espacio o pasar a concepto abierto" } },
      { lo: 30000, hi: 70000, l: { en: "Main living areas", es: "Áreas principales" }, d: { en: "Several rooms: floors, trim, paint, lighting, layout", es: "Varios cuartos: pisos, molduras, pintura, luz, distribución" } },
      { lo: 70000, hi: 150000, l: { en: "Whole home", es: "Casa completa" }, d: { en: "Full update of an older home, kitchen and baths included", es: "Poner al día toda la casa, con cocina y baños" } },
    ],
  },
  interior: {
    form: "painting", l: { en: "Interior painting", es: "Pintura interior" },
    tiers: [
      { lo: 1800, hi: 4000, l: { en: "2–3 rooms", es: "2 o 3 cuartos" }, d: { en: "Walls, with trim and ceilings as needed", es: "Paredes, y molduras y techos si hace falta" } },
      { lo: 6000, hi: 11000, l: { en: "Whole interior, ~2,000 sq ft", es: "Todo el interior, ~2,000 pies²" }, d: { en: "Walls, ceilings, trim and doors", es: "Paredes, techos, molduras y puertas" } },
      { lo: 10000, hi: 18000, l: { en: "Large home, 3,000+ sq ft", es: "Casa grande, 3,000+ pies²" }, d: { en: "Tall ceilings, stairwells, full trim package", es: "Techos altos, escaleras y todas las molduras" } },
    ],
  },
  exterior: {
    form: "painting", l: { en: "Exterior painting", es: "Pintura exterior" },
    tiers: [
      { lo: 4000, hi: 7000, l: { en: "Small home", es: "Casa chica" }, d: { en: "One story, under ~1,500 sq ft", es: "Un piso, menos de ~1,500 pies²" } },
      { lo: 6500, hi: 11000, l: { en: "Average home", es: "Casa mediana" }, d: { en: "~1,500–2,500 sq ft", es: "~1,500–2,500 pies²" } },
      { lo: 10000, hi: 18000, l: { en: "Large or two-story", es: "Grande o de dos pisos" }, d: { en: "2,500+ sq ft, lifts or heavy rot repair", es: "2,500+ pies², andamio o mucha madera podrida" } },
    ],
  },
  cabinets: {
    form: "finishing", l: { en: "Cabinet painting", es: "Pintura de gabinetes" },
    tiers: [
      { lo: 3500, hi: 5500, l: { en: "Small kitchen", es: "Cocina chica" }, d: { en: "About 20 doors and drawers", es: "Unas 20 puertas y cajones" } },
      { lo: 5000, hi: 8000, l: { en: "Average kitchen", es: "Cocina mediana" }, d: { en: "About 30 doors and drawers", es: "Unas 30 puertas y cajones" } },
      { lo: 7500, hi: 12000, l: { en: "Large kitchen + island", es: "Cocina grande con isla" }, d: { en: "40+ doors, island, or vanities too", es: "40+ puertas, isla, o también tocadores" } },
    ],
  },
  flooring: {
    form: "repairs", l: { en: "Flooring (LVP)", es: "Pisos (LVP)" },
    tiers: [
      { lo: 1800, hi: 3500, l: { en: "1–2 rooms", es: "1 o 2 cuartos" }, d: { en: "About 300 sq ft, old floor removed", es: "Unos 300 pies², quitando el piso viejo" } },
      { lo: 5000, hi: 9000, l: { en: "Main living areas", es: "Áreas principales" }, d: { en: "About 1,000 sq ft", es: "Unos 1,000 pies²" } },
      { lo: 9000, hi: 16000, l: { en: "Whole home", es: "Toda la casa" }, d: { en: "About 2,000 sq ft, transitions and trim", es: "Unos 2,000 pies², transiciones y zoclos" } },
    ],
  },
  rental: {
    form: "rental", l: { en: "Rental turnover", es: "Casa de renta" },
    tiers: [
      { lo: 1500, hi: 4000, l: { en: "Light turn", es: "Cambio ligero" }, d: { en: "Paint, patch, fixes, make-ready", es: "Pintura, resanes, reparaciones, lista para rentar" } },
      { lo: 5000, hi: 12000, l: { en: "Medium turn", es: "Cambio mediano" }, d: { en: "Paint + LVP + fixtures and hardware", es: "Pintura + LVP + accesorios y herrajes" } },
      { lo: 12000, hi: 30000, l: { en: "Heavy turn", es: "Cambio fuerte" }, d: { en: "Kitchen or bath updates between tenants", es: "Actualizar cocina o baño entre inquilinos" } },
    ],
  },
};

const round = (n: number) => (n < 10000 ? Math.round(n / 100) * 100 : Math.round(n / 500) * 500);
export function estimate(type: EstimatorType, tier: 0 | 1 | 2, finish: Finish): { lo: number; hi: number } {
  const t = ESTIMATOR[type].tiers[tier], m = FINISH_MULT[finish];
  return { lo: round(t.lo * m), hi: round(t.hi * m) };
}

export const money = (n: number) => `$${n.toLocaleString("en-US")}`;
/** "$6k–$11k" style range for tiles; whole thousands unless the number needs a decimal. */
export const kRange = (lo: number, hi: number) => `$${(lo / 1000).toFixed(lo % 1000 ? 1 : 0)}k–$${(hi / 1000).toFixed(hi % 1000 ? 1 : 0)}k`;
