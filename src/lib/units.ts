// Water is stored in gallons per day. Liters per day is a display value only.

/** US liquid gallon in liters. */
export const LITERS_PER_GALLON = 3.785411784;

export function gpdToLitersPerDay(gpd: number): number {
  return gpd * LITERS_PER_GALLON;
}
