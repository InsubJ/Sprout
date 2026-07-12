# Sprout Next.js Application — Complete Reconstruction Specification (Source-Audited Revision)

> **Purpose:** This document describes the current Sprout Next.js frontend as a platform-neutral product and UI specification.
> **Style notation:** This revision avoids CSS syntax. Visual rules are written semantically, for example “background colour: `#7b1fa2`,” while preserving exact values and timing.
 It is intended to contain enough architectural, behavioural, and visual information to rebuild the application in React Native, SwiftUI, Flutter, native iOS/Android, another web framework, or another programming language while preserving the same appearance and user experience.
>
> **Source snapshot:** This revised specification is based on direct inspection of the current Sprout Next.js TSX, hooks, SVG definitions, component-scoped styling modules, service connections, state transitions, and interaction timing reviewed on 11 July 2026. Where exact CSS declarations were not available in the reviewed snapshot, the document separates confirmed behaviour from reconstruction guidance. Before deleting the Next.js app, capture reference screenshots at every breakpoint and interaction state.

---

## 1. Product summary

Sprout is a gamified habit tracker in which real-life habits are represented by virtual plants.

The central product loop is:

1. A user signs in.
2. The user creates a habit.
3. Sprout calculates a difficulty tier.
4. A plant species is assigned to the habit.
5. Each completed habit action becomes a watering log.
6. Waterings increase plant growth.
7. Missed actions reduce hydration and may cause withering.
8. Completing the target fully grows the plant.
9. Completed species become discoverable in the botanical laboratory.
10. Users can review reflections, images, streaks, privacy settings, and social interactions.

The visual metaphor is consistently botanical:

- users have a **Nursery**
- habits are **plants**
- creating a habit is **Plant New Seed**
- completions are **waterings**
- consistency is **hydration**
- failed consistency causes **withering**
- completed plants are **fully grown**
- the application lock protects the user's **canopy**
- friends are **buds**
- the collection is a **forest** or **sanctuary**

The product should feel warm, playful, soft, and polished rather than clinical.

---

## 2. Technical architecture

### 2.1 Framework

The current frontend is built with:

- Next.js 14+ App Router
- React
- TypeScript
- component-scoped styling modules
- global design tokens and resets
- Supabase-backed services, with mock/offline implementations where required

The root layout provides:

```text
RootLayout
└── AppProviders
    ├── Navigation
    ├── main page content
    └── Footer
```

The global typeface is **Outfit**, loaded from Google Fonts with weights:

```text
300, 400, 500, 600, 700
```

### 2.2 Separation of concerns

The intended frontend layering is:

```text
src/app/
    route entry points and page composition

src/components/common/
    navigation, footer, modal, dropdowns, providers, reusable controls

src/components/habit/
    habit cards, garden carousel, forms, watering and reflection modals,
    completion celebration, plant rendering

src/components/plants/
    individual SVG plant renderers and plant registry

src/components/social/
    friend, comment and nudge interfaces

src/hooks/
    application state, feature state and subscriptions

src/services/
    authentication, profiles, habits, logs, reflections, storage and
    implementation contexts

src/types/
    domain models and service contracts

src/utils/
    difficulty calculation, species assignment, formatting and pure helpers
```

The major implementation principle is:

> Pages compose features. Components render UI. Hooks coordinate state. Services perform persistence and external operations.

A reconstruction should preserve this division even if it uses another framework.

---

## 3. Application shell

## 3.1 Root layout

Every route renders inside the same root layout:

```text
<html>
└── <body>
    └── AppProviders
        ├── Navigation
        ├── <main class="layout-main">
        │   └── current route
        └── Footer
```

Global metadata:

- Title: `Sprout - Gamified Habit Tracker & Shared Forests`
- Description: `Water your virtual plants by completing real-life habits. Grow beautiful forests together with friends!`

### Reconstruction rules

- The navigation remains visually consistent between pages.
- Main content must reserve enough vertical space for the footer.
- Mobile navigation should become a bottom-tab style interaction.
- Desktop navigation can remain a horizontal top navigation.
- The app uses a single shared design language rather than route-specific themes, except for special feature cards such as the Disco Plant.

---

## 4. Primary routes and feature areas

The application should expose the following major destinations.

| Destination | Purpose |
|---|---|
| Forest / Home | Main habit dashboard and garden |
| Sanctuary | Completed plants and reflective collection experience |
| Buds | Friends, shared plants, nudges and social activity |
| Laboratory | Plant-species collection and growth simulator |
| Profile | User identity, privacy, security and account settings |

The mobile navigation labels are:

```text
Forest
Sanctuary
Buds
Lab
Profile
```

The exact URL structure may differ by implementation. Preserve the information architecture and tab order.

---

# 5. Authentication and application locking

The home route is not one fixed screen. It renders one of three major states:

```text
No authenticated user
    → Login screen

Authenticated user + application locked
    → Lock screen

Authenticated user + unlocked
    → Dashboard
```

This conditional structure is important. Login and lock are not independent routes in the current implementation; they are alternate top-level states of the main page.

---

## 5.1 Login screen

### Content hierarchy

```text
Full-page centred container
└── Login card
    ├── large sprout logo emoji: 🌱
    ├── heading: Welcome to Sprout
    ├── supporting copy
    ├── error message, when present
    ├── Google sign-in control
    └── mock/offline account chooser, when mock mode is active
```

Supporting copy:

> Cultivate your habits, grow a beautiful virtual forest, and connect with your buds.

### Authentication behaviours

The screen supports:

- Google authentication
- provider-based authentication abstraction
- mock/offline profile selection

When the Google Identity SDK is available:

1. Initialise it using the configured client ID.
2. Render Google's official branded button.
3. Decode the returned credential.
4. derive:
   - email
   - display name
   - username
   - avatar
5. create or update a profile when necessary
6. sign the user into Sprout

Fallback behaviour renders a custom button:

```text
🔑 Continue with Google
```

### Mock mode

When mock mode is enabled, show:

```text
Offline Mode — choose a demo profile:
@admin  @alice  @bob  @charlie
```

These should appear as small pill-shaped chips.

### Visual reconstruction

- Full viewport or near-full viewport centred layout.
- Card width should be narrow enough to feel focused: approximately 380–480 px on desktop.
- Card should have:
  - generous padding
  - large rounded corners
  - soft shadow
  - light surface against a warm neutral or botanical background
- Logo is oversized and centred.
- Heading is bold, dark and friendly.
- Subtitle is muted and centred.
- Authentication buttons are full-width or nearly full-width.
- Error text uses a red/coral treatment with adequate contrast.
- Demo chips wrap naturally on small widths.

---

## 5.2 Lock screen

### Content hierarchy

```text
Full-page lock container
└── Lock card
    ├── 🔒
    ├── Sprout Locked
    ├── explanatory text
    ├── validation error
    ├── four-digit PIN form, when PIN is configured
    └── action row
        ├── 🧬 Scan Biometrics, when enabled
        └── 🚪 Sign Out
```

Supporting copy:

> Please authenticate using your configured lock parameters to access your virtual habits canopy.

### PIN behaviour

- PIN accepts digits only.
- Maximum length: 4.
- Submission with fewer or more than four digits shows:
  - `PIN code must be exactly 4 digits`
- Invalid PIN shows:
  - `Invalid PIN code. Please try again.`
- Successful validation unlocks the application.

### Biometric simulation

The web implementation simulates native biometric authentication:

```text
Open biometric overlay
→ show scanning state for about 1.2 seconds
→ show success state
→ wait about 0.6 seconds
→ call unlock operation
→ close overlay on success
```

Overlay states:

| State | Indicator | Text |
|---|---|---|
| Scanning | animated 🧬 | Authenticating... |
| Success | ✔️ | Success! |
| Failure | ❌ | Verification Failed |

Supporting scan text includes:

- `Contacting biometric hardware layer...`
- `Lock validation confirmed.`
- `Failed.`

A mobile rebuild should replace this simulation with real biometric APIs while preserving the same user-facing progression.

### Visual reconstruction

- Similar structural style to login, but more security-oriented.
- PIN field should be centred, short and visually prominent.
- PIN glyph spacing should feel deliberate.
- Action buttons should visually distinguish:
  - primary unlock
  - biometric secondary action
  - destructive or neutral sign out
- Biometric overlay must cover the viewport with:
  - translucent backdrop
  - centred modal
  - animated icon
  - clear state transition

---

# 6. Main dashboard / Forest screen

## 6.1 Responsibilities

The dashboard:

- displays the user's nursery title
- calculates aggregate habit statistics
- shows active habits
- shows a garden carousel
- opens the create-habit flow
- waters habits
- creates watering logs
- accepts notes and images for waterings
- triggers completion checks
- opens a celebration when a habit completes

It connects the following layers:

```text
HomePage
├── useAuth
├── useHabits
├── LogServiceContext
├── HabitServiceContext
├── ProfileServiceContext
├── ReflectionService
├── GardenCarousel
├── HabitCard
├── HabitForm inside Modal
└── CompletionCelebrationModal
```

---

## 6.2 Header

Desktop hierarchy:

```text
Dashboard header
├── title group
│   ├── "{display name}'s Nursery"
│   └── "Grow your virtual forest by maintaining real-life consistency."
└── 🌱 Plant New Seed button
```

The button opens the habit-creation modal.

### Responsive rule

On mobile, the seed button should not remain in the desktop header. The desired mobile sequence is:

```text
Dashboard title
Garden carousel
Plant New Seed button
Stats
Remaining dashboard content
```

This placement is intentional and should be implemented structurally rather than through fragile CSS ordering.

---

## 6.3 Statistics bar

The dashboard computes:

```text
total habits
healthy habits
withered habits
completed habits
```

Visible cards:

| Label | Value colour |
|---|---|
| Total Trees | default text |
| Healthy | forest green, approximately #2d5a27 |
| Withered | muted coral, approximately #c26555 |
| Fully Grown | pale coral/pink, approximately #eaa89b |

### Layout

Desktop:

```text
four equal cards in one horizontal row
```

Mobile:

```text
two-by-two grid or compact four-column row when width permits
```

Each stat card contains:

- large numeric value
- small muted label
- consistent vertical alignment
- light surface, border or subtle separation

---

## 6.4 Garden carousel

The carousel represents active plants as a garden overview.

Responsibilities:

- accepts active, non-completed habits
- displays plant visuals in a horizontally navigable sequence
- acts as a visual summary above the detailed habit cards
- is a key responsive element on mobile

Active habits are defined as:

```text
habit.status !== "completed"
```

### Reconstruction guidance

- Desktop can show several items partially or fully.
- Mobile should use paging or snap behaviour.
- Each item should preserve the assigned plant renderer and growth state.
- The carousel should have predictable spacing and no clipped important controls.
- Hide the browser scrollbar while retaining keyboard and touch accessibility.
- Use dots, arrows or scroll position cues where appropriate, but avoid visual noise.

---

# 7. Habit creation flow

## 7.1 Trigger

The user activates:

```text
🌱 Plant New Seed
```

This opens a shared modal containing `HabitForm`.

## 7.2 Form output

The form produces:

```text
name
description
frequency
target_waterings
wither_threshold
flexible_rules
hide_name
hide_description
share_name_friends
share_desc_friends
```

## 7.3 Creation sequence

```text
submit form
→ calculate difficulty tier
→ assign plant species based on tier
→ create habit through useHabits/addHabit
→ close modal
```

Difficulty input includes:

```text
frequency
wither threshold
target watering count
```

The backend record also receives:

```text
user_id
plant_type
difficulty_tier
```

## 7.4 Visual reconstruction

The form should feel like planting rather than database entry.

Recommended hierarchy:

```text
Modal title
Short explanatory line
Habit name
Description
Frequency
Target watering count
Wither threshold
Flexible-rule controls when relevant
Privacy section
Friend-sharing exceptions
Primary submit
Secondary cancel
```

Form styling:

- rounded inputs
- clear labels above controls
- custom dropdowns rather than unstyled browser selects
- focused border in the brand green
- errors directly beneath the relevant field
- grouped privacy controls in a visually distinct panel
- mobile modal becomes a scrollable sheet or full-height dialog
- maintain keyboard-safe padding on native platforms

---

# 8. HabitCard component

The HabitCard is the core reusable visual unit of Sprout.

## 8.1 Inputs

The card accepts:

```text
name
frequency
status
currentStreak
currentWaterings
targetWaterings
witherThreshold
consecutiveMisses
plantType
difficultyTier
witherCount
onWater
onNudge
isNudged
nudgeLoading
privacy values
viewer identity
habitId
description
poeticSummary
onWaterWithDetails
```

### Validation requirements

The card rejects invalid input:

- habit name cannot be empty
- target waterings must be positive
- current waterings cannot be negative
- wither threshold must be positive
- consecutive misses cannot be negative
- wither count cannot be negative

A rebuild should retain equivalent validation at the domain boundary.

---

## 8.2 Privacy behaviour

A card determines ownership by whether the owner-only watering callback exists.

For non-owners:

- hidden habit name becomes `Private Plant`
- hidden description becomes `Private description`
- explicitly shared friends can still see private fields

Visibility logic:

```text
owner
    → always show

non-owner + field not hidden
    → show

non-owner + hidden + viewer in share list
    → show

non-owner + hidden + viewer not in share list
    → substitute private placeholder
```

---

## 8.3 Card structure

```text
Habit card
├── Header
│   ├── Title section
│   │   ├── habit name
│   │   └── metadata row
│   │       ├── frequency badge
│   │       └── difficulty badge
│   └── status badge
├── Plant visual area
│   ├── PlantRenderer
│   ├── watering control, when owner and not completed
│   ├── watering-limit tooltip
│   └── reflection book button
├── Plant specimen row
├── Hydration indicator
├── Growth progress
└── Footer
    ├── streak
    └── nudge action when applicable
```

---

## 8.4 Header

### Habit name

- prominent but not oversized
- semibold or bold
- wraps gracefully
- privacy replacement uses the same typography

### Frequency labels

Mapping:

| Value | Display |
|---|---|
| twice_daily | Twice Daily |
| daily | Daily |
| weekly | Weekly |
| monthly | Monthly |
| yearly | Yearly |
| flexible | Flexible |

Frequency is displayed in a small pill badge.

### Difficulty badges

Difficulty tiers:

```text
common
uncommon
rare
mythical
```

Each has its own style state and colour treatment.

Recommended reconstruction palette:

| Tier | Colour direction |
|---|---|
| Common | muted leaf green |
| Uncommon | brighter green |
| Rare | pink/magenta |
| Mythical | gold/yellow |

The badge should use:

- tinted background
- saturated text
- rounded pill shape
- lowercase tier label, matching current presentation
- compact padding

### Status badges

| Status | Label | Icon |
|---|---|---|
| healthy | Healthy | 🌱 |
| withered | Withered | 🍂 |
| completed | Completed | 🌸 |

Status badge is aligned to the top-right of the card header and should not overpower the title.

---

## 8.5 Plant visual area

The plant visual is rendered through `PlantRenderer`.

Input:

```text
plantType
currentWaterings
targetWaterings
witherCount
status
size = approximately 185
```

The renderer selects the correct SVG plant component from a registry.

The visual must respond to:

- growth percentage
- habit status
- wither count
- plant species
- completion state

### Plant design rules

- Use scalable vector artwork.
- Keep the plant centred.
- Reserve a consistent visual box so cards align.
- Growth should be visually continuous or staged.
- Withered plants should clearly differ through posture, leaves and colour.
- Completed plants should feel celebratory and mature.
- Avoid stretching SVGs; preserve aspect ratio.

---

## 8.6 Watering control

The watering control is placed over or alongside the plant visual.

It uses a custom watering-can SVG with:

```text
viewBox: 0 0 24 24
no fill
currentColor stroke
stroke width: 2.2
round caps and joins
```

The icon includes:

- can body
- open top/handle area
- spout
- nozzle
- rear handle

### Interaction

If the user can water:

```text
click watering can
→ if detailed watering callback exists, open WaterConfirmModal
→ otherwise call direct onWater callback
```

The card does not show the watering control when:

```text
status === completed
```

### Daily limits

Daily maximum:

```text
twice_daily → 2
all other frequencies → 1
```

The web implementation reads today's logs from `localStorage` under:

```text
sprout_logs
```

When the limit is reached:

- the button is disabled
- hovering the wrapper shows a tooltip
- tapping/clicking the wrapper also shows the tooltip for three seconds
- tooltip text is:

```text
daily watering limit reached
```

A rebuild should move this business rule into the service/domain layer while preserving the visible behaviour.

### Hover and press animation

The watering button should have:

- circular or near-circular hit area
- clear hover state on desktop
- pressed scale or rotation
- consistent icon rotation across normal HabitCard and DiscoHabitCard
- disabled opacity and cursor treatment
- high enough contrast against the plant scene

The normal and Disco buttons should share geometry and motion, while retaining different colour themes.

---

## 8.7 Reflection book control

When `habitId` is available, show:

```text
📖
```

Accessible label:

```text
Open Reflection Book
```

Interaction:

```text
click
→ open ReflectionBookModal
```

Placement:

- inside the plant visual area
- visually secondary to watering
- recognisable as a small floating action

---

## 8.8 Plant specimen row

Content:

```text
Plant Specimen: {formatted plant type}
```

The label is muted and the value is more prominent.

Plant names should be formatted from internal identifiers into natural names.

---

## 8.9 Hydration indicator

Not shown for completed habits.

Structure:

```text
Hydration:
● ● ●
```

Number of dots:

```text
witherThreshold
```

Hydrated dots:

```text
max(0, witherThreshold - consecutiveMisses)
```

Remaining dots are dehydrated.

### Visual rules

Hydrated:

- green/blue-green fill
- possibly mild glow or stronger saturation

Dehydrated:

- warm grey, sand or muted coral
- visually distinct without implying an error alert

Dots should:

- be small circles
- use even gaps
- remain readable at mobile widths
- expose accessible text equivalents

---

## 8.10 Growth progress

Progress:

```text
min(100, round(currentWaterings / targetWaterings × 100))
```

Structure:

```text
Growth Progress                     4 / 10 (40%)
[==================                ]
```

Components:

- section label
- numeric watering count
- percentage
- background rail
- coloured fill

Visual rules:

- rounded rail and fill
- brand green gradient or solid fill
- smooth width transition
- do not animate from zero on every minor rerender
- completed state may use brighter or celebratory styling

---

## 8.11 Footer

### Streak

Structure:

```text
🔥 {currentStreak} streak
```

The flame icon should be visually distinct from the numeric value.

### Nudge

Shown only when:

```text
status === withered
and onNudge exists
```

Behaviour:

- call `onNudge`
- disable when already nudged or while loading
- daily limit: one nudge
- text should communicate whether the nudge is available, already sent or processing

The nudge control belongs to social viewing contexts, not the owner's normal dashboard card.

---

# 9. WaterConfirmModal

The detailed watering modal supports richer check-ins.

Expected flow:

```text
Open from watering control
→ optional note
→ optional image
→ confirm watering
→ create log with note/image
→ close modal
```

The dashboard then:

1. creates the log
2. loads all habit logs
3. checks whether the habit should complete
4. refreshes habits
5. opens completion celebration when status changes to completed

### Data passed to log creation

```text
habit_id
user_id
note, when non-empty
image_url, when supplied
```

### Reconstruction design

- Plant/habit name in the heading.
- Friendly copy, not transactional copy.
- Multiline note input.
- Photo picker with thumbnail preview.
- Clear remove/replace image action.
- Primary action uses watering language.
- Loading state prevents duplicate submissions.
- Error remains inside the modal where possible.
- Mobile presentation should use a bottom sheet or full-screen modal.

---

# 10. ReflectionBookModal

The reflection book is opened from the book button on a HabitCard.

It should present a chronological collection of check-ins associated with the habit.

Each entry may include:

- date/time
- note
- image
- growth milestone
- poetic summary
- status at the time

### Visual concept

The component should feel like a journal or scrapbook rather than an admin log.

Recommended visual hierarchy:

```text
Modal header
Habit title / plant species
Poetic summary, when available
Timeline or journal pages
    date
    note
    photo
Close action
```

Use paper-like surfaces, warm shadows and generous spacing while preserving the main Sprout design language.

---

# 11. CompletionCelebrationModal

Triggered when a watering changes a habit from non-completed to completed.

Input:

```text
habit name
plant type
poetic summary
```

Expected content:

- celebratory plant visual
- completion headline
- habit name
- plant species
- optional poetic summary
- close or continue action

### Visual reconstruction

- Stronger animation than ordinary modals.
- Floral or confetti accents.
- Completed plant at mature state.
- Avoid making the user dismiss several sequential dialogs.
- Respect reduced-motion settings.

---

# 12. DiscoHabitCard

The Disco Plant is a special mythical habit card that intentionally mirrors the normal HabitCard structure.

## 12.1 Component dependencies

```text
DiscoHabitCard
├── useDiscoPlant
├── DiscoPlant
├── DiscoWateringModal
└── DiscoHabitCard.module.css
```

## 12.2 States

| Internal state | Label | Icon |
|---|---|---|
| dancing | Dancing! | 🎉 |
| smiling | Happy | 😄 |
| withered | Wilting | 🍂 |

## 12.3 Structure

```text
Disco card
├── header
│   ├── 🪩 Disco Plant
│   ├── Special badge
│   ├── mythical badge
│   └── state badge
├── plant visual
│   ├── DiscoPlant
│   └── watering can
├── Plant Specimen: Disco Ball
├── Disco Energy progress
└── last-watered information / footer
```

## 12.4 Progress model

The Disco Plant uses a seven-day freshness window.

```text
daysSince = min(7, whole days since last watering)
progress = round((7 - daysSince) / 7 × 100)
```

When never watered:

```text
daysSince = 7
progress = 0
last-watered text = Never watered
```

Otherwise:

```text
Last watered {local date}
```

## 12.5 Styling

The component mirrors the layout, dimensions and interaction geometry of HabitCard but uses a Disco-specific palette:

- purple, indigo or magenta surfaces
- brighter mythical/gold accents
- dark or luminous card background
- dancing/party visual energy
- same watering-can orientation and motion as HabitCard
- same card spacing so it fits naturally within shared grids

This is a themed variant, not an entirely unrelated component.

---

# 13. Botanical Laboratory

The Laboratory is both a species collection and a developer/user growth simulator.

## 13.1 Dependencies

```text
LabPage
├── useAuth
├── HabitServiceContext
├── plantRegistry
├── plant metadata helpers
├── SelectDropdown
└── individual plant renderers
```

## 13.2 State

```text
growthPercent
witherCount
status
completedSpecies
speciesCompletionDates
revealAll
searchTerm
sortBy
controlsOpen
isMobile
currentPage
```

## 13.3 Page structure

```text
Laboratory page
├── title: Botanical Laboratory
├── subtitle describing species count
├── simulation controls
├── search and sort row
├── plant grid
└── pagination
```

Subtitle:

```text
Simulate growth, setbacks, and variants for all {species count} plant species.
```

---

## 13.4 Simulation controls

Desktop:

```text
inline/visible control panel
```

Mobile:

```text
Simulate button
→ backdrop
→ slide-in or bottom drawer
    ├── Simulation Controls
    ├── close button
    └── controls
```

Controls:

### Growth progress

- range from 0 to 100
- displays current percentage
- changes current watering count used by all previews

### Plant status

Buttons:

```text
🌱 Healthy
🍂 Withered
🌸 Completed
```

The active button receives state-specific styling.

### Discovery simulator

Checkbox:

```text
Reveal all species (Admin Mode)
```

---

## 13.5 Discovery model

A species is unlocked when:

```text
revealAll === true
or completedSpecies contains species
```

Completed species are calculated from the user's completed habits.

The page also records the newest completion date for each species.

Unlocked plants always sort before locked plants.

---

## 13.6 Search

Placeholder:

```text
Search species by name or rarity...
```

Search matches:

- formatted species name
- rarity/tier name

Search icon:

```text
🔍
```

---

## 13.7 Sorting

Options:

```text
A-Z Name
Rarity (Mythical to Common)
Newest Discovered
```

Rarity order:

```text
mythical
rare
uncommon
common
```

When values tie, sort alphabetically.

The custom dropdown should match other form controls and avoid native browser inconsistency.

---

## 13.8 Pagination

Page size:

```text
mobile: 4
desktop: 8
```

Controls:

```text
◀ Prev
Page X of Y
Next ▶
```

Buttons disable at the first and final pages.

Search, sorting or viewport page-size changes reset to page 1.

---

## 13.9 Plant cards

Unlocked card:

```text
Card
├── header
│   ├── species name
│   └── rarity badge
├── SVG plant preview
└── details
    ├── Waterings: current / target
    └── Setbacks: wither count
```

Preview target is fixed at:

```text
100 waterings
```

Current waterings:

```text
round(growthPercent / 100 × 100)
```

Plant preview size is approximately:

```text
230
```

### Locked card

```text
❓ Unknown Plant
Locked badge
🔒
Not discovered yet. Grow and complete this species in Sprout to unlock.
```

Locked cards should preserve the same outer dimensions as unlocked cards.

### Tier colours confirmed in the page

```text
common:   #689F38
uncommon: #4CAF50
rare:     #E91E63
mythical: #FFC107
```

Badges use a translucent/tinted background and the tier colour for text.

---

# 14. Plant rendering system

The app uses a `plantRegistry` mapping species identifiers to renderer components.

Each renderer receives a common conceptual interface:

```text
currentWaterings
targetWaterings
witherCount
status
size
```

This makes species interchangeable from the parent component's perspective.

## 14.1 Species metadata

Internal identifiers are converted to human-readable names by:

- splitting underscores
- capitalising words
- handling special names explicitly

Confirmed special labels include:

```text
maranta_leuconeura
→ Prayer Plant (Maranta)

alocasia_tiny_dancer
→ Alocasia Tiny Dancer

phalaenopsis_scarlett_jubilee
→ Orchid Scarlett Jubilee
```

## 14.2 Cross-language rebuilding

In any language/framework, define:

```text
PlantRenderer interface
Plant registry/dictionary
Plant metadata dictionary
Growth-state input
Status-state input
Size input
```

