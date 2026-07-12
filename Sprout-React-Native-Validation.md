# Sprout React Native Validation Ledger

## Validation sources

This ledger tracks implementation against both authoritative references:

- `Sprout-a-detailed-guide.md` for source-audited structure, visual geometry, copy, calculations, and animation timing.
- `Sprout-Web-to-React-Native-Parity-Reference.md` for native feature parity, privacy, offline, accessibility, and platform adaptation.

Build success alone does not mark a feature complete. A row is complete only after behavior, meaningful visuals, dark mode, accessibility, and relevant interaction states have been exercised.

## Current audit

| Area | Status | Evidence | Remaining validation |
|---|---|---|---|
| Application shell | Partial | Expo Router and five native tabs exist | Responsive Expo web shell and final tab accessibility review |
| Authentication | Substantial | Session restoration, email auth, Google/Apple OAuth, four demo accounts and rendered 460px focused card matching the guide hierarchy | OAuth device run |
| App lock | Partial | Secure PIN and real device biometrics | Scanning/success progression and physical-device cancellation checks |
| Forest hierarchy | Substantial | Heading, filters, shared centered carousel, arrow affordances, seed action, stats and distinct loading/empty/error states | Physical-device gesture pass |
| HabitCard | Substantial | Source SVG watering can, animated progress/streak, exact limit tooltip, reflection hover/press, privacy/nudge states and equal responsive Habit/Disco geometry (288×620 at 320px; capped at 326×620) | Complete device screenshot matrix |
| Habit creation | Substantial | Guide-order fields, all frequencies, flexible rules, grouped privacy/friend exceptions, focused borders, field-specific errors and scroll-to-first-error | Final native keyboard/device pass |
| Watering | Substantial | Note, camera/library, Android pending-picker recovery, compression, guarded upload, offline queue, idempotency and exact 3-second limit tooltip | Physical camera/library retry testing |
| Completion | Substantial | Confetti, trophy, real mature plant, Sanctuary navigation | Device motion and one-shot transition test |
| Sanctuary | Substantial | Cache-first loading, shared centered GardenCarousel, completed species, reflections, reactions/comments and visitor privacy | Physical-device gesture pass |
| Buds | Substantial | Search, requests, responses and one Visit garden entry; Forest/Sanctuary choices live inside the friend visit, with plant-level nudges only in Forest and direct return to Buds | Device QA |
| Laboratory | Substantial | Catalogue, discovery, simulator, custom sort dropdown, exact rarity sorting, responsive equal-height grid, 4/8 pagination and verified mobile drawer | Final reference screenshot comparison |
| Plant registry | Substantial | Twenty one-to-one native SVG ports using shared geometry | Species screenshot matrix for growth, wither and final variants |
| Disco Plant | Substantial | Persistent state, native layered animation, animated rainbow energy rail/status shine, and the same 326×620 shell, 24px padding, 20px gaps and 200px scene as HabitCard; browser dimensions measured | Final source-timing screenshot/video comparison |
| Profile | Substantial | Identity, avatar media, theme, security, reminders and logout | Device camera and persisted feedback checks |
| Dark mode | Substantial | Persisted theme provider, major surfaces and corrected header/badge/stat contrast in rendered dark flows | Physical-device contrast audit |
| Wrapped | Partial | Native yearly summary and share sheet | Compare complete source story and metrics |
| Offline/sync | Substantial | Cache, queue, reconnection, pending count and operation IDs | Offline image retry integration test |
| Accessibility | Substantial | Named tabs without duplicated icon speech, selected frequency/sort semantics, progress values, focus borders, reduced-motion animation guards and 44px targets | Native large-text, modal and screen-reader matrix |
| Platform verification | Partial | Typecheck, tests, Expo Doctor, rendered Expo web flows and fresh Android/iOS/web exports | Physical iOS and Android acceptance runs |

## Release blockers

1. Disco card motion and energy presentation still require final source-timing comparison.
2. No physical-device acceptance run is recorded for iOS or Android.
3. The required screenshot and video comparison archive is incomplete.

## Native acceptance environment

The current Windows workspace has no `adb` executable, no Android emulator command or configured AVD, and cannot provide an iOS simulator. Consequently, camera permission/recreation, Face ID or Android biometric cancellation, native screen-reader/large-text behavior, and physical-device screenshots cannot be truthfully recorded here. Android, iOS and web production bundles do export successfully; this does not substitute for the device acceptance matrix.

## Required visual matrix

Capture light, dark and reduced-motion states where applicable at phone, tablet and Expo web widths. Include authentication, lock states, Forest states, all HabitCard states, watering and image flows, completion, Sanctuary/reflections, Buds/friend views, Lab states, Profile/security, Wrapped, and Disco at the timestamps specified by the detailed guide.

## Top-to-bottom detailed-guide audit

