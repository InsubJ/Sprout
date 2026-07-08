# Sprout Backend

This directory houses the backend infrastructure and database schema definitions for **Sprout**.

## Directory Structure
- `supabase/`: Contains local Supabase projects configuration, migration scripts, and edge functions.
  - `migrations/`: Version-controlled SQL migration scripts for profiles, habits, logs, nudges, comments, and reactions.
  - `functions/`: Serverless Supabase Edge Functions. Each function is stored in its own folder and performs a single specific task (e.g., `generate-reflection`).
  - `tests/`: Integration and unit tests targeting database constraints, row-level security (RLS) policies, and database triggers.

## Principles Followed
- **Single Responsibility**: Each migrations file handles a discrete schema version. Each edge function has a singular operational purpose.
- **Design by Contract**: Database triggers enforce validations (e.g. rate limits on friend nudges) before updates are allowed, and RLS policies define access rules.