Do not hard-code species selection inside every card.

---

# 15. Services and data flow

## 15.1 Authentication provider

`AppProviders` exposes `useAuth`, including:

```text
currentUser
login
logout
isMockMode
isAppLocked
unlockApp
pinCode
biometricsEnabled
loginWithProvider
googleClientId
```

A rebuild should offer the same conceptual contract regardless of storage implementation.

---

## 15.2 Habit hook

`useHabits(userId)` exposes:

```text
habits
fetchHabits
addHabit
loading
error
```

The dashboard passes the authenticated user's ID. A fixed mock UUID is used when no user exists so hook ordering remains stable.

---

## 15.3 Service contexts

The dashboard consumes:

```text
LogServiceContext
HabitServiceContext
ProfileServiceContext
```

This permits real and mock implementations to be swapped without modifying UI components.

### Watering sequence

```text
create log
→ fetch logs for habit
→ check and complete habit
→ refresh habit list
→ detect transition to completed
→ show celebration
```

### Profile sequence during Google login

```text
derive username
→ find profile
→ create profile in mock mode when missing
→ update avatar when supplied
→ login
```

---

# 16. Styling system

## 16.1 Typography

Primary family:

```text
Outfit, sans-serif
```

Recommended hierarchy:

| Use | Weight | Relative size |
|---|---:|---:|
| Page title | 600–700 | 32–44 px desktop, 27–34 px mobile |
| Card title | 600 | 18–22 px |
| Section title | 600 | 20–28 px |
| Body | 400 | 14–17 px |
| Supporting text | 400 | 13–15 px |
| Badge | 500–600 | 11–13 px |
| Stat value | 600–700 | 26–36 px |
| Button | 500–600 | 14–16 px |

Avoid using the native platform's default font if visual parity is required.

---

## 16.2 Core colour direction

Confirmed and inferred key colours:

```text
brand forest:          #2d5a27
healthy green:         around #2d5a27
withering coral:       #c26555
completed soft coral:  #eaa89b

lab common:            #689F38
lab uncommon:          #4CAF50
lab rare:              #E91E63
lab mythical:          #FFC107
```

Recommended supporting palette for reconstruction:

```text
warm page background:  #faf7f2 to #f7f3eb
primary text:          #1f2b22
secondary text:        #667065
surface:               #ffffff
soft border:           rgba(45, 90, 39, 0.12)
soft green tint:       rgba(45, 90, 39, 0.08)
error:                 #b94f45
disabled:              #a8aea8
```

Where exact CSS differs, prefer screenshots and current CSS source over this recommended palette.

---

## 16.3 Spacing

Use an 8-point-oriented system:

```text
4   micro gap
8   compact gap
12  badge/input inner gap
16  normal component gap
20  card internal section gap
24  standard card padding
32  section gap
40+ page-level gap
```

Cards should not feel dense.

---

## 16.4 Corners

Visual language is soft and rounded.

Recommended radii:

```text
badges/chips: 999 px
small controls: 10–12 px
inputs/buttons: 12–16 px
cards: 18–24 px
large modals: 22–28 px
```

---

## 16.5 Shadows and borders

Use restrained depth:

```text
cards:
0 8px 24px rgba(24, 50, 30, 0.08)

hovered cards:
0 12px 30px rgba(24, 50, 30, 0.12)

modals:
0 20px 60px rgba(0, 0, 0, 0.18)
```

Add a faint border where shadows alone are insufficient.

Do not use harsh black shadows.

---

## 16.6 Buttons

Primary botanical button:

- forest green fill
- white label
- pill or rounded rectangle
- slight lift on hover
- subtle scale/translation on press
- disabled state reduces saturation and elevation

Secondary button:

- pale green or neutral surface
- forest text
- soft border

Destructive or sign-out action:

- restrained red/coral or neutral outline
- should not visually compete with the main action

Icon buttons:

- minimum 40 × 40 px hit target
- circular or rounded-square surface
- tooltip on desktop
- accessible label on every platform

---

## 16.7 component-scoped styling modules

Each complex component owns its own CSS Module, for example:

```text
Dashboard.module.css
HabitCard.module.css
DiscoHabitCard.module.css
LabPage.module.css
```

This means:

- class names are local to components
- visual state is expressed through additional classes
- some dynamic values use inline style, such as progress width and tier colour
- global CSS should remain limited to:
  - variables
  - reset
  - typography
  - root layout
  - general body/background treatment

A non-web rebuild should translate each module into a component-local style definition rather than one global stylesheet.

---

# 17. Responsive behaviour

## 17.1 Primary breakpoint

The Laboratory explicitly treats widths below:

```text
768 px
```

as mobile.

Use 768 px as the default structural breakpoint unless current screenshots prove otherwise.

## 17.2 Mobile changes

- Top navigation becomes bottom navigation.
- Dashboard header action moves below the carousel.
- Grids reduce columns.
- Laboratory controls move into a drawer.
- Laboratory page size becomes four cards.
- Modals become sheets/full-screen dialogs.
- Horizontal plant collections become swipeable.
- Hover-only behaviour gains tap alternatives.
- Card header badges must wrap without overlap.
- Text remains readable without horizontal scrolling.

## 17.3 Desktop changes

- Full top navigation.
- Header actions remain right-aligned.
- Four-card statistics row.
- Wider habit-card grid.
- Laboratory controls remain directly visible.
- Eight laboratory cards per page.
- Hover and focus states become visible.

---

# 18. Animation and interaction rules

Use motion to reinforce the botanical metaphor.

Recommended motion:

- card hover: 150–220 ms
- button press: 80–140 ms
- modal entrance: 180–280 ms
- drawer: 220–320 ms
- progress transition: 300–500 ms
- watering can: small rotation/tilt and rebound
- plant watering: leaf bounce, growth shimmer or droplets
- completion: larger celebratory motion
- biometric scan: repeated pulse/rotation

Motion principles:

- no continuous distracting motion outside Disco Plant
- preserve component layout during animation
- support reduced motion
- animation should never delay data confirmation unnecessarily

---

# 19. Accessibility requirements

Every rebuild should preserve or improve:

- semantic headings
- accessible names for icon-only controls
- keyboard operability
- focus rings
- sufficient colour contrast
- disabled state semantics
- modal focus trapping
- escape/back-button dismissal
- form error association
- screen-reader descriptions for plant status
- non-colour indicators for rarity and health
- 44 px minimum touch target on mobile
- reduced-motion support

Emoji are not sufficient as the only status information. Keep visible text labels.

---

# 20. Platform-neutral component map

A cross-platform implementation can use the following conceptual components:

```text
ApplicationShell
├── Navigation
├── RouteContent
└── Footer

AuthGate
├── LoginScreen
├── LockScreen
└── AuthenticatedApplication

ForestScreen
├── NurseryHeader
├── GardenCarousel
├── PlantSeedButton
├── StatisticsBar
├── HabitGrid
│   ├── HabitCard
│   └── DiscoHabitCard
├── HabitCreationDialog
├── WateringDialog
├── ReflectionBook
└── CompletionCelebration

LaboratoryScreen
├── SimulationControls
├── SpeciesSearch
├── SpeciesSort
├── SpeciesGrid
│   └── SpeciesCard
└── Pagination

Shared
├── PlantRenderer
├── Badge
├── ProgressBar
├── Modal
├── Drawer
├── Dropdown
├── TextInput
├── ImagePicker
├── Toast/Tooltip
└── Empty/Loading/Error states
```

---

# 21. State model

## 21.1 User

```text
id
username
display_name
avatar_url
security preferences
privacy preferences
```

## 21.2 Habit

```text
id
user_id
name
description
frequency
target_waterings
current_waterings
wither_threshold
consecutive_misses
current_streak
wither_count
status
plant_type
difficulty_tier
flexible_rules
privacy flags
friend-sharing exceptions
poetic_summary
completed_at
```

## 21.3 Watering log

```text
id
habit_id
user_id
created_at
note
image_url
```

## 21.4 Statuses

Habit:

```text
healthy
withered
completed
```

Disco Plant:

```text
dancing
smiling
withered
```

Difficulty:

```text
common
uncommon
rare
mythical
```

Frequency:

```text
twice_daily
daily
weekly
monthly
yearly
flexible
```

---

# 22. Reconstruction acceptance checklist

A replacement implementation should not be considered visually complete until all items below are verified.

## Authentication

- [ ] Login screen matches typography, spacing and card proportions.
- [ ] Official/fallback Google control states exist.
- [ ] Mock account chips exist.
- [ ] Error states match.
- [ ] Lock screen and PIN validation match.
- [ ] Biometric state transition matches or is improved natively.

## Dashboard

- [ ] Nursery header matches.
- [ ] Carousel appears above stats.
- [ ] Mobile Plant New Seed button appears below carousel and above stats.
- [ ] All four stat treatments match.
- [ ] Loading, empty and error states exist.

