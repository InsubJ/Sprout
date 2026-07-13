# Sprout AI Custom Plant Generation — Final Implementation Plan

## 1. Final product decisions

This plan uses the following confirmed requirements:

```text
20 verified rewarded ads = 1 generation credit
USD $5 Stripe support payment = 1 generation credit
Failed generation = generation credit refunded
No maximum custom plant limit
AI suggests the plant name
User edits the name in preview before saving
Custom plants are visible to accepted friends
Mobile implementation first
Provider order:
Groq → OpenRouter → Gemini → DeepSeek → GitHub Models
```

Additional confirmed decisions:

```text
Supabase is the source of truth for ad progress, donations, credits,
generation jobs and generated plants.

The mobile app persists cached reward and plant state locally for offline use.

Google AdMob rewarded ads will be integrated later.

Stripe is the payment provider.

The generated plant is shown in a preview before being saved.

The user presses “Save to Sanctuary” after editing the suggested name.

One generation credit allows up to three repair/provider attempts.

If every configured provider fails, the reserved credit is refunded.

There is no limit on the number of custom plants a user may own.
```

---

# 2. Repository rules that govern implementation

The implementation must follow the repository architecture and coding rules.

## Architecture

Sprout is an npm-workspaces monorepo containing:

```text
apps/mobile
    Primary Expo React Native application for iOS, Android and web

apps/web
    Original Next.js application and behavioural reference

packages/shared
    Framework-independent domain types, schemas and pure business rules

packages/services
    Repository interfaces, Supabase implementations and offline sync

packages/design-tokens
    Shared visual constants

backend/supabase
    Migrations, RLS policies, Storage configuration and Edge Functions
```

The mobile application uses:

```text
Expo SDK 57
React Native
Expo Router
react-native-svg
Supabase
AsyncStorage
SecureStore-backed platform services
```

## Coding requirements

Follow these boundaries:

```text
Route files
    Routing only

Screens and components
    Rendering and visual layout only

Hooks
    State, lifecycle and orchestration

Repositories and services
    Supabase, Storage, Stripe, AdMob and LLM integration

Shared package
    Types, schemas, validation and pure business rules
```

Every file must have one clear responsibility.

Do not call Supabase, Stripe, AdMob or an LLM directly from a screen component.

All untrusted inputs and outputs must be validated at the boundary.

Mock and real repositories must implement the same contracts.

---

# 3. Security correction for API keys

Do not store private LLM or Stripe keys in:

```text
apps/mobile/.env
```

Anything bundled into a mobile app can be extracted.

The mobile environment file should contain only public client configuration.

Example:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

EXPO_PUBLIC_ADMOB_IOS_APP_ID=
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=
EXPO_PUBLIC_ADMOB_IOS_REWARDED_UNIT_ID=
EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_UNIT_ID=
```

Store secret values as Supabase Edge Function secrets:

```text
GROQ_API_KEY
OPENROUTER_API_KEY
GOOGLE_GENERATIVE_AI_API_KEY
DEEPSEEK_API_KEY
GITHUB_MODELS_TOKEN

STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_CUSTOM_PLANT_PRICE_ID

PLANT_LLM_PROVIDER_ORDER
PLANT_LLM_MAX_TOTAL_CALLS
PLANT_LLM_TIMEOUT_MS
```

The mobile application should call authenticated Supabase Edge Functions and must never call hosted LLM providers directly.

---

# 4. Feature overview

The completed user flow will be:

```text
User watches 20 verified rewarded ads
or
User completes a verified USD $5 Stripe support payment

