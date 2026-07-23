# Row-Level Security (RLS) Policies

## Overview

Row-Level Security (RLS) policies enforce database access security at the PostgreSQL engine level, ensuring users can only read or mutate authorized data.

## RLS Security Matrix

- **`profiles`**: Publicly readable by all authenticated users; updatable only by row owner (`auth.uid() = id`).
- **`habits`**: Selectable by owner or accepted friends (if habit is public); insertable/updatable/deletable only by owner (`auth.uid() = user_id`).
- **`habit_logs`**: Selectable by habit owner or accepted friends; insertable only by user (`auth.uid() = user_id`).
- **`friendships`**: Selectable/updatable if `auth.uid() = user_id` or `auth.uid() = friend_id`.
- **`nudges`**: Insertable by friend; selectable by sender or recipient.
- **`custom_plants`**: Selectable by all users; insertable by creator.

## Key Source Files

- Migration RLS Policies: Defined in SQL scripts under [backend/supabase/migrations/](file:///c:/Users/ijeon/Documents/Sprout/backend/supabase/migrations).
- Storage Security: [backend/supabase/storage-policies.sql](file:///c:/Users/ijeon/Documents/Sprout/backend/supabase/storage-policies.sql).
