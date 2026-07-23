# Architecture Information Index

This directory explains the core architecture, monorepo setup, provider composition, offline synchronization, repository abstraction, and design tokens of the Sprout repository.

## Documentation Files

- [monorepo-structure.md](file:///c:/Users/ijeon/Documents/Sprout/INFO/architecture/monorepo-structure.md): Package layout (`apps/mobile`, `packages/shared`, `packages/services`, `packages/design-tokens`, `packages/config`), workspace linking, and TypeScript configuration.
- [state-and-providers.md](file:///c:/Users/ijeon/Documents/Sprout/INFO/architecture/state-and-providers.md): React context provider tree, dependency injection (`ServicesProvider`), data revision cache invalidation (`DataProvider`), and screen state hooks.
- [offline-sync-and-repositories.md](file:///c:/Users/ijeon/Documents/Sprout/INFO/architecture/offline-sync-and-repositories.md): Repository pattern, demo vs. Supabase implementations, offline operation queues (`SyncProvider`), and optimistic state updates.
- [design-system-and-tokens.md](file:///c:/Users/ijeon/Documents/Sprout/INFO/architecture/design-system-and-tokens.md): Design tokens package (`@sprout/design-tokens`), theme provider (`ThemeProvider`), light/dark modes, colors, spacing, and typography standards.