→ Supabase grants 1 custom plant generation credit
→ Credit is cached locally
→ Disco Plant transforms into Plant God
→ Plant God opens the custom plant prompt flow
→ User submits a safe prompt
→ Backend creates a plan and generation checklist
→ LLM provider generates a structured plant specification
→ Deterministic validator checks the specification
→ Invalid output is repaired or passed to the next provider
→ Valid plant is rendered in a preview
→ AI suggests a name
→ User edits the name
→ User presses Save to Sanctuary
→ Plant and original prompt are persisted
→ Credit is consumed
→ Plant God returns to the Disco Plant
```

If all generation attempts fail:

```text
generation job is marked failed
reserved generation credit is refunded
Plant God remains available
user can retry
```

---

# 5. Core technical decision: generate data, not executable code

## Do not generate

The LLM must not generate:

```text
React components
React Native components
TypeScript
JavaScript
CSS
arbitrary SVG markup
import statements
file-system paths
runtime functions
event handlers
external URLs
```

Executing generated application code would create:

```text
arbitrary-code-execution risk
unreliable imports
provider formatting failures
native rendering incompatibility
difficult validation
App Store review risk
difficult long-term migration
```

## Generate a validated plant specification

The LLM returns a strict JSON object:

```text
GeneratedPlantSpec
```

The application renders the specification through a trusted renderer:

```text
GeneratedPlantRenderer
```

The renderer uses only approved Sprout primitives and geometry helpers.

Existing shared geometry families include:

```text
blossom
cactus
dog
humanoid body
Jason
lavender
orchid
pothos
radial bloom
radial leaf
Remy
rose
sakura
spider plant
stalk
sunflower
tree
vine
```

Generated plants should reuse these geometry families whenever possible.

---

# 6. Proposed repository structure

```text
packages/shared/src/
├── types/
│   ├── customPlant.ts
│   ├── generationCredit.ts
│   └── generationJob.ts
├── schemas/
│   ├── customPlantSchema.ts
│   ├── generationRequestSchema.ts
│   └── generationResponseSchema.ts
├── domain/
│   ├── customPlantRarity.ts
│   ├── generationEligibility.ts
│   ├── generationProgress.ts
│   └── generationCreditRules.ts
└── utils/
    └── generatedPlantValidation/
        ├── validateGeometryReferences.ts
        ├── validatePlantBounds.ts
        ├── validatePlantComplexity.ts
        ├── validatePlantPalette.ts
        └── validatePlantAnimations.ts

packages/services/src/
├── repositories/
│   ├── CustomPlantRepository.ts
│   ├── GenerationCreditRepository.ts
│   ├── PlantGenerationRepository.ts
│   ├── RewardedAdRepository.ts
│   └── SupportPaymentRepository.ts
└── supabase/
    ├── SupabaseCustomPlantRepository.ts
    ├── SupabaseGenerationCreditRepository.ts
    ├── SupabasePlantGenerationRepository.ts
    ├── SupabaseRewardedAdRepository.ts
    └── SupabaseSupportPaymentRepository.ts

apps/mobile/src/features/customPlants/
├── components/
│   ├── GeneratedPlantRenderer.tsx
│   ├── GeneratedPlantCard.tsx
│   ├── GenerationPromptSheet.tsx
│   ├── GenerationProgressSheet.tsx
│   ├── GeneratedPlantPreview.tsx
│   └── CustomPlantLogbookEntry.tsx
├── hooks/
│   ├── useCustomPlants.ts
│   ├── useGenerationEligibility.ts
│   └── usePlantGeneration.ts
├── services/
│   └── customPlantCache.ts
└── CustomPlantPreviewScreen.tsx

apps/mobile/src/features/disco/
├── components/
│   ├── DiscoHabitCard.tsx
│   ├── DiscoPlant.tsx
│   ├── PlantGod.tsx
│   ├── RewardProgress.tsx
│   └── RewardChoiceSheet.tsx
└── hooks/
    ├── useDiscoPlant.ts
    └── useRewardProgress.ts

apps/mobile/src/features/sanctuary/
├── SanctuaryScreen.tsx
├── SanctuaryPlantCard.tsx
├── GeneratedPlantCard.tsx
├── SanctuaryFilterChips.tsx
└── SanctuarySortDropdown.tsx