## Habit cards

- [ ] Header geometry matches.
- [ ] Frequency, tier and status badges match.
- [ ] Plant SVG scale and placement match.
- [ ] Watering-can rotation and hover/press interactions match.
- [ ] Watering daily-limit tooltip matches.
- [ ] Reflection-book control matches.
- [ ] Hydration dots match.
- [ ] Progress bar matches.
- [ ] Streak footer matches.
- [ ] Nudge states match.
- [ ] Privacy substitutions match.

## Special card

- [ ] Disco card uses the same geometry as HabitCard.
- [ ] Disco palette and plant animation match.
- [ ] Seven-day energy calculation matches.
- [ ] Watering interaction remains consistent.

## Laboratory

- [ ] Title/subtitle match.
- [ ] Desktop control panel matches.
- [ ] Mobile drawer matches.
- [ ] Search and custom dropdown match.
- [ ] Locked and unlocked cards have identical dimensions.
- [ ] Tier colours match.
- [ ] 4/8 page-size rule matches.
- [ ] Sorting rules match.
- [ ] Pagination states match.

## Modals

- [ ] Habit form matches.
- [ ] Watering note/photo flow matches.
- [ ] Reflection book matches.
- [ ] Completion celebration matches.
- [ ] Keyboard, focus and back behaviour work.

## Responsive

- [ ] 320–375 px phone
- [ ] 390–430 px phone
- [ ] 768 px tablet breakpoint
- [ ] 1024 px tablet/desktop
- [ ] 1280–1440 px desktop
- [ ] large desktop

---

# 23. Required screenshot archive before retiring Next.js

To achieve true near-pixel parity, create a visual archive from the running Next.js app.

Capture each at mobile, tablet and desktop widths:

```text
login
login error
mock login
lock PIN
lock error
biometric scanning
biometric success
empty dashboard
populated dashboard
carousel first/middle/end
habit healthy
habit withered
habit completed
watering hover
watering limit tooltip
watering modal
watering image preview
reflection book
completion celebration
habit form each section
Disco smiling
Disco dancing
Disco withered
Laboratory desktop
Laboratory mobile drawer
Laboratory locked species
Laboratory unlocked species
Laboratory pagination boundaries
navigation active states
profile/security states
buds/social states
sanctuary/completed collection
```

For each screenshot, record:

```text
viewport width and height
browser zoom
OS
font-loading status
test user
test data
interaction state
```

This screenshot set, combined with this behavioural specification, is the reliable basis for rebuilding the app in any language.

---

# 24. Known browser-specific implementation details to replace

The current web implementation includes browser assumptions:

```text
window
document
Google Identity browser SDK
localStorage
browser range input
browser checkbox
browser hover
HTML form submission
DOM modal behaviour
```

Equivalent platform abstractions are required:

| Browser implementation | Cross-platform replacement |
|---|---|
| localStorage | repository/storage interface |
| Google browser SDK | native OAuth/provider SDK |
| hover | hover on web + tap/long-press alternative |
| `<input type="range">` | native slider |
| `<input type="file">` | camera/photo picker |
| HTML form | explicit validation and submit handler |
| DOM modal | native modal/sheet/navigation presentation |
| CSS media query | responsive layout API |
| SVG DOM | native/vector rendering library |

Keep business rules out of the replacement UI components.

---

# 25. Final reconstruction principle

The closest rebuild will come from preserving three layers independently:

## Behavioural parity

- same states
- same calculations
- same limits
- same transitions
- same privacy rules
- same creation and watering flows

## Structural parity

- same information hierarchy
- same component order
- same responsive rearrangement
- same visual grouping
- same navigation model

## Visual parity

- same font
- same colour system
- same spacing rhythm
- same card dimensions
- same radii and shadows
- same SVG artwork
- same motion
- same breakpoints

Do not convert files line by line. Recreate the product contract described above, then compare every state against the screenshot archive.

---

## Source notes

This document was derived from the reviewed Sprout frontend sources, including:

- root Next.js layout and global application composition
- main dashboard/home page
- HabitCard
- DiscoHabitCard
- Botanical Laboratory page
- migration architecture notes that enumerate route and feature areas

The repository remains the source of truth for exact artwork, service interfaces and CSS declarations. This document is the implementation-neutral specification.
---

# 26. Source-audited component and interaction specification

This section supersedes any earlier wording that describes animation or interaction only in general terms. Values here come directly from the reviewed TSX and CSS source.

## 26.1 Audit conventions

Each item is classified as:

- **Exact:** explicitly present in TSX/CSS.
- **Derived:** mathematically calculated from exact source.
- **Structural:** component composition/import relationship confirmed by source.
- **Reconstruction requirement:** behaviour that must be preserved even when the target language has no equivalent DOM or CSS feature.

Do not replace exact values with visually similar defaults without comparing against reference screenshots.

---

# 27. Exact top-level home-page state machine

The home page is a client-rendered state machine.

```text
currentUser is null
    → Login UI

currentUser exists AND isAppLocked is true
    → Lock UI

currentUser exists AND isAppLocked is false
    → Nursery dashboard
```

The page imports and connects:

```text
useAuth
useHabits
HabitCard
GardenCarousel
Modal
HabitForm
CompletionCelebrationModal
LogServiceContext
HabitServiceContext
ProfileServiceContext
ReflectionService
getDifficultyTier
assignSpecies
Dashboard.module.css
```

Although `HabitCard` is imported by the page, the current rendered dashboard delegates habit-card presentation to `GardenCarousel`.

## 27.1 Google SDK readiness

On mount:

1. If `window.google` already exists, `googleSdkReady = true`.
2. Otherwise poll every **500 ms**.
3. Stop polling once the SDK becomes available.
4. Clean up the polling interval when the effect is disposed.

When ready:

```text
google.accounts.id.initialize:
    client_id = configured Google client ID
    callback = credential handler
    use_fedcm_for_prompt = true
```

Official button options:

```text
theme: outline
size: medium
text: continue_with
shape: pill
```

The credential handler:

1. extracts the JWT payload
2. converts URL-safe Base64 characters
3. decodes Unicode-safe JSON
4. reads `email`, `name`, `given_name`, `sub`, and `picture`
5. derives username from the part before `@`, or `google_{sub}`
6. looks up or creates a profile in mock mode
7. updates the avatar when a Google picture exists
8. logs in by username

## 27.2 Authentication screen exact text

```text
Logo: 🌱
Title: Welcome to Sprout
Subtitle:
Cultivate your habits, grow a beautiful virtual forest, and connect with your buds.

Fallback Google button:
🔑 Continue with Google

Offline label:
Offline Mode — choose a demo profile:

Demo accounts:
@admin
@alice
@bob
@charlie
```

## 27.3 Lock screen exact behaviour

PIN:

```text
type: password
max length: 4
placeholder: ••••
auto-focus: true
input filtering: remove every non-digit character
```

Validation:

```text
not exactly four digits
→ PIN code must be exactly 4 digits

incorrect
→ Invalid PIN code. Please try again.

success
→ clear the PIN input
```

Biometric sequence:

```text
trigger
→ show overlay
→ scanning = true
→ success = false
→ clear prior error

after 1200 ms
→ scanning = false
→ success = true

after another 600 ms
→ unlockApp(undefined, true)

unlock success
→ close overlay

unlock failure
→ Simulated biometric authentication failed.
→ success = false
```

Exact visible states:

| Condition | Main label | Supporting label | Icon |
|---|---|---|---|
| Scanning | Authenticating... | Contacting biometric hardware layer... | 🧬 |
| Success | Success! | Lock validation confirmed. | ✔️ |
| Failure | Verification Failed | Failed. | ❌ |

Buttons:

```text
Unlock Canopy
🧬 Scan Biometrics
🚪 Sign Out
Cancel
```

When biometrics are enabled and the locked app mounts, biometric scanning starts automatically.

---

# 28. Exact dashboard flow

## 28.1 Header text

```text
Title:
{display_name or username}'s Nursery

Subtitle:
Grow your virtual forest by maintaining real-life consistency.

Action:
🌱 Plant New Seed
```

## 28.2 Statistics

Calculated by iterating over every habit:

```text
totalHabits = habits.length
healthyCount = status === healthy
witheredCount = status === withered
completedCount = status === completed
```

Exact labels and inline colours:

| Label | Colour |
|---|---|
| Total Trees | inherited |
| Healthy | `#2d5a27` |
| Withered | `#c26555` |
| Fully Grown | `#eaa89b` |

## 28.3 Active-carousel data

```text
activeHabits = habits where status !== completed
```

GardenCarousel receives:

```text
habits
currentViewerId
onWater
onWaterWithDetails
onPlantSeed
```

Loading state:

```text
spinner
Walking into the woods...
```

Error state:

```text
Error: {error}
```

## 28.4 Habit creation

The modal title is:

```text
Plant New Seed
```

