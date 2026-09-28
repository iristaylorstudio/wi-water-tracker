// Plain-language labels for schema enums. Keys match docs/SCHEMA.md.

import type { ClaimType, EventType, EvidenceType, FacilityStatus } from './loadData';

/** Lifecycle order, used for sorting. */
export const STATUS_ORDER: FacilityStatus[] = [
  'proposal_pending',
  'proposed',
  'announced',
  'under_construction',
  'operational',
  'on_hold',
  'canceled',
  'denied',
];

export const STATUS_LABELS: Record<FacilityStatus, string> = {
  proposal_pending: 'Proposal pending',
  proposed: 'Proposed',
  announced: 'Announced',
  under_construction: 'Under construction',
  operational: 'Operational',
  on_hold: 'On hold',
  canceled: 'Canceled',
  denied: 'Denied',
};

export const EVIDENCE_LABELS: Record<EvidenceType, string> = {
  filing: 'Filing',
  government_record: 'Government record',
  company_statement: 'Company statement',
  reported: 'News report',
  researcher_estimate: 'Researcher estimate',
  modeled: 'Modeled',
  unknown: 'Unknown',
};

/** Display order on facility pages. Water and cooling first. */
export const CLAIM_TYPE_ORDER: ClaimType[] = [
  'water_withdrawal_gpd',
  'water_consumption_gpd',
  'water_source',
  'cooling_type',
  'cooling_water_reuse',
  'power_capacity_mw',
  'electricity_source',
  'grid_upgrade_cost_usd',
  'grid_upgrade_payer',
  'acreage',
  'investment_usd',
  'tax_incentive_usd',
  'jobs_permanent',
  'jobs_construction',
];

export const CLAIM_TYPE_LABELS: Record<ClaimType, string> = {
  water_withdrawal_gpd: 'Water withdrawal',
  water_consumption_gpd: 'Water consumption',
  water_source: 'Water source',
  cooling_type: 'Cooling type',
  cooling_water_reuse: 'Cooling water reuse',
  power_capacity_mw: 'Power capacity',
  electricity_source: 'Electricity source',
  grid_upgrade_cost_usd: 'Grid upgrade cost',
  grid_upgrade_payer: 'Who pays for grid upgrades',
  acreage: 'Site size',
  investment_usd: 'Investment',
  tax_incentive_usd: 'Tax incentives',
  jobs_permanent: 'Permanent jobs',
  jobs_construction: 'Construction jobs',
};

/** One-line explanation shown the first time a term appears on a page. */
export const CLAIM_TYPE_HELP: Partial<Record<ClaimType, string>> = {
  water_withdrawal_gpd: 'Water taken from a well, lake or utility.',
  water_consumption_gpd: 'Water used up, mostly lost to evaporation, and not returned.',
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  announcement: 'Announcement',
  filing: 'Filing',
  hearing: 'Hearing',
  vote: 'Vote',
  permit_issued: 'Permit issued',
  permit_denied: 'Permit denied',
  moratorium: 'Moratorium',
  lawsuit: 'Lawsuit',
  construction_milestone: 'Construction milestone',
  news: 'News',
};
