# Supabase Database Schema & Tables

## Overview

The Sprout database is managed with versioned PostgreSQL migration files located in `backend/supabase/migrations/`.

## Core Tables

1. **`profiles`**: Stores user handle, display name, avatar URL, and timestamps.
2. **`habits`**: Core table for habits, target waterings, streak counters, wither threshold, status, and plant type.
3. **`habit_logs`**: Watering log history with optional notes, image URLs, and client operation IDs.
4. **`friendships`**: User relationships with status (`pending`, `accepted`, `declined`).
5. **`nudges`**: Water nudge logs sent between friends for withered plants.
6. **`custom_plants`**: Specs and metadata for AI-generated custom plant species.
7. **`generation_jobs`**: Status tracking for background AI custom plant generation requests.
8. **`generation_credits`**: Ledger tracking earned and purchased AI custom plant generation credits.

## Key Directory & Migration Files

- [backend/supabase/migrations/](file:///c:/Users/ijeon/Documents/Sprout/backend/supabase/migrations): SQL migration scripts applied to remote database.
- [backend/supabase/README.md](file:///c:/Users/ijeon/Documents/Sprout/backend/README.md): Setup instructions for local Supabase CLI development.
