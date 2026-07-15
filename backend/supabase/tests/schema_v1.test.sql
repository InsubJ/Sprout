-- Start transaction and plan tests
BEGIN;

-- We plan to run 27 assertions
SELECT plan(27);

-- 1. Check schemas and extensions
SELECT has_extension('uuid-ossp', 'Extension uuid-ossp should be installed');

-- 2. Verify Table Existence
SELECT has_table('public', 'profiles', 'Table profiles should exist in public schema');
SELECT has_table('public', 'habits', 'Table habits should exist in public schema');

-- 3. Verify Columns in profiles Table
SELECT has_column('public', 'profiles', 'id', 'profiles should have id column');
SELECT col_type_is('public', 'profiles', 'id', 'uuid', 'profiles.id should be of type uuid');
SELECT col_is_pk('public', 'profiles', 'id', 'profiles.id should be primary key');

SELECT has_column('public', 'profiles', 'username', 'profiles should have username column');
SELECT col_type_is('public', 'profiles', 'username', 'character varying(50)', 'profiles.username should be varchar(50)');

SELECT has_column('public', 'profiles', 'display_name', 'profiles should have display_name column');
SELECT has_column('public', 'profiles', 'avatar_url', 'profiles should have avatar_url column');
SELECT has_column('public', 'profiles', 'created_at', 'profiles should have created_at column');
SELECT has_column(
    'public',
    'profiles',
    'username_set_at',
    'profiles should track one-time username setup'
);

-- 4. Verify Columns in habits Table
SELECT has_column('public', 'habits', 'id', 'habits should have id column');
SELECT col_is_pk('public', 'habits', 'id', 'habits.id should be primary key');

SELECT has_column('public', 'habits', 'user_id', 'habits should have user_id column');
SELECT fk_ok('public', 'habits', 'user_id', 'public', 'profiles', 'id', 'habits.user_id should reference profiles.id');

SELECT has_column('public', 'habits', 'name', 'habits should have name column');
SELECT has_column('public', 'habits', 'difficulty_tier', 'habits should have difficulty_tier column');
SELECT col_type_is('public', 'habits', 'difficulty_tier', 'character varying(20)', 'difficulty_tier should be varchar(20)');

SELECT has_column('public', 'habits', 'frequency', 'habits should have frequency column');
SELECT has_column('public', 'habits', 'status', 'habits should have status column');

-- 5. Verify Indexes
SELECT has_index('public', 'habits', 'habits_user_id_idx', ARRAY['user_id'], 'habits should have index on user_id');
SELECT has_index('public', 'habits', 'habits_status_idx', ARRAY['status'], 'habits should have index on status');

-- 6. Verify Row Level Security (RLS) is enabled
SELECT ok(
    (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles'),
    'Row Level Security should be enabled on profiles table'
);

SELECT ok(
    (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'habits'),
    'Row Level Security should be enabled on habits table'
);

-- 7. Verify helper function exists
SELECT has_function('public', 'handle_new_user', 'function public.handle_new_user should exist');
SELECT has_function(
    'public',
    'reject_profile_username_change',
    'function public.reject_profile_username_change should exist'
);

SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'reject_profile_username_change'
          AND NOT tgisinternal
    ),
    'Profile username immutability trigger should be defined'
);

-- 8. Verify trigger exists on auth.users (if auth schema is active, otherwise mock verification)
-- In a standard test environment, auth schema is loaded. Let's verify trigger name and table if it exists.
SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ),
    'Trigger on_auth_user_created should be defined in the database'
);

-- Finish tests and rollback changes
SELECT * FROM finish();
ROLLBACK;