backend/supabase/functions/
├── generate-custom-plant/
│   ├── index.ts
│   ├── generationOrchestrator.ts
│   ├── generationChecklist.ts
│   ├── providerRouter.ts
│   ├── plantSpecValidator.ts
│   └── providers/
│       ├── GroqProvider.ts
│       ├── OpenRouterProvider.ts
│       ├── GeminiProvider.ts
│       ├── DeepSeekProvider.ts
│       └── GitHubModelsProvider.ts
├── verify-admob-reward/
├── create-stripe-checkout/
└── stripe-webhook/
```

---

# 7. Database design

Supabase is the canonical source of truth.

Local persistence is only a cache and offline presentation layer.

## 7.1 `custom_plants`

```text
id                    UUID primary key
user_id               UUID references profiles
display_name          text
original_prompt       text
sanitized_prompt      text
description           text
plant_spec            jsonb
render_version        integer
rarity                text
generation_job_id     UUID
preview_image_url     text nullable
visibility            text
created_at            timestamptz
updated_at            timestamptz
archived_at            timestamptz nullable
```

Rules:

```text
rarity is always custom
owner can read and update own custom plants
accepted friends can read visible custom plants
other users cannot read private custom plants
plant_spec must pass runtime validation before insert
render_version starts at 1
```

There is no maximum number of custom plants.

## 7.2 `plant_generation_jobs`

```text
id
user_id
status
original_prompt
sanitized_prompt
suggested_name
edited_name
current_step
checklist
provider_attempts
active_provider
attempt_count
failure_code
failure_message
generated_spec
custom_plant_id
credit_reservation_id
created_at
started_at
completed_at
updated_at
```

Statuses:

```text
queued
moderating
planning
generating
validating
repairing
preview_ready
saving
completed
failed
cancelled
```

## 7.3 `generation_credit_ledger`

Use an append-only ledger.

```text
id
user_id
event_type
credit_delta
source_event_id
generation_job_id
metadata
created_at
```

Event types:

```text
rewarded_ad_completed
stripe_payment_verified
generation_reserved
generation_consumed
generation_refunded
admin_adjustment
```

Credit balance:

```text
sum of credit_delta for user
```

Examples:

```text
20 verified ads
→ ledger event: +1

verified USD $5 Stripe payment
→ ledger event: +1

generation starts
→ ledger event: -1 reserved

generation succeeds and plant saved
→ reservation finalised

