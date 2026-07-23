# Monorepo Structure & Package Layout

## Overview

Sprout is built as an npm-workspaces monorepo designed for clean separation of concerns, platform independence, and high testability.

## Workspace Directory Mapping

- `apps/mobile`: Expo React Native application targeting iOS, Android, and Web (`app/` for routing, `src/` for feature components, hooks, and services).
- `packages/shared`: Pure domain types, schemas (Zod), habit rules, difficulty formulas, and plant growth algorithms. Has zero React or platform dependencies.
- `packages/services`: Data access contracts (`HabitRepository`, `SocialRepository`, `LogRepository`), Supabase client adapters, offline operation queue, and sync processors.
- `packages/design-tokens`: UI colors, spacing, radii, shadow tokens, and theme definitions.
- `packages/config`: Shared ESLint, Prettier, and TypeScript configurations.
- `backend/supabase`: PostgreSQL schema migrations, Row Level Security (RLS) policies, and Deno/Hono Edge Functions.

## Core Source Files

- [package.json](file:///c:/Users/ijeon/Documents/Sprout/package.json): Root monorepo workspace manifest and test/typecheck orchestration scripts.
- [apps/mobile/package.json](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/package.json): Expo application dependencies.
- [packages/shared/src/index.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/index.ts): Main export index for shared domain logic.
- [packages/services/src/index.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/services/src/index.ts): Main export index for repository contracts and Supabase services.

## Architectural Rules & Guidelines

- Maintain strict SRP (Single Responsibility Principle) across all packages and components as defined in [.agents/AGENTS.md](file:///c:/Users/ijeon/Documents/Sprout/.agents/AGENTS.md).
- React components must handle rendering only; logic must be extracted into custom hooks under `src/features/*/hooks`.
