# AGENTS.md Compliance Audit

## Purpose

This document records the completed compliance refactor for the supported Sprout codebase.

Last reviewed: 13 July 2026.

## Scope

- `apps/mobile`: Expo React Native application.
- `packages/shared`: domain types, validation, pure rules, and plant geometry.
- `packages/services`: repository contracts, Supabase adapters, and offline synchronization.
- `packages/design-tokens`: shared visual constants.
- `backend/supabase`: migrations, database tests, and Storage policies.

## Compliance status

| Rule | Status | Evidence |
| --- | --- | --- |
| Single-purpose files and SRP | Compliant | Routes are wrappers; remote state is in focused hooks; Forest, HabitCard, Buds, Lab, Profile, Disco, and habit-form responsibilities are decomposed. |
| OCP | Compliant | Repository interfaces, configurable components, plant registry composition, and reusable section components provide extension points. |
| LSP | Compliant | Demo and Supabase repository implementations run shared behavioral contract cases with aligned shapes, validation, not-found, duplicate, and failure-category behavior. |
| ISP | Compliant | Components consume focused props and hooks; repository contracts remain domain-specific. |
| DIP | Compliant | Supabase access is isolated in service adapters and injected through `ServicesProvider`. |
| Design by Contract | Compliant | Boundary schemas/types, typed queue payloads, restored-payload guards, explicit return types, and categorized failures enforce preconditions and postconditions. |
| DRY | Compliant | Habit retrieval, friend gardens, reflections, interactions, media acquisition/upload, selection rows, and plant geometry have canonical implementations. |
| YAGNI | Compliant | Generated Expo export directories are absent and ignored; no speculative renderer abstraction was introduced. |
| Layer separation | Compliant | `app/` contains routing/layout composition, rendering stays in components/screens, lifecycle and remote state stay in hooks, and integrations stay in services. |

## Completed correctness work

- Added shared demo/Supabase contract suites for habit, log, profile, social, and interaction repositories.
- Defined separate database and queued reflection-log inputs.
- Added typed sync payload mapping and validation for restored queue data.
- Categorized repository failures as network, service unavailable, authorization, conflict, not found, validation, or unknown.
- Limited offline fallback to transient network and service-availability failures.
- Made permanent sync failures terminal so they are not retried indefinitely.
- Preserved client-operation idempotency by resolving duplicate log creates to the existing log.

## Completed architecture work

- Dynamic habit, profile, and reflection routes delegate to feature screens and cancellation-safe hooks.
- Friend-return confirmation is isolated from tab layout configuration.
- Remote state is extracted for Buds, friend gardens, Sanctuary, profile editing, reflections, interactions, and accepted-friend selection.
- Owner habit retrieval and caching use one collection hook shared by Forest, Sanctuary, and Lab.
- Camera/library acquisition and user media upload are separate hooks with purpose-specific configuration.
- Forest, HabitCard, Buds, Lab, Profile, Disco watering, and habit-form responsibilities are composed from focused files.
- `PreferenceSwitchRow` is the canonical labeled preference control and uses `AppSwitch`.

## Maintainability and verification

- Public repository methods, services, exported hooks, and pure domain utilities declare return types.
- Async work keyed by users, routes, or selected records ignores stale completions.
- Prettier is pinned and exposed through `npm run format` and `npm run format:check`.
- Generated `apps/mobile/dist-*` directories are absent and ignored.

Verification performed:

- `npm run format:check`
- `npm test`
- `npm run typecheck`
- `npm run validate:mobile`
- `git diff --check`
- Static searches confirming no service work in routes/renderers and no Supabase imports outside adapters.

## Definition of compliance

The supported repository satisfies the compliance definition:

- Expo routes are thin wrappers or layouts.
- Rendering components do not fetch from repositories or third parties.
- Shared logic and geometry have canonical implementations.
- Demo and production repositories share behavioral contracts.
- Offline operations queue only retryable failures and stop retrying terminal failures.
- Service and hook boundaries validate inputs and declare outputs.
- Independently changing UI and integration responsibilities are separated.
- Generated artifacts remain outside source control.