generation fails
→ ledger event: +1 refunded
```

The same ad or payment must not issue credit more than once.

## 7.4 `rewarded_ad_events`

```text
id
user_id
provider
provider_event_id
ad_unit_id
verification_status
reward_amount
created_at
verified_at
credited_at
```

Unique constraint:

```text
provider + provider_event_id
```

## 7.5 `support_payments`

```text
id
user_id
stripe_checkout_session_id
stripe_payment_intent_id
stripe_customer_id
amount_usd_cents
currency
status
created_at
verified_at
credited_at
```

Required amount:

```text
500 USD cents
```

Unique constraints:

```text
stripe_checkout_session_id
stripe_payment_intent_id
```

## 7.6 Logbook integration

Create either:

```text
custom_plant_log_entries
```

or extend the existing reflection/logbook system with a custom plant source type.

First entry:

```text
entry_type: generation
original_prompt
sanitized_prompt
AI suggested name
final user-edited name
generated description
geometry families used
provider sequence summary
generation completion date
```

Never store:

```text
API keys
authorization headers
hidden system prompts
private model reasoning
raw chain-of-thought
```

---

# 8. Offline persistence

Supabase remains authoritative.

Persist these locally:

```text
verified ad progress snapshot
available generation credit count
active generation job summary
generated custom plant specifications
custom plant display metadata
custom plant logbook summary
```

Recommended local keys:

```text
sprout_reward_progress_v1
sprout_generation_credits_v1
sprout_generation_job_v1
sprout_custom_plants_v1
```

Offline behaviour:

```text
existing custom plants remain visible
cached credit count remains visible
Plant God may remain visible when a cached credit exists
prompt may be drafted locally
generation cannot begin offline
rewarded ad cannot begin offline
Stripe payment cannot begin offline
final Save to Sanctuary requires network confirmation
```

Message:

```text
Connect to the internet to create your custom plant.
```

Do not queue an LLM generation in the normal offline mutation queue.

Generation has its own persisted server job.

---

# 9. Generated plant specification

## 9.1 Top-level format

```json
{
  "schemaVersion": 1,
  "displayName": "Moonlit Tea Blossom",
  "description": "A flowering plant inspired by moonlight and tea leaves.",
  "rarity": "custom",
  "canvas": {
    "viewBoxWidth": 400,
    "viewBoxHeight": 400
  },
  "palette": {
    "primary": "#6E5AA8",
    "secondary": "#A8D5BA",
    "accent": "#F5DF8C",
    "stem": "#466B4A",
    "pot": "#8B6F47"
  },
  "base": {
    "potStyle": "classic",
    "groundShadow": true
  },
  "layers": [],
  "stateVariants": {
    "healthy": {},
    "withered": {},
    "completed": {}
  },
  "animation": {
    "idle": "gentle_sway",
    "completed": "soft_glimmer",
    "withered": "droop"
  },
  "generationMetadata": {
    "promptSummary": "Moonlit tea-flower plant",
    "reusedGeometryFamilies": [
      "stalk",
      "radial_bloom",
      "radial_leaf"
    ]
  }
}
```

## 9.2 Allowed layer types

```text
tree
stalk
vine
radial_bloom
blossom_cluster
radial_leaf
pothos_leaf
cactus_arm
orchid_bloom
rose_bloom
sakura_cluster
sunflower_head
spider_leaf
decorative_shape
face
accessory
```

## 9.3 Example layer

```json
{
  "type": "radial_bloom",
  "geometry": "sunflower",
  "anchor": {
    "x": 200,
    "y": 125
  },
  "scale": 0.8,
  "rotation": 0,
  "petalCount": 12,
  "fill": "#F5DF8C",
  "stroke": "#6E5AA8",
  "zIndex": 30
}
```

## 9.4 Version 1 constraints

```text
canvas fixed at 400 × 400
maximum 40 layers
maximum 120 rendered primitive shapes
maximum 8 colours
only hexadecimal colours or approved design tokens
all anchors inside safe canvas bounds
scale within approved limits
rotation between -180 and 180
no arbitrary SVG path strings
no scripts
no functions
no URLs
no event handlers
no external assets
no unsupported animation names
no unknown JSON properties
```

Version 1 should prioritise existing geometry helpers.

---

# 10. Prompt moderation

The user prompt must not contain sexual or explicit content.

Use two layers:

```text
deterministic pattern and term screening
provider moderation or moderation model where available
```

Reject:

```text
sexual or explicit content
sexual content involving minors
real-person sexualisation
extreme graphic violence
hate symbols or glorification
self-harm encouragement
personal data extraction
malicious executable instructions
direct copyrighted-character reproduction
```

Allow harmless fantasy, colour, animal, botanical and decorative inspiration.

Store:

```text
original_prompt
sanitized_prompt
moderation outcome category
```

Do not store unnecessary sensitive moderation analysis.

---

# 11. LLM provider architecture

## 11.1 Provider order

```text
Groq
OpenRouter
Gemini
DeepSeek
GitHub Models
```

GitHub Models will be added later through the same provider contract.

## 11.2 Provider interface

```text
PlantGenerationProvider

id
isConfigured()
createPlan()
generateSpecification()
repairSpecification()
classifyFailure()
```

Each provider adapter must return the same internal response.

## 11.3 Environment configuration

```text
PLANT_LLM_PROVIDER_ORDER=
groq,openrouter,gemini,deepseek,github

