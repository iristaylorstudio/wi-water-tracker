# Data schema

Four record types. All live as YAML files in the repo so git is the audit trail.

```
data/
  facilities/   one file per facility        (facility.yaml)
  sources/      one file per source          (source.yaml)
  claims/       one file per facility, many claims each
  events/       one file per facility, many events each
```

Keeping claims and events in separate files from the facility keeps the facility file short and lets the update agent propose changes without touching identity fields.

## Conventions

- IDs are lowercase kebab-case and stable. `mount-pleasant-microsoft`, not `Mount Pleasant (Microsoft)`.
- Dates are `YYYY-MM-DD`. Unknown date is `null`, never a guess.
- Power is in MW. Water is in gallons per day (`gpd`) because that is how Wisconsin filings report it. Store liters only as a computed display value.
- Water withdrawal and water consumption are different claims. Never merge them.
- A missing value is the string `unknown`. It renders on the site. It is a finding.
- Every claim has exactly one source. If two sources disagree, that is two claims and a `conflicts_with` link.

## Evidence types (strongest to weakest)

| Type | Meaning | Examples |
|---|---|---|
| `filing` | Sworn or regulatory record | PSC docket filing, DNR permit application, EIS, rate case testimony |
| `government_record` | Official but not sworn | Council agenda, minutes, staff report, TIF agreement |
| `company_statement` | The developer or operator said it | Press release, company site, quote in an interview |
| `reported` | A news outlet reported it, citing sources | Wisconsin Watch article citing "documents reviewed" |
| `researcher_estimate` | An academic or think tank estimated it | Wisconsin Policy Forum report, university study |
| `modeled` | We calculated it | Only with a `method` field describing the formula and inputs |
| `unknown` | Nobody has said | The default |

## Confidence

Derived, not typed by hand. A claim's confidence is:

- **High**: `filing` or `government_record`, dated within 18 months, no open conflict
- **Medium**: `company_statement` or `reported`, or a `filing` or `government_record` older than 18 months or with no `as_of` date, no open conflict
- **Low**: `researcher_estimate` or `modeled`, or any claim with an open conflict
- **None**: `unknown`

Age is measured from the build date. A claim can move from High to Medium on a later build without any data change.

A conflict is open when a claim and a claim it conflicts with are both current, meaning neither has `superseded_by` set. The link counts in either direction: if A lists B in `conflicts_with`, both A and B have an open conflict.

### Facility water confidence

Water claims are `water_withdrawal_gpd`, `water_consumption_gpd`, `water_source`, `cooling_type` and `cooling_water_reuse`. Superseded claims are ignored.

A facility's water confidence is the weakest confidence among its water claims that have a value. `unknown` claims are left out of this. It is None only when every water claim is `unknown` or there are none. Show it on the map pin. The pin answers "how solid is what we know," not "is anything missing."

Missing water facts are counted separately and shown on the facility page, for example "3 of 5 water facts not disclosed." The count is by claim type. A type is disclosed when at least one current claim of that type has a value. Two conflicting claims of the same type are one fact. A type with no claim at all counts as not disclosed.

## facility.yaml

```yaml
id: string                  # stable kebab-case
name: string                # what locals call it
aliases: [string]           # project code names, developer names
developer: string           # company proposing or building
operator: string | unknown  # who will run it, if different
status: enum                # proposal_pending | proposed | announced | under_construction | operational | on_hold | canceled | denied
location:
  address: string | unknown
  city: string
  county: string
  lat: number | null
  lng: number | null
jurisdiction:
  municipality: string
  agenda_url: string | unknown
utility:
  electric: string | unknown
  water: string | unknown     # municipal utility, private well, Lake Michigan diversion, etc.
dockets:
  - agency: string            # PSC | DNR | county | municipality
    number: string
    url: string
watershed:
  basin: string | unknown
  wri_water_stress: string | unknown   # from WRI Aqueduct, basin level, not facility level
first_seen: date            # when it entered this tracker
last_reviewed: date         # last time a human checked this record
notes: string
```

## claim (inside data/claims/<facility-id>.yaml)

```yaml
facility: string            # facility id
claims:
  - id: string              # <facility>-<claim_type>-<n>
    claim_type: enum        # see list below
    value: number | string | unknown
    unit: string | null     # MW, gpd, acres, USD, jobs, or null for text claims
    qualifier: string       # "at full build-out", "phase 1", "peak", "annual average"
    as_of: date | null      # date the claim was made
    source: string          # source id
    evidence_type: enum     # from the table above
    method: string | null   # required when evidence_type is modeled
    conflicts_with: [string]  # other claim ids
    superseded_by: string | null
    notes: string
```

Claim types for V1:

```
power_capacity_mw
water_withdrawal_gpd
water_consumption_gpd
water_source
cooling_type            # evaporative | air | liquid_closed_loop | hybrid | unknown
cooling_water_reuse     # reclaimed, non-potable, closed loop, unknown
acreage
investment_usd
jobs_permanent
jobs_construction
tax_incentive_usd
grid_upgrade_cost_usd
grid_upgrade_payer      # developer | ratepayers | mixed | unknown
electricity_source      # grid mix | dedicated gas | PPA renewable | unknown
```

Add types as filings reveal them. Do not add a type until a real claim needs it.

## event (inside data/events/<facility-id>.yaml)

```yaml
facility: string
events:
  - id: string
    date: date
    type: enum              # announcement | filing | hearing | vote | permit_issued | permit_denied | moratorium | lawsuit | construction_milestone | news
    title: string
    body: string            # one or two sentences, descriptive
    outcome: string | null  # for votes and hearings
    source: string          # source id
    evidence_type: enum
```

## source.yaml

```yaml
id: string                  # <publisher>-<yyyy-mm-dd>-<slug>
title: string
publisher: string
url: string
type: enum                  # filing | government_record | press_release | news | research | database | submission
published: date | null
accessed: date
archived_url: string | null # Wayback or archive.today snapshot, take one on entry
reliability_note: string    # one line: who they are and what to watch for
```

## Submission (queue table, not in the repo)

```
id, received_at, facility_id | "new", submission_type, url, file_ref, item_date, notes, contact_email, contact_consent, status (new | reviewed | accepted | rejected), reviewer_note
```

An accepted submission becomes a source record plus one or more claims or events. The source record's `type` is `submission` until you verify the underlying document, then it takes the document's type.

## Calculator event (later, not in the repo)

```
ts, task_type, model_class, volume_bucket, approach_viewed, approach_chosen
```

No identifiers. Aggregate before publishing.

## Validation

`scripts/validate.js` should fail the build if:

- any claim's `source` does not match a source id
- any event's `source` does not match a source id
- any claim with `evidence_type: modeled` lacks `method`
- any `conflicts_with` points to a missing claim
- any facility has no `last_reviewed` date
- any value field is empty rather than `unknown`
