// Reads all YAML in data/ at build time into typed objects.
// Types mirror docs/SCHEMA.md. Change both together.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

export type Unknown = 'unknown';
/** YYYY-MM-DD. The YAML core schema keeps dates as strings. */
export type DateString = string;

export type FacilityStatus =
  | 'proposal_pending'
  | 'proposed'
  | 'announced'
  | 'under_construction'
  | 'operational'
  | 'on_hold'
  | 'canceled'
  | 'denied';

export type EvidenceType =
  | 'filing'
  | 'government_record'
  | 'company_statement'
  | 'reported'
  | 'researcher_estimate'
  | 'modeled'
  | 'unknown';

export type ClaimType =
  | 'power_capacity_mw'
  | 'water_withdrawal_gpd'
  | 'water_consumption_gpd'
  | 'water_source'
  | 'cooling_type'
  | 'cooling_water_reuse'
  | 'acreage'
  | 'investment_usd'
  | 'jobs_permanent'
  | 'jobs_construction'
  | 'tax_incentive_usd'
  | 'grid_upgrade_cost_usd'
  | 'grid_upgrade_payer'
  | 'electricity_source';

export type EventType =
  | 'announcement'
  | 'filing'
  | 'hearing'
  | 'vote'
  | 'permit_issued'
  | 'permit_denied'
  | 'moratorium'
  | 'lawsuit'
  | 'construction_milestone'
  | 'news';

export type SourceType =
  | 'filing'
  | 'government_record'
  | 'press_release'
  | 'news'
  | 'research'
  | 'database'
  | 'submission';

export interface Docket {
  agency: string;
  number: string;
  url: string;
}

export interface Facility {
  id: string;
  name: string;
  aliases: string[];
  developer: string;
  operator: string | Unknown;
  status: FacilityStatus;
  location: {
    address: string | Unknown;
    city: string;
    county: string;
    lat: number | null;
    lng: number | null;
  };
  jurisdiction: {
    municipality: string;
    agenda_url: string | Unknown;
  };
  utility: {
    electric: string | Unknown;
    water: string | Unknown;
  };
  dockets: Docket[];
  watershed: {
    basin: string | Unknown;
    wri_water_stress: string | Unknown;
  };
  first_seen: DateString;
  last_reviewed: DateString;
  notes: string;
}

export interface Claim {
  id: string;
  claim_type: ClaimType;
  value: number | string | Unknown;
  unit: string | null;
  qualifier: string;
  as_of: DateString | null;
  source: string;
  evidence_type: EvidenceType;
  method: string | null;
  conflicts_with: string[];
  superseded_by: string | null;
  notes: string;
}

export interface ClaimsFile {
  facility: string;
  claims: Claim[];
}

export interface FacilityEvent {
  id: string;
  date: DateString;
  type: EventType;
  title: string;
  body: string;
  outcome: string | null;
  source: string;
  evidence_type: EvidenceType;
}

export interface EventsFile {
  facility: string;
  events: FacilityEvent[];
}

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  type: SourceType;
  published: DateString | null;
  accessed: DateString;
  archived_url: string | null;
  reliability_note: string;
}

export interface SiteData {
  facilities: Facility[];
  /** Claims keyed by facility id. */
  claims: Map<string, Claim[]>;
  /** Events keyed by facility id, oldest first. */
  events: Map<string, FacilityEvent[]>;
  /** Sources keyed by source id. */
  sources: Map<string, Source>;
}

// Astro builds from the project root, so data/ resolves from the working directory.
const DATA_DIR = join(process.cwd(), 'data');

function readDir<T>(name: string): T[] {
  const dir = join(DATA_DIR, name);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /\.ya?ml$/.test(f))
    .sort()
    .map((f) => parse(readFileSync(join(dir, f), 'utf8')) as T)
    .filter((doc) => doc != null);
}

let cache: SiteData | undefined;

export function loadData(): SiteData {
  if (cache) return cache;

  const facilities = readDir<Facility>('facilities').sort((a, b) => a.name.localeCompare(b.name));

  const claims = new Map<string, Claim[]>();
  for (const file of readDir<ClaimsFile>('claims')) {
    claims.set(file.facility, [...(claims.get(file.facility) ?? []), ...(file.claims ?? [])]);
  }

  const events = new Map<string, FacilityEvent[]>();
  for (const file of readDir<EventsFile>('events')) {
    const all = [...(events.get(file.facility) ?? []), ...(file.events ?? [])];
    events.set(file.facility, all.sort((a, b) => a.date.localeCompare(b.date)));
  }

  const sources = new Map<string, Source>();
  for (const source of readDir<Source>('sources')) sources.set(source.id, source);

  cache = { facilities, claims, events, sources };
  return cache;
}