PLANT_LLM_MAX_TOTAL_CALLS=10
PLANT_LLM_TIMEOUT_MS=30000
```

## 11.4 Failover conditions

Move to the next provider when:

```text
HTTP 429
quota exhausted
model unavailable
provider unavailable
HTTP 500–599
timeout
context length failure
malformed response after repair attempt
```

Do not fail over when:

```text
prompt rejected by moderation
user is unauthenticated
credit is unavailable
job was cancelled
database authorization failed
```

## 11.5 Attempt policy

Confirmed product rule:

```text
one credit permits up to three repair/provider attempts
```

Implementation interpretation:

```text
maximum three failed generation or repair cycles before refund
```

Recommended hard safeguards:

```text
maximum five providers considered
maximum ten total API calls
maximum thirty seconds per call
maximum four minutes per generation job
one active generation job per user
```

## 11.6 Circuit breaker

Track:

```text
recent successes
recent 429 errors
recent timeouts
recent server errors
average latency
disabled-until time
```

Temporarily skip unhealthy providers.

---

# 12. Generation orchestration

## Step 1: Authenticate and check eligibility

Verify:

```text
authenticated user
available generation credit
no active generation job
```

There is no custom plant ownership limit.

Reserve one credit.

## Step 2: Moderate prompt

Reject prohibited content.

## Step 3: Normalise prompt

Extract:

```text
subject
shape inspiration
palette
mood
accessories
motion
requested name
```

## Step 4: Create plan

The planning response should define:

```text
main silhouette
pot style
structural geometry
leaf geometry
flower geometry
decorative layers
palette
healthy variant
withered variant
completed variant
animation presets
```

## Step 5: Create checklist

```text
prompt concept represented
stable plant base included
primary silhouette readable
existing geometry reused where possible
healthy state supported
withered state supported
completed state supported
palette valid
coordinates within bounds
complexity limits respected
no prohibited content
small-card readability maintained
```

## Step 6: Generate specification

Return strict JSON only.

## Step 7: Deterministic validation

Validate:

```text
schema
unknown fields
geometry references
coordinate bounds
layer count
primitive count
palette count
animation names
state variants
string lengths
```

## Step 8: Repair

When validation fails, send only:

```text
current specification
failed checklist entries
allowed geometry catalogue
output schema
```

Do not regenerate valid sections unnecessarily.

## Step 9: Provider failover

If provider is unavailable or repeatedly invalid, pass the current plan and valid partial specification to the next provider.

## Step 10: Preview

Render through:

```text
GeneratedPlantRenderer
```

Show:

```text
plant preview
AI-suggested name
editable name field
description
original prompt summary
Save to Sanctuary
Regenerate
Cancel
```

## Step 11: Save

After the user presses Save to Sanctuary:

```text
validate edited name
persist custom plant
persist generation logbook entry
mark generation job complete
consume reserved credit
refresh Sanctuary
return Plant God to Disco Plant
```

## Step 12: Failure

When all attempts fail:

```text
mark job failed
refund generation credit
retain prompt
show retry option
keep Plant God active
```

---

# 13. Plant God design

## 13.1 Separate states

Do not replace the current Disco freshness state.

Use:

```text
DiscoFreshnessState:
dancing
smiling
withered
```

Add:

```text
DiscoRewardState:
earning
plant_god_ready
generating
preview_ready
generation_failed
```

## 13.2 Transformation condition

Plant God appears when:

```text
available generation credits >= 1
or
a custom plant generation job is active
or
a completed preview is waiting for user confirmation
```

## 13.3 Plant God appearance

Plant God is:

```text
a dancing sun
wearing sunglasses
with a smiling face
golden rotating rays
small sparkle accents
gentle vertical bounce
slight side-to-side rotation
```

Reuse visual motion from the Disco Plant where suitable:

```text
bounce
rotating rays
glow
sparkles
animated progress
```

## 13.4 Plant God interaction

Pressing Plant God opens the generation prompt sheet.

While generating:

```text
Plant God remains visible
generation progress replaces normal interaction
```

After successful save:

```text
Plant God returns to Disco Plant
```

After failed generation:

```text
Plant God remains available
credit is refunded
retry is shown
```

---

# 14. Reward progress

The Disco Plant card should display two reward-related progress areas.

## 14.1 Ad progress

Label:

```text
Plant God Awakening
```

Display:

```text
{verified ads watched} / 20 ads
```

At completion:

```text
Plant God Awakened
```

The count must come from Supabase.

## 14.2 Generation credit progress

Label:

```text
Custom Plant Credit
```

Display examples:

```text
Ads: 14 / 20
Support payment: Not completed
```

When either path completes:

```text
1 custom plant credit ready
```

If the user owns several credits:

```text
{credit count} custom plant credits ready
```

## 14.3 Reward choice sheet

Actions:

```text
Watch Rewarded Ad
Support Sprout — USD $5
View Reward History
```

The ad action is disabled when:

```text
offline
ad unavailable
ad loading
reward callback pending verification
```

---

# 15. Google AdMob plan

AdMob is not yet integrated.

Implement mobile first.

## Client flow

```text
load rewarded ad
show rewarded ad
receive client completion callback
submit reward verification request
refresh Supabase reward progress
```

## Server integrity

Do not grant credit only from a client callback.

Use server-side verification where supported.

Record:

```text
provider event ID
user ID
ad unit ID
reward amount
server timestamp
verification status
```

Anti-abuse:

```text
unique event ID
authenticated user
duplicate rejection
minimum interval between accepted rewards
daily safety limit if needed
no reward for abandoned ads
test unit IDs in development
```

The twentieth verified ad issues one credit and resets progress for the next set of twenty through ledger arithmetic.

---

# 16. Stripe plan

## Payment amount

```text
USD $5
```

## Recommended user-facing wording

```text
Support Sprout — USD $5
```

The payment grants:

```text
one custom plant generation credit
```

## Flow

```text
mobile app requests Stripe Checkout session
Edge Function creates session
user completes Stripe Checkout
Stripe webhook verifies payment
support_payments record is created or updated
generation credit ledger receives +1
mobile app refreshes credit balance
```

Do not grant credit from the client redirect alone.

Required Stripe values:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_CUSTOM_PLANT_PRICE_ID
```