On submit:

```text
difficulty tier = getDifficultyTier(
    frequency,
    numeric wither threshold,
    numeric target waterings
)

plant species = assignSpecies(difficulty tier)
```

Creation payload:

```text
user_id
name
description
frequency
target_waterings
wither_threshold
plant_type
difficulty_tier
flexible_rules
hide_name
hide_description
share_name_friends
share_desc_friends
```

On success the modal closes. During the operation `isSubmitting` remains true.

## 28.5 Watering transaction

Simple watering payload:

```text
habit_id
user_id
```

Detailed watering adds:

```text
note, omitted when empty
image_url, omitted when absent
```

After log creation:

```text
load all logs for habit
→ checkAndCompleteHabit(habitId, logs, new ReflectionService())
→ refresh habits
→ detect transition into completed status
→ open CompletionCelebrationModal
```

Watering errors use a browser alert with:

```text
Watering failed
```

Creation errors use:

```text
Failed to create habit
```

---

# 29. HabitCard exact specification

## 29.1 Component defaults

```text
witherThreshold = 3
consecutiveMisses = 0
plantType = Seedling
difficultyTier = common
witherCount = 0
isNudged = false
nudgeLoading = false
hideName = false
hideDescription = false
shareNameFriends = []
shareDescFriends = []
description = null
poeticSummary = null
```

## 29.2 Domain preconditions

The component throws when:

```text
name is empty after trimming
targetWaterings <= 0
currentWaterings < 0
witherThreshold <= 0
consecutiveMisses < 0
witherCount < 0
```

Exact error strings:

```text
Habit name cannot be empty
Target waterings must be a positive integer
Current waterings cannot be negative
Wither threshold must be a positive integer
Consecutive misses cannot be negative
Wither count cannot be negative
```

## 29.3 Owner and privacy determination

Ownership is inferred as:

```text
isOwner = Boolean(onWater)
```

Name hidden:

```text
not owner
AND hideName
AND no viewer ID or viewer ID absent from shareNameFriends
```

Description hidden uses the equivalent rule with `hideDescription` and `shareDescFriends`.

Substitutions:

```text
Private Plant
Private description
```

## 29.4 Frequency labels

```text
twice_daily → Twice Daily
daily       → Daily
weekly      → Weekly
monthly     → Monthly
yearly      → Yearly
flexible    → Flexible
```

## 29.5 Status labels

```text
healthy   → 🌱 Healthy
withered  → 🍂 Withered
completed → 🌸 Completed
```

## 29.6 Progress

```text
progress = min(100, round(currentWaterings / targetWaterings × 100))
```

Visible format:

```text
{currentWaterings} / {targetWaterings} ({progress}%)
```

## 29.7 Hydration dots

Hidden for completed habits.

```text
activeDots = max(0, witherThreshold - consecutiveMisses)
total dots = witherThreshold
dot index < activeDots → hydrated
otherwise → dehydrated
```

Tooltips:

```text
Hydrated day
Missed day
```

## 29.8 Watering limits

Today's logs are read from:

```text
localStorage["sprout_logs"]
```

A log counts when:

```text
log.habit_id === habitId
AND created_at >= local midnight
AND created_at < next local midnight
```

Maximum:

```text
twice_daily → 2
everything else → 1
```

Limit reached:

```text
wateringsToday >= maxPerDay
```

When reached:

- button is disabled
- wrapper receives pointer events because the disabled button has disabled pointer-event handling
- wrapper hover displays the tooltip
- wrapper click displays the tooltip for **3000 ms**
- an existing timeout is cleared before creating a new one
- tooltip text is exactly:
  - `daily watering limit reached`

## 29.9 Watering action

```text
if limit reached
    stop propagation
    do nothing

else if onWaterWithDetails exists
    open WaterConfirmModal

else
    call onWater
```

## 29.10 Reflection control

Shown when `habitId` exists.

```text
visual: 📖
aria-label: Open Reflection Book
title: Reflection Book
```

Click opens `ReflectionBookModal`.

## 29.11 PlantRenderer input

```text
plantType
currentWaterings
targetWaterings
witherCount
status
size = 185
```

## 29.12 Footer

Streak:

```text
🔥 {currentStreak} streak
```

Nudge appears only when:

```text
status === withered
AND onNudge exists
```

Nudge disabled:

```text
isNudged OR nudgeLoading
```

Visible label:

```text
isNudged ? Nudged : Nudge
```

Accessibility/title text explains the one-nudge-per-day limit.

---

# 30. HabitCard exact visual geometry

## 30.1 Card shell

- Background: `the solid card-surface design token`
- Backdrop effect: `blur(16px)`
- Border: `1px solid var(--border-subtle)`
- Corner radius: `20px`
- Inner spacing: `1.5rem`
- Shadow: `0 8px 32px 0 var(--shadow-card-lg)`
- Layout mode: `flex layout`
- Layout direction: `vertical`
- Gap: `1.25rem`
- Width: `100%`
- Maximum width: `100%`
- Positioning: `relative`
- Overflow behaviour: `hidden`

Transition:

- transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)
- box-shadow 0.3s ease

Hover:

- Transformation: a 6 px upward movement
- Shadow: `0 12px 40px 0 var(--shadow-card)`

## 30.2 Header

- Layout mode: `flex layout`
- Main-axis alignment: `space between items`
- Cross-axis alignment: `flex-start`
- Gap: `1rem`

Title section:

- Layout mode: `flex layout`
- Layout direction: `vertical`
- Gap: `0.375rem`

Name:

- Font size: `1.25rem`
- Font weight: `700`
- Line height: `1.2`
- Letter spacing: `-0.01em`
- Text/icon colour: `the primary-text design token`

Metadata row:

- Layout mode: `flex layout`
- Gap: `0.5rem`
- Wrapping: `wrap`

## 30.3 Frequency badge

- Font size: `0.75rem`
- Font weight: `600`
- Inner spacing: `0.15rem 0.6rem`
- Background: `rgba(45, 90, 39, 0.08)`
- Text/icon colour: `the accent-text design token`
- Corner radius: `50px`

## 30.4 Difficulty badges

Common:

- Background: `rgba(140, 160, 145, 0.15)`
- Text/icon colour: `#556B2F`

Uncommon:

- Background: `rgba(234, 168, 155, 0.15)`
- Text/icon colour: `#A0522D`

Rare:

- Background: `rgba(234, 168, 155, 0.3)`
- Text/icon colour: `#C71585`

Mythical:

- background:
- linear-gradient(
- 135deg,
- rgba(255, 215, 0, 0.2),
- rgba(234, 168, 155, 0.3)
- )
- Text/icon colour: `#8B6508`
- Border: `1px solid rgba(255, 215, 0, 0.4)`

Shared:

- Font size: `0.75rem`
- Font weight: `700`
- Inner spacing: `0.15rem 0.6rem`
- Corner radius: `50px`
- Text transformation: `capitalize`

## 30.5 Status badges

Shared:

- Layout mode: `inline-flex`
- Cross-axis alignment: `centred`
- Gap: `0.35rem`
- Font size: `0.75rem`
- Font weight: `700`
- Inner spacing: `0.25rem 0.6rem`
- Corner radius: `50px`

Healthy:

- Background: `rgba(45, 90, 39, 0.12)`
- Text/icon colour: `the accent-text design token`
- Border: `1px solid rgba(45, 90, 39, 0.15)`

Withered:

- Background: `rgba(139, 69, 19, 0.1)`
- Text/icon colour: `#8B4513`
- Border: `1px solid rgba(139, 69, 19, 0.15)`

Completed:

- Background: `rgba(234, 168, 155, 0.2)`
- Text/icon colour: `#B22222`
- Border: `1px solid rgba(234, 168, 155, 0.3)`
- Animation: `shine 2s infinite ease-in-out`

`shine`:

```text
0% and 100% → box-shadow 0 0 0 rgba(234,168,155,0)
50%         → box-shadow 0 0 10px rgba(234,168,155,0.5)
```

## 30.6 Plant visual panel

- Layout mode: `flex layout`
- Main-axis alignment: `centred`
- Cross-axis alignment: `centred`
- Inner spacing: `1rem`
- Background: `the card-background design token`
- Corner radius: `12px`
- Border: `1px dashed rgba(45, 90, 39, 0.1)`
- Minimum height: `200px`
- Positioning: `relative`

Contained SVG:

- Vector rendering: `geometricPrecision`
- Transformation: `translate3d(0, 0, 0)`
- Back-face visibility: `hidden`

## 30.7 Watering button exact appearance

Wrapper:

- Positioning: `absolute`
- Bottom offset: `12px`
- Right offset: `12px`
- Layer order: `20`

Button:

- Background: `the accent-text design token`
- Text/icon colour: `the sand-colour design token`
- Border: `none`
- Corner radius: `50%`
- Width: `42px`
- Height: `42px`
- Layout mode: `flex layout`
- Cross-axis alignment: `centred`
- Main-axis alignment: `centred`
- Shadow: `0 4px 10px rgba(45, 90, 39, 0.25)`

