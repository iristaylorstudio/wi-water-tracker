// Computes confidence exactly as docs/SCHEMA.md defines it. Never hand-typed.
//
// Claim confidence:
//   High   – filing or government_record, dated within 18 months, no open conflict
//   Medium – company_statement or reported, or a filing older than 18 months, no open conflict
//   Low    – researcher_estimate or modeled, or any claim with an open conflict
//   None   – unknown
//
// Facility water confidence is the weakest of its water claims.

import type { Claim, ClaimType } from './loadData';

export type Confidence = 'High' | 'Medium' | 'Low' | 'None';

/** Weakest first. */
const RANK: Record<Confidence, number> = { None: 0, Low: 1, Medium: 2, High: 3 };

const FRESH_MONTHS = 18;

/** Claim types that count toward a facility's water confidence. */
export const WATER_CLAIM_TYPES: ClaimType[] = [
  'water_withdrawal_gpd',
  'water_consumption_gpd',
  'water_source',
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

/**
 * Weakest confidence across the facility's current (not superseded) water claims.
 * No water claims at all is None.
 */
export function facilityWaterConfidence(claims: Claim[], now: Date = new Date()): Confidence {
  const water = claims.filter((c) => WATER_CLAIM_TYPES.includes(c.claim_type) && !isSuperseded(c));
  return weakest(water.map((c) => claimConfidence(c, claims, now)));
}