Payment verification must check:

```text
successful status
USD currency
500-cent amount or matching Price ID
unique payment intent
user identity metadata
not previously credited
```

---

# 17. Sanctuary changes

The current Sanctuary renders completed habit plants through `GardenCarousel`.

Expand the data source to include:

```text
classic plants:
completed habits

custom plants:
AI-generated custom plant records
```

Normalise them into:

```text
SanctuaryItem =
  ClassicSanctuaryItem
  | CustomSanctuaryItem
```

## Search

Reuse the existing shared `SearchField`.

Search fields:

```text
classic habit name
classic species name
custom display name
custom description
original custom prompt
```

## Filters

Reuse the Forest filter-chip pattern.

Options:

```text
All
Classic
Custom
```

## Sorting

Generalise and reuse the Lab sort modal.

Sanctuary options:

```text
Rarity
A–Z
Z–A
```

Rarity rank:

```text
custom
mythical
rare
uncommon
common
```

Tie-breaker:

```text
alphabetical display name
```

## Carousel

Continue using the generic `GardenCarousel`.

Do not create another carousel implementation.

---

# 18. Custom Sanctuary card

Create:

```text
GeneratedPlantCard
```

Display:

```text
Custom rarity badge
editable final plant name
GeneratedPlantRenderer
creation date
prompt excerpt
Open Logbook
```

Custom rarity is for Sanctuary sorting only.

Do not add `custom` to the normal habit difficulty calculation.

Keep separate concepts:

