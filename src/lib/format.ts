// Display formatting. Never changes a stored value, only how it reads.

import type { Claim } from './loadData';
import { gpdToLitersPerDay } from './units';
import { isUnknownClaim } from './confidence';

const number = new Intl.NumberFormat('en-US');

/** YYYY-MM-DD to "Mar 10, 2026". Null reads "No date". */
export function formatDate(date: string | null | undefined): string {
  if (!date) return 'No date';
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** The value as a resident would read it, without the unit. */
export function formatValue(claim: Claim): string {
  if (isUnknownClaim(claim)) return 'Unknown';
  if (typeof claim.value === 'number') {
    return claim.unit === 'USD' ? `$${number.format(claim.value)}` : number.format(claim.value);
  }
  return String(claim.value).replace(/_/g, ' ');
}

const UNIT_LABELS: Record<string, string> = {
  gpd: 'gallons per day',
  MW: 'MW',
  acres: 'acres',
  USD: 'US dollars',
  jobs: 'jobs',
};

export function formatUnit(unit: string | null): string {
  if (!unit) return '';
  return UNIT_LABELS[unit] ?? unit;
}

/** Liters per day for the gpd tooltip, or null when it does not apply. */
export function litersTooltip(claim: Claim): string | null {
  if (claim.unit !== 'gpd' || typeof claim.value !== 'number') return null;
  return `About ${number.format(Math.round(gpdToLitersPerDay(claim.value)))} liters per day`;
}
