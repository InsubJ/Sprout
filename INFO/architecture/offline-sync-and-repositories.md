# Offline Sync Engine & Repository Layer

## Overview

Data operations are abstracted behind clean TypeScript interfaces in `@sprout/services`. This allows the application to seamlessly switch between local demo mode (when Supabase credentials are not configured) and cloud Supabase mode with offline support.

## Repository Contracts

Defined in `packages/services/src/repositories/`:
- `HabitRepository`: CRUD operations for habit records.
- `LogRepository`: Creation, retrieval, and counting of habit watering logs.
- `SocialRepository`: Friendship management, friend list queries, and nudge interactions.
- `CustomPlantRepository`: Persistence of custom generated plant specs.
- `StorageRepository`: Asset uploads for reflection images.

## Offline Operations Queue

When network connectivity is unavailable, write operations (such as habit log creation) are enqueued into an offline operation queue stored in `AsyncStorage`.

### Operation Queue Flow

1. User triggers watering action.
2. Mutation is checked for network connectivity.
3. If offline or request fails with retryable error, operation is saved via `SyncQueue` with a client-generated `operationId`.
4. Local React state updates optimistically.
5. When `SyncProvider` detects online status, `SyncProcessor` drains the queue sequentially.

## Key Files

- [packages/services/src/offline/syncQueue.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/services/src/offline/syncQueue.ts): Storage operations for queued mutations.
- [packages/services/src/offline/syncProcessor.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/services/src/offline/syncProcessor.ts): Execution loop for flushing pending operations.
- [apps/mobile/src/repositories/demoHabitRepository.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/repositories/demoHabitRepository.ts): In-memory repository implementation for demo mode.
- [packages/services/src/supabase/supabaseHabitRepository.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/services/src/supabase/supabaseHabitRepository.ts): Supabase database implementation.