```text
HabitDifficultyTier
SanctuaryRarity
```

---

# 19. Logbook behaviour

The original user prompt must be visible.

Custom plant generation entry:

```text
Created by Plant God
Original prompt
AI-suggested name
Final edited name
Creation date
Generated description
Geometry families used
Provider sequence summary
```

Acceptable provider summary:

```text
Groq: rate limited
OpenRouter: invalid schema
Gemini: valid plant generated
```

Do not show:

```text
hidden system instructions
private provider reasoning
API secrets
authorization data
```

---

# 20. Friend visibility

Custom plants are visible to accepted friends.

Use existing friendship relationships and Sanctuary visibility rules.

Accepted friends may:

```text
view custom plant card
view permitted logbook data
view original prompt if Sanctuary privacy allows it
```

Users who are not accepted friends may not read custom plant records unless a future public setting is added.

Add RLS policies rather than relying only on client filtering.

---

# 21. Implementation phases

## Phase 1: Audit current Disco reward code

- inspect current Disco Plant ad/donation UI
- identify existing local fields
- identify missing Supabase fields
- preserve existing visuals
- replace local-only progress with repository-backed state
- add offline cache

## Phase 2: Shared contracts

- add generated plant types
- add generation job types
- add credit ledger types
- add strict Zod schemas
- add reward calculation rules
- add rarity sorting rules
- add provider failure classifications

## Phase 3: Database and RLS

- create `custom_plants`
- create `plant_generation_jobs`
- create `generation_credit_ledger`
- create `rewarded_ad_events`
- create `support_payments`
- create or extend custom logbook storage
- add indexes and uniqueness constraints
- add RLS
- add database contract tests

## Phase 4: Repository layer

- add repository interfaces
- add Supabase implementations
- add demo implementations
- connect through `ServicesProvider`
- add local cache services

## Phase 5: Generated plant renderer

- create geometry capability catalogue
- define allowed parameter ranges
- create `GeneratedPlantRenderer`
- implement healthy, withered and completed states
- add bounds checks
- add complexity checks
- add renderer tests

## Phase 6: Generation Edge Function

- create authenticated function
- add provider interface
- add Groq
- add OpenRouter
- add Gemini
- add DeepSeek
- leave GitHub Models adapter ready for later
- add provider routing
- add circuit breaker
- add moderation
- add checklist loop
- add deterministic validation
- add repair and failover
- persist job progress

## Phase 7: Plant God UI

- add reward-state hook
- add Plant God renderer
- add two reward progress displays
- add prompt sheet
- add generation progress
- add failure and retry states
- add preview
- add editable name
- add Save to Sanctuary
- restore Disco Plant after save

## Phase 8: Sanctuary

- load custom plants
- merge classic and custom records
- reuse `SearchField`
- reuse Forest filter chips
- generalise Lab sort dropdown
- add custom-first rarity sorting
- render custom plants through `GardenCarousel`
- add custom logbook content

## Phase 9: Stripe

- create Checkout session Edge Function
- create webhook
- verify USD $5 payment
- prevent duplicate credits
- refresh mobile reward state
- add test-mode flow

## Phase 10: AdMob

- configure test app IDs
- configure rewarded units
- add client rewarded-ad service
- add server verification
- persist verified events
- issue one credit per twenty ads
- add duplicate and abuse tests

## Phase 11: Reliability and testing

- simulate every provider failure type
- verify failover order
- verify three-attempt refund rule
- verify no duplicate credit consumption
- verify preview does not consume credit
- verify save consumes reserved credit
- verify offline cache
- verify friend visibility
- verify all Sanctuary filtering and sorting
- verify Plant God reset

---

# 22. Required credentials and IDs

Implementation can begin with mocked values, but production requires:

## LLM

```text
GROQ_API_KEY
OPENROUTER_API_KEY
GOOGLE_GENERATIVE_AI_API_KEY
DEEPSEEK_API_KEY
GITHUB_MODELS_TOKEN later
```