| Guide section | Result | Native implementation/adaptation |
|---|---|---|
| 1 Product summary | Matched | Sign-in → seed → difficulty/species → watering → wither/complete → Lab/Sanctuary loop retained |
| 2 Architecture | Matched | Routes, rendering components, hooks/providers, repositories and pure shared domain/geometry remain separated |
| 3 Application shell | Matched natively | Expo Router root providers and persistent five-tab shell replace DOM navigation/footer |
| 4 Primary routes | Matched | Forest, Sanctuary, Buds, Lab and Profile retain documented order |
| 5 Authentication/locking | Matched; device check pending | Exact login copy, four demo chips, email/OAuth, exact PIN errors, real biometrics, automatic scan progression and sign-out |
| 6 Forest | Matched | Identity Nursery heading, carousel above seed action/stats, active-only plants and exact stat labels/colors |
| 7 Habit creation | Substantial | All frequencies, targets, wither/flexible rules, privacy, per-friend exceptions, inline field validation and focus/scroll-to-first-error; final keyboard/device pass remains |
| 8 HabitCard | Matched structurally | Shared 326×620 shell, exact 200px scene, badges, species, hydration, growth, streak, watering limit, Reflection Book, privacy and nudge contracts |
| 9 Water confirmation | Matched | Optional note, camera/library image, preview/remove, compression, upload/offline queue and duplicate-submit guard |
| 10 Reflection Book | Matched | Habit/species/summary, newest-first note/image entries, timestamps, Watered badge, Supabase reactions/comments and locally persisted demo interactions |
| 11 Completion | Matched | Confetti, trophy, mature real species, habit/species/summary and Sanctuary navigation with reduced motion |
| 12 Disco card | Matched structurally | Same shared card geometry, themed badges/scene/watering/specimen/energy/footer and persistent seven-day state |
| 13 Laboratory | Matched | Exact title/copy, 768px drawer breakpoint, simulator, discovery, exact rarity colors, search/sorts, 4/8 pagination and equal locked cards |
| 14 Plant rendering | Matched | One-to-one twenty-species registry, common PlantProps and shared geometry functions |
| 15 Services/data flow | Matched | Injected repositories; log trigger completes habits; reflection columns and connected-read policy added |
| 16 Styling | Substantial | Outfit loaded, shared palette/spacing/radii and component-local styles; exhaustive screenshot comparison remains |
| 17 Responsive behavior | Matched in code | Bottom tabs, mobile sheets/drawer, swipe carousel, 768px Lab breakpoint and compact stats |
| 18 Motion | Matched in code | Press/modal/progress/plant/confetti/Disco motion; reduced-motion guards on continuous/celebratory animation |
| 19 Accessibility | Substantial | Roles, labels, progress values, live regions, back dismissal and 44px targets; physical screen-reader/large-text pass remains |
| 20 Component map | Matched natively | Equivalent shell, gates, feature screens, cards, modals, drawer and shared controls exist |
| 21 State model | Matched | Shared user/habit/log/status/frequency/tier contracts retained |
| 22 Acceptance checklist | Partial external evidence | Automated checks pass; physical viewport/device matrix remains |
| 23 Screenshot archive | Pending | Requires reference captures and device/browser comparison artifacts |
| 24 Browser replacements | Matched | Async/Secure storage, native OAuth, slider, camera picker, explicit validation, native sheets and responsive APIs |
| 25 Reconstruction principle | Matched approach | Behavior, structure and visuals are validated independently |
| 26 Audit conventions | Applied | Exact values override earlier recommendations throughout this ledger |
| 27 Home state machine | Matched natively | Signed-out auth, signed-in locked and signed-in Forest states enforced by providers/router |
| 28 Dashboard flow | Matched | Exact header/stats, active habits, creation calculations, detailed/simple watering and completion transition |
| 29 Exact HabitCard behavior | Matched | Limits, 3000ms explanation, registry inputs, footer and nudge states implemented |
| 30 Exact HabitCard geometry | Matched/adapted | 20px shell radius, 24px padding, 20px gaps, 200px scene, 48px native watering target and measured equal carousel size |
| 31 Disco card contract | Matched | Storage key/state labels/energy calculation/component tree retained |
| 32 Disco drawing | Matched natively | 120×160 geometry, gradients, tiles, glasses, faces, stem, pot, soil, sparkles and tear retained |
| 33 Disco dancing | Matched in code | 0.7s jump/rock, 1.2s rays, 0.6s tiles, 0.8/1.1/0.9s sparkles, glow, 2s rainbow rail and 1.5s badge shine |
| 34 Disco styling | Matched | HabitCard geometry with exact purple border/shadow/panel and shared watering control |
| 35 Platform styling equivalents | Matched | Native animation/storage/press/disabled/theme equivalents replace CSS/DOM behavior |
| 36 Visual matrix | Pending external evidence | Code states exist; reference screenshot/video capture is still required |
| 37 Source confidence | Acknowledged | Web source remains authoritative until visual archive and device acceptance complete |