Transition:

- all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)

Hover:

- Background: `the evergreen-colour design token`
- Transformation: `scale(1.12)`
- Shadow: `0 6px 14px rgba(27, 59, 43, 0.35)`

Active:

- Transformation: `scale(0.95)`

Disabled:

- Background: `#d1d5db`
- Text/icon colour: `#9ca3af`
- Pointer behaviour: `not-allowed pointer`
- Shadow: `none`
- Transformation: `none`
- Opacity: `0.65`
- Pointer-event behaviour: `none`

Icon:

- Width: `22px`
- Height: `22px`
- Transformation: a horizontal mirror so the spout faces left

Important: the current hover rule intentionally preserves exactly a horizontal mirror so the spout faces left and applies **no tilt**. The can spout continues to face the plant.

The SVG paths are:

```svg
M7 12h8v5a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3v-5z
M7 12V9a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3
M15 16l5-4
M19 10l2.5 2.5
M7 14a4 4 0 0 1-4-4v0a4 4 0 0 1 4-4h1
```

Stroke:

```text
currentColor
2.2
round line cap
round line join
```

## 30.8 Water-limit tooltip

- Positioning: `absolute`
- Bottom offset: `48px`
- Left offset: `50%`
- Transformation: `translateX(-50%)`
- Background: `rgba(33, 33, 33, 0.95)`
- Text/icon colour: `#fff`
- Inner spacing: `6px 12px`
- Corner radius: `6px`
- Font size: `0.72rem`
- Font weight: `600`
- Text wrapping behaviour: `nowrap`
- Shadow: `0 4px 12px rgba(0,0,0,0.15)`
- Layer order: `100`
- Pointer-event behaviour: `none`

Entrance:

```text
duration: 0.15s
easing: ease-out
from: opacity 0; translate(-50%, 4px)
to:   opacity 1; translate(-50%, 0)
```

Arrow:

```text
5 px drawn triangle
same dark background colour
points downward
```

## 30.9 Reflection-book button

- Positioning: `absolute`
- Bottom offset: `12px`
- Left offset: `12px`
- Background: `the navigation-background design token`
- Backdrop effect: `blur(4px)`
- Text/icon colour: `the primary-text design token`
- Border: `1px solid rgba(45, 90, 39, 0.15)`
- Corner radius: `50%`
- Width: `42px`
- Height: `42px`
- Font size: `1.25rem`
- Shadow: `0 4px 10px rgba(0,0,0,0.05)`
- Layer order: `10`

Transition uses the same spring-like cubic Bézier as the watering button.

Hover:

- Background: `the focused-input background design token`
- Border colour: `the primary-text design token`
- Transformation: `scale(1.12)`
- Shadow: `0 6px 14px rgba(45,90,39,0.15)`

Active:

- Transformation: `scale(0.95)`

## 30.10 Plant-details strip

- Layout mode: `flex layout`
- Main-axis alignment: `space between items`
- Font size: `0.8rem`
- Background: `rgba(250,247,242,0.5)`
- Inner spacing: `0.5rem 0.75rem`
- Corner radius: `8px`
- Border: `1px solid rgba(45,90,39,0.05)`

Dark mode:

- Background: `rgba(15,23,42,0.45)`
- Border colour: `rgba(255,255,255,0.05)`

## 30.11 Hydration dots

Dot:

- Width: `8px`
- Height: `8px`
- Corner radius: `50%`
- transition:
- transform 0.2s ease,
- background-color 0.3s ease

Hover:

- Transformation: `scale(1.3)`

Hydrated:

- Background: `#4A90E2`
- Shadow: `0 0 6px rgba(74,144,226,0.4)`

Dehydrated:

- Background: `#D3D3D3`
- Border: `1px solid rgba(0,0,0,0.08)`

## 30.12 Progress bar

Background:

- Height: `8px`
- Background: `the hover-background design token`
- Corner radius: `4px`
- Overflow behaviour: `hidden`

Fill:

- Height: `100%`
- background:
- linear-gradient(
- 90deg,
- var(--color-forest-green),
- #4CAF50
- )
- Corner radius: `4px`
- Transition: `width 0.5s cubic-bezier(0.4, 0, 0.2, 1)`

## 30.13 Streak animation

Flame:

- Font size: `1.1rem`
- Animation: `pulse 1.5s infinite alternate`

Pulse:

```text
from scale(1)
to   scale(1.15)
```

## 30.14 Nudge button

Normal:

- Background: `#d97706`
- Text/icon colour: `the sand-colour design token`
- Border: `1px solid #d97706`
- Corner radius: `12px`
- Inner spacing: `0.45rem 1rem`
- Font size: `0.85rem`
- Font weight: `700`
- Shadow: `0 4px 12px rgba(217,119,6,0.12)`

Hover:

- Background: `#b45309`
- Border colour: `#b45309`
- Transformation: `translateY(-1px)`
- Shadow: `0 6px 16px rgba(180,83,9,0.18)`

Active:

- Transformation: `translateY(0)`
- Shadow: `0 2px 6px rgba(180,83,9,0.15)`

Disabled:

- Background: `#e5e7eb`
- Border colour: `#d1d5db`
- Text/icon colour: `#9ca3af`
- Pointer behaviour: `not-allowed pointer`
- Shadow: `none`
- Transformation: `none`

---

# 31. DiscoHabitCard exact specification

## 31.1 State calculation

Persistent key:

```text
sprout_disco_plant
```

Stored object:

```json
{
  "lastWateredAt": "ISO timestamp or null"
}
```

State:

```text
no timestamp          → withered
less than 24 hours    → dancing
24 to under 168 hours → smiling
168 hours or more     → withered
```

Watering:

```text
now = new Date().toISOString()
save to localStorage
update React state
```

## 31.2 State metadata

```text
dancing  → 🎉 Dancing!
smiling  → 😄 Happy
withered → 🍂 Wilting
```

## 31.3 Seven-day energy progress

```text
daysSince =
    timestamp exists
    ? min(7, floor(milliseconds since watering / one day))
    : 7

progress =
    round((7 - daysSince) / 7 × 100)
```

Last-watered text:

```text
timestamp exists
→ Last watered {browser-local date}

no timestamp
→ Never watered
```

## 31.4 Component tree

```text
DiscoHabitCard
├── Header
│   ├── 🪩 Disco Plant
│   ├── Special
│   ├── mythical
│   └── state badge
├── Plant visual
│   ├── DiscoPlant(state)
│   └── watering-can button
├── Plant Specimen: Disco Ball
├── Disco Energy progress
├── Last-watered footer
└── DiscoWateringModal, conditionally mounted
```

Clicking the watering button opens the modal. The modal receives:

```text
onWater = waterPlant
onClose = setShowModal(false)
```

---

# 32. Exact Disco Plant drawing

SVG viewport and output size:

```text
viewBox: 0 0 120 160
width: 120
height: 160
```

Wrapper classes:

```text
always: wrapper
state dancing: dancing
state withered: withered
```

## 32.1 Dancing light rays

Present only while dancing.

Eight rays begin at:

```text
x1 = 60
y1 = 55
```

Angles:

```text
0, 45, 90, 135, 180, 225, 270, 315 degrees
```

Endpoint distance:

```text
45 SVG units
```

Stroke sequence uses:

```text
#ff6b9d
#ffd93d
#6bcb77
#4d96ff
#c77dff
```

Ray appearance:

```text
stroke width: 3
round line cap
opacity: 0.85
```

## 32.2 Ball

```text
centre: 60,55
radius: 32
stroke width: 2
```

Normal/dancing fill:

```text
radial gradient
centre bias: 40% 35%
radius: 60%
0%:   #e1bee7
100%: #7b1fa2
```

Normal/dancing stroke:

```text
#b388ff
```

Withered:

```text
fill: #9e9e9e
stroke: #757575
```

Dancing applies an SVG glow filter:

```text
Gaussian blur standard deviation: 3
merge blurred source + original source
```

## 32.3 Mirror tiles

Hidden while withered.

Tile centres:

```text
50,40
62,40
44,52
56,52
68,52
50,64
62,64
56,76
```

Each tile:

```text
8 × 8
corner radius: 1
offset by -4 from centre
```

Dancing tile colours in index order:

```text
#ffffff
#ff6b9d
#ffd93d
#6bcb77
#4d96ff
#c77dff
#ff9f43
#fff
```

Dancing opacity:

```text
0.95
```

Smiling/non-dancing opacity:

```text
0.6
```

Smiling/non-dancing fill:

```text
#ececec
```

## 32.4 Sunglasses

Left lens:

```text
x 37
y 46
width 16
height 10
radius 5
```

Right lens:

```text
x 57
y 46
width 16
height 10
radius 5
```