## Stripe

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_CUSTOM_PLANT_PRICE_ID
```

## AdMob

```text
iOS AdMob app ID
Android AdMob app ID
iOS rewarded-ad unit ID
Android rewarded-ad unit ID
```

## Supabase

```text
project URL
publishable key for mobile
migration access
Edge Function deployment access
secret-management access
```

---

# 23. Feature flags

Add:

```text
customPlantsEnabled
plantGodEnabled
rewardedAdsEnabled
stripeSupportEnabled
providerGenerationEnabled
githubModelsEnabled
```

Recommended rollout:

```text
1. Admin-issued generation credits
2. Generated renderer and preview
3. Sanctuary integration
4. Groq only
5. Multi-provider failover
6. Stripe test mode
7. AdMob test units
8. Production Stripe
9. Production AdMob
10. GitHub Models
```

---

# 24. Testing checklist

## Credit system

- 19 ads do not grant a credit
- 20 verified ads grant one credit
- duplicate ad event does not count twice
- 40 verified ads grant two credits
- verified USD $5 payment grants one credit
- duplicate Stripe payment does not grant twice
- failed generation refunds the reserved credit
- successful saved plant consumes exactly one credit
- cancelling before generation releases the reservation
- preview alone does not consume the credit

## Generation

- valid Groq result succeeds
- Groq limit switches to OpenRouter
- OpenRouter failure switches to Gemini
- Gemini failure switches to DeepSeek
- malformed JSON is repaired
- invalid geometry is repaired
- third failed attempt refunds credit
- request ID is idempotent
- user cannot start two jobs simultaneously

## Moderation

- harmless prompt accepted
- sexual prompt rejected
- obfuscated explicit prompt rejected
- malicious code request rejected
- direct copyrighted-character copy rejected or transformed

## Renderer

- all allowed geometry types render
- unknown geometry rejected
- coordinates outside bounds rejected
- excessive layers rejected
- excessive colours rejected
- custom plant readable in carousel card
- healthy, withered and completed variants work
- dark and light themes work

## Plant God

- appears when credit exists
- remains while generating
- remains on failed generation
- remains while preview is awaiting save
- returns to Disco Plant after successful save
- offline state shows a clear disabled message

## Sanctuary

- All filter works
- Classic filter works
- Custom filter works
- Rarity places custom before mythical
- A–Z works
- Z–A works
- prompt is searchable
- original prompt appears in logbook
- accepted friends can view permitted plants
- non-friends cannot read protected custom plants

---

# 25. Definition of done

The feature is complete when:

1. Reward progress is stored in Supabase.
2. Reward progress and custom plants are cached locally.
3. Twenty verified AdMob rewards grant one generation credit.
4. One verified USD $5 Stripe payment grants one generation credit.
5. Credits cannot be duplicated from repeated events.
6. Disco transforms into Plant God when a credit is available.
7. Plant God accepts a moderated prompt.
8. The backend creates a plan and checklist.
9. Providers are called in the confirmed order.
10. Provider quota and availability failures trigger automatic failover.
11. Generation is bounded to the configured attempt limit.
12. Failed generation refunds the credit.
13. LLM output is structured JSON, never executable code.
14. The output passes deterministic validation.
15. The plant is shown in preview.
16. The AI suggests a name.
17. The user can edit the name.
18. The plant is saved only after Save to Sanctuary is pressed.
19. Successful saving consumes one credit.
20. Plant God returns to Disco Plant after saving.
21. Custom plants appear in Sanctuary.
22. Custom plants are visible to accepted friends.
23. Sanctuary supports All, Classic and Custom filters.
24. Sanctuary supports Rarity, A–Z and Z–A sorting.
25. Custom plants sort ahead of mythical plants.
26. The original prompt appears in the logbook.
27. There is no custom plant ownership limit.
28. Secret API keys remain server-side.
