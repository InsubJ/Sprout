# Backend Services & Database Information Index

This directory documents Supabase PostgreSQL migrations, database tables, Row-Level Security (RLS) policies, Edge Functions, and Stripe integration.

## Documentation Files

- [supabase-database-schema.md](file:///c:/Users/ijeon/Documents/Sprout/INFO/backend-services/supabase-database-schema.md): Database tables (`profiles`, `habits`, `habit_logs`, `friendships`, `nudges`, `custom_plants`, `generation_jobs`, `generation_credits`), migrations, and schema design.
- [row-level-security.md](file:///c:/Users/ijeon/Documents/Sprout/INFO/backend-services/row-level-security.md): RLS security policies, ownership checks, friendship access rules, and public sharing policies.
- [edge-functions.md](file:///c:/Users/ijeon/Documents/Sprout/INFO/backend-services/edge-functions.md): Deno / Hono Edge Functions under `backend/supabase/functions/` (`generate-custom-plant`, `save-custom-plant`, `create-stripe-checkout`, `stripe-webhook`).
- [stripe-integration.md](file:///c:/Users/ijeon/Documents/Sprout/INFO/backend-services/stripe-integration.md): Stripe Checkout session generation, webhook handling, price configuration, and credit allocation.