Bridge:

```text
53,51 to 57,51
stroke width 2
```

Normal:

```text
lens fill: #1a1a2e
bridge: #555
```

Withered:

```text
lens fill: #757575
bridge: #888
```

Normal states include two white glints:

```text
42,49 radius 2 opacity 0.7
62,49 radius 2 opacity 0.7
```

## 32.5 Mouth

Smiling/dancing:

```svg
M48 68 Q60 76 72 68
```

Withered:

```svg
M48 70 Q60 65 72 70
```

Shared:

```text
stroke width: 2.5
fill: none
round line cap
```

## 32.6 String/stem

```text
60,23 to 60,10
stroke width: 2.5
round line cap
```

Normal:

```text
#7e57c2
```

Withered:

```text
#aaa
```

## 32.7 Pot and soil

Pot body path:

```svg
M40 115 L44 95 L76 95 L80 115 Z
```

Normal gradient:

```text
linear, top-left to bottom-right
0%:   #9c27b0
100%: #5c35a8
```

Withered body:

```text
#8d6e63
```

Pot rim:

```text
x 38
y 110
width 44
height 8
radius 4
```

Normal rim:

```text
#7e57c2
```

Withered rim:

```text
#795548
```

Soil:

```text
ellipse centre 60,95
radius x 18
radius y 5
```

Normal soil:

```text
#4a2e1a
```

Withered soil:

```text
#6d4c41
```

## 32.8 Decorative symbols

Dancing only:

```text
⭐ at x15 y30 font-size 14
✨ at x88 y25 font-size 12
💫 at x8  y80 font-size 10
```

Withered only:

```text
😢 at x54 y148 font-size 14
```

---

# 33. Exact meaning of “dancing”

This is the required answer to the previously under-specified animation.

## 33.1 Whole-plant jump and tilt

Applied to the outer wrapper:

- Animation: `discoJump 0.7s ease-in-out infinite alternate`

Keyframes:

```text
from:
    translateY(0)
    rotate(-3deg)

to:
    translateY(-10px)
    rotate(3deg)
```

Therefore one alternate half-cycle lasts 0.7 seconds. A full return cycle is effectively 1.4 seconds.

The whole SVG, including ball, pot, rays and stars, moves together.

## 33.2 Rotating rays

- Transformation origin: `60px 55px`
- Animation: `spinRays 1.2s linear infinite`

Keyframes:

```text
0deg → 360deg
```

No acceleration or deceleration.

## 33.3 Flashing tiles

- Animation: `flashTile 0.6s ease-in-out infinite alternate`

Keyframes:

```text
opacity 1 → opacity 0.3
```

All tiles use the same class and therefore flash in phase.

## 33.4 Twinkling symbols

First star:

```text
origin: 22px 24px
duration: 0.8s
ease-in-out
infinite alternate
```

Second star:

```text
origin: 94px 19px
duration: 1.1s
ease-in-out
infinite alternate-reverse
```

Third star:

```text
origin: 13px 74px
duration: 0.9s
ease-in-out
infinite alternate
```

Shared keyframes:

```text
from:
    opacity 1
    scale 1

to:
    opacity 0.4
    scale 0.7
```

Different durations deliberately keep the sparkles from feeling synchronised.

## 33.5 Withered filter

The entire wrapper receives:

- Visual filter: `grayscale(0.7) brightness(0.75)`

The wrapper filter itself transitions over:

- filter 0.4s ease

## 33.6 Dancing progress animation

When state is dancing, the progress fill becomes:

- linear-gradient(
- 90deg,
- #c77dff,
- #ff6b9d,
- #ffd93d,
- #6bcb77,
- #4d96ff,
- #c77dff
- )
- Background size: `300%`
- Animation: `rainbowSlide 2s linear infinite`

Keyframes:

```text
background-position: 0% center → 300% center
```

## 33.7 Dancing status badge

- Background: `rgba(199,125,255,0.15)`
- Text/icon colour: `#7b1fa2`
- Border: `1px solid rgba(199,125,255,0.3)`
- Animation: `discoShine 1.5s infinite ease-in-out`

Keyframes:

```text
0% and 100%:
    box-shadow: 0 0 0 rgba(199,125,255,0)

50%:
    box-shadow: 0 0 10px rgba(199,125,255,0.5)
```

The complete dancing appearance is therefore the simultaneous combination of:

1. 10 px vertical jump
2. −3° to +3° rocking
3. rotating eight-ray burst
4. flashing coloured mirror tiles
5. three independently timed twinkles
6. ball glow
7. animated rainbow energy bar
8. pulsing state badge

A faithful rebuild must implement all eight layers.

---

# 34. DiscoHabitCard exact styling

## 34.1 Card shell

Geometry matches HabitCard:

```text
20 px radius
1.5 rem padding
1.25 rem vertical gap
same card hover lift: -6 px
same spring-like transform transition
```

Purple substitutions:

- Border: `1px solid rgba(156,39,176,0.3)`
- Shadow: `0 8px 32px rgba(156,39,176,0.12)`
- hover shadow: 0 12px 40px rgba(156,39,176,0.2)

## 34.2 Special badge

- Background: `rgba(156,39,176,0.08)`
- Text/icon colour: `#9c27b0`

## 34.3 Mythical badge

- background:
- linear-gradient(
- 135deg,
- rgba(199,125,255,0.2),
- rgba(156,39,176,0.2)
- )
- Text/icon colour: `#7b1fa2`
- Border: `1px solid rgba(199,125,255,0.4)`

## 34.4 Smiling badge

- Background: `rgba(76,175,80,0.12)`
- Text/icon colour: `#2e7d32`
- Border: `1px solid rgba(76,175,80,0.2)`

## 34.5 Withered badge

- Background: `rgba(139,69,19,0.1)`
- Text/icon colour: `#8B4513`
- Border: `1px solid rgba(139,69,19,0.15)`

## 34.6 Plant panel

Same 200 px minimum height and 12 px radius as HabitCard, but:

- Border: `1px dashed rgba(156,39,176,0.2)`

## 34.7 Watering button

Placement and dimensions match HabitCard:

```text
bottom 12 px
right 12 px
42 × 42 px
circle
```

Colour:

- Background: `#9c27b0`
- Text/icon colour: `white`
- Shadow: `0 4px 10px rgba(156,39,176,0.35)`

Hover:

- Background: `#7b1fa2`
- Transformation: `scale(1.12)`
- Shadow: `0 6px 14px rgba(123,31,162,0.45)`

Active:

- Transformation: `scale(0.95)`

Icon:

- 22 × 22 px
- scaleX(-1)

This is intentionally the same orientation and interaction geometry as the normal HabitCard watering control.

## 34.8 Energy progress

Normal:

- linear-gradient(90deg, #9c27b0, #c77dff)

Dancing:

```text
animated six-stop rainbow described above
```

---

# 35. Reconstruction rules for platform-specific styling features

When rebuilding in React Native, SwiftUI, Flutter or another non-DOM toolkit:

| Current visual behaviour | Required equivalent |
|---|---|
| a 16 px backdrop blur | material/blur view behind card |
| a parent state derived from whether its button is disabled | derive wrapper cursor/state from button-disabled boolean |
| CSS hover | pointer-hover state on web/desktop only |
| disabled button disabled pointer-event handling | route taps to parent wrapper while visually disabled |
| keyframe animations | explicit repeating animation controllers |
| SVG filter merge glow | shadow/glow layer or duplicated blurred vector |
| an alternating animation that begins from the ending state | animation beginning from the terminal keyframe |
| design tokens | central design-token object |
| dark global selector | explicit theme-aware style variants |

Do not remove a visual layer solely because the target toolkit expresses it differently.

---

# 36. Visual verification matrix

For every component, capture and compare:

```text
default
hover
pressed
focused
disabled
loading
error
empty
success
mobile
tablet
desktop
light theme
dark theme, where supported
reduced motion
```

For Disco specifically, compare video rather than still screenshots:

```text
0.0 s
0.3 s
0.6 s
0.7 s
0.9 s
1.1 s
1.2 s
1.4 s
2.0 s
```

The rebuilt animation should preserve independent timing; a single generic bounce animation is not equivalent.

---

# 37. Source-confidence notes

The exact values in Sections 27–35 were audited from:

```text
apps/web/src/app/page.tsx
apps/web/src/components/habit/HabitCard.tsx
apps/web/src/components/habit/HabitCard.module.css
apps/web/src/components/habit/DiscoHabitCard.tsx
apps/web/src/components/habit/DiscoHabitCard.module.css
apps/web/src/components/plants/DiscoPlant.tsx
apps/web/src/components/plants/DiscoPlant.module.css
apps/web/src/hooks/useDiscoPlant.ts
```

The earlier architectural sections remain useful for the broader route and product model. Where an earlier general recommendation conflicts with the exact values in this audited section, use the exact value here.

