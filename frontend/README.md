# Sprout Frontend

This is the user interface and client-side logic for **Sprout**, built using **Next.js 14+ (App Router)** and **TypeScript**.

## Directory Structure
To maintain a strict separation of concerns, the project is structured by purpose:
- `src/app/`: Next.js page routes. Contains only high-level layout definitions and page routing wrapper components. Business logic and complex UI views are completely delegated to other layers.
- `src/components/`: Pure visual components that handle presentation. They must be modular, highly reusable, and receive data/callbacks via explicit TypeScript props (ISP). Divided by sub-domain:
  - `common/`: Global components (Buttons, Inputs, Modals, Loaders).
  - `habit/`: Components for rendering plants, progress bars, and check-in timelines.
  - `social/`: Components for friend lists, comment boards, and nudges.
- `src/hooks/`: Single-purpose React hooks. They manage local/global state, cache, side-effects, and subscription setups.
- `src/services/`: Client wrappers for Supabase DB, Authentication, Storage, and Edge Functions. Direct API calls are forbidden inside UI pages or components; they must use these services.
- `src/types/`: Database row schemas, API request/response formats, and client structures.
- `src/utils/`: Pure, side-effect-free helper functions (e.g. date conversion, math equations, plant SVG generation).

## Principles Followed
- **Single Responsibility**: Each file has one and only one task. A component should not fetch data, and a service should not store local UI state.
- **Design by Contract**: Custom hooks, components, and service methods declare strict input and output TypeScript types. Inputs are validated at boundary interfaces using preconditions.
- **DRY & YAGNI**: Common UI behaviors and visual states are shared. No code is written for features that are not yet specified.
