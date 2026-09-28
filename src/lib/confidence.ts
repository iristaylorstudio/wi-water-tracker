// Computes confidence exactly as docs/SCHEMA.md defines it. Never hand-typed.
//
// Claim confidence:
//   High   – filing or government_record, dated within 18 months, no open conflict
//   Medium – company_statement or reported, or a filing or government_record older than
//            18 months or undated, no open conflict
//   Low    – researcher_estimate or modeled, or any claim with an open conflict
//   None   – unknown
//
// Facility water confidence is the weakest among water claims that have a value.
// Unknown claims are counted separately, not folded into the confidence.

import type { Claim, ClaimType } from './loadData';

export type Confidence = 'High' | 'Medium' | 'Low' | 'None';

/** Weakest first. */
const RANK: Record<Confidence, number> = { None: 0, Low: 1, Medium: 2, High: 3 };

const FRESH_MONTHS = 18;

/** Display colors, shared by map pins and badges. None is gray: nothing to grade. */
export const CONFIDENCE_COLORS: Record<Confidence, string> = {
  High: '#1b6b47',
  Medium: '#5e9e6e',
  Low: '#d49a1f',
  None: '#8a8f94',
};

export const CONFIDENCE_LEVELS: Confidence[] = ['High', 'Medium', 'Low', 'None'];

/** Claim types that count toward a facility's water confidence. */
export const WATER_CLAIM_TYPES: ClaimType[] = [
  'water_withdrawal_gpd',
  'water_consumption_gpd',
  'water_source',
  'cooling_type',
  'cooling_water_reuse',
];

/** A claim no longer current because a newer claim replaced it. */
const isSuperseded = (c: Claim) => c.superseded_by != null && c.superseded_by !== '';

/**
 * A conflict is open when this claim and the other claim are both current
 * (neither superseded). Links count in either direction.
 */
export function hasOpenConflict(claim: Claim, allClaims: Claim[]): boolean {
  if (isSuperseded(claim)) return false;
  return allClaims.some(
    (other) =>
      other.id !== claim.id &&
      !isSuperseded(other) &&
      ((claim.conflicts_with ?? []).includes(other.id) || (other.conflicts_with ?? []).includes(claim.id)),
  );
}

/** True when `asOf` is no more than 18 months before `now`. */
export function isFresh(asOf: string | null, now: Date): boolean {
  if (!asOf) return false;
  const cutoff = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - FRESH_MONTHS, now.getUTCDate()));
  return new Date(`${asOf}T00:00:00Z`) >= cutoff;
}

/**
 * @param allClaims every claim for the facility, used to find conflicts
 * @param now the build date; age is measured from here
 */
export function claimConfidence(claim: Claim, allClaims: Claim[], now: Date = new Date()): Confidence {
  if (claim.evidence_type === 'unknown' || claim.value === 'unknown') return 'None';
  if (hasOpenConflict(claim, allClaims)) return 'Low';

  switch (claim.evidence_type) {
    case 'filing':
    case 'government_record':
      return isFresh(claim.as_of, now) ? 'High' : 'Medium';
    case 'company_statement':
    case 'reported':
      return 'Medium';
    case 'researcher_estimate':
    case 'modeled':
      return 'Low';
  }
}

export function weakest(levels: Confidence[]): Confidence {
  if (levels.length === 0) return 'None';
  return levels.reduce((a, b) => (RANK[b] < RANK[a] ? b : a));
}

const currentWaterClaims = (claims: Claim[]) =>
  claims.filter((c) => WATER_CLAIM_TYPES.includes(c.claim_type) && !isSuperseded(c));

/**
 * Weakest confidence among the facility's current water claims that have a value.
 * None only when every water claim is unknown, or there are none.
 */
export function facilityWaterConfidence(claims: Claim[], now: Date = new Date()): Confidence {
  const known = currentWaterClaims(claims)
    .map((c) => claimConfidence(c, claims, now))
    .filter((level) => level !== 'None');
  return weakest(known);
}

const isUnknown = (c: Claim) => c.evidence_type === 'unknown' || c.value === 'unknown';

/**
 * For "3 of 5 water facts not disclosed." Counts by claim type: a type is disclosed
 * when at least one current claim of that type has a value. A type with no claim at
 * all counts as not disclosed. Total is always the number of water claim types.
 */
export function waterDisclosure(claims: Claim[]): { unknown: number; total: number } {
  const water = currentWaterClaims(claims);
  const unknown = WATER_CLAIM_TYPES.filter(
    (type) => !water.some((c) => c.claim_type === type && !isUnknown(c)),
  ).length;
  return { unknown, total: WATER_CLAIM_TYPES.length };
}
