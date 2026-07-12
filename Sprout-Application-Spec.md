# Sprout Next.js Application — Reconstruction Specification

> **Purpose:** This document describes the current Sprout Next.js frontend as a platform-neutral product and UI specification. It is intended to contain enough architectural, behavioural, and visual information to rebuild the application in React Native, SwiftUI, Flutter, native iOS/Android, another web framework, or another programming language while preserving the same appearance and user experience.
>
> **Source snapshot:** This specification is based on the current Sprout repository structure and the available frontend source files reviewed on 11 July 2026. Where exact CSS declarations were not available in the reviewed snapshot, the document separates confirmed behaviour from reconstruction guidance. Before deleting the Next.js app, capture reference screenshots at every breakpoint and interaction state.

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
- CSS Modules
- global CSS variables and resets
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

Each has its own CSS class and colour treatment.

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

## 16.7 CSS Modules

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
