-- Start transaction and plan tests
BEGIN;

-- We plan to run 26 assertions
SELECT plan(26);

-- 1. Verify Table Existence
SELECT has_table('public', 'wither_nudges', 'Table wither_nudges should exist in public schema');

-- 2. Verify Columns in wither_nudges Table
SELECT has_column('public', 'wither_nudges', 'id', 'wither_nudges should have id column');
SELECT col_type_is('public', 'wither_nudges', 'id', 'uuid', 'wither_nudges.id should be of type uuid');
SELECT col_is_pk('public', 'wither_nudges', 'id', 'wither_nudges.id should be primary key');

SELECT has_column('public', 'wither_nudges', 'sender_id', 'wither_nudges should have sender_id column');
SELECT fk_ok('public', 'wither_nudges', 'sender_id', 'public', 'profiles', 'id', 'wither_nudges.sender_id should reference profiles.id');

SELECT has_column('public', 'wither_nudges', 'receiver_id', 'wither_nudges should have receiver_id column');
SELECT fk_ok('public', 'wither_nudges', 'receiver_id', 'public', 'profiles', 'id', 'wither_nudges.receiver_id should reference profiles.id');

SELECT has_column('public', 'wither_nudges', 'habit_id', 'wither_nudges should have habit_id column');
SELECT fk_ok('public', 'wither_nudges', 'habit_id', 'public', 'habits', 'id', 'wither_nudges.habit_id should reference habits.id');

SELECT has_column('public', 'wither_nudges', 'nudged_at', 'wither_nudges should have nudged_at column');
SELECT col_type_is('public', 'wither_nudges', 'nudged_at', 'date', 'wither_nudges.nudged_at should be of type date');

SELECT has_column('public', 'wither_nudges', 'created_at', 'wither_nudges should have created_at column');
SELECT col_type_is('public', 'wither_nudges', 'created_at', 'timestamp with time zone', 'wither_nudges.created_at should be timestamp with time zone');

-- 3. Verify Unique Constraints and Indexes
SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_index i
        JOIN pg_class c ON c.oid = i.indexrelid
        WHERE c.relname = 'wither_nudges_sender_id_habit_id_nudged_at_key' AND i.indisunique = true
    ),
    'Unique index on sender_id, habit_id, nudged_at should exist'
);

-- 4. Verify Row Level Security (RLS) is enabled
SELECT ok(
    (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wither_nudges'),
    'Row Level Security should be enabled on wither_nudges table'
);

-- 5. Set up Mock Data for Testing
-- Insert test users into auth.users (triggers profile creation)
INSERT INTO auth.users (id, email) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user_a@test.com'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'user_b@test.com'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'user_c@test.com');

-- Establish friendship between A and B
INSERT INTO public.friendships (user_id, friend_id, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'accepted');

-- Insert habit for User B (status initially healthy, wither_threshold = 3)
INSERT INTO public.habits (id, user_id, name, status, wither_threshold, consecutive_misses, wither_count) VALUES
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Drink Water', 'healthy', 3, 0, 0);

-- 6. Verify Auto-Transition to Withered
SELECT results_eq(
    $$SELECT status FROM public.habits WHERE id = '11111111-1111-1111-1111-111111111111'$$,
    $$VALUES ('healthy'::varchar)$$,
    'Habit status should be healthy initially'
);

-- Update consecutive_misses to exceed/meet threshold (3 >= 3)
UPDATE public.habits 
SET consecutive_misses = 3 
WHERE id = '11111111-1111-1111-1111-111111111111';

SELECT results_eq(
    $$SELECT status FROM public.habits WHERE id = '11111111-1111-1111-1111-111111111111'$$,
    $$VALUES ('withered'::varchar)$$,
    'Habit status should auto-transition to withered'
);

SELECT results_eq(
    $$SELECT wither_count FROM public.habits WHERE id = '11111111-1111-1111-1111-111111111111'$$,
    $$VALUES (1)$$,
    'Habit wither_count should increment by 1'
);

-- Revive the habit by setting consecutive_misses back to 0
UPDATE public.habits 
SET consecutive_misses = 0 
WHERE id = '11111111-1111-1111-1111-111111111111';

SELECT results_eq(
    $$SELECT status FROM public.habits WHERE id = '11111111-1111-1111-1111-111111111111'$$,
    $$VALUES ('healthy'::varchar)$$,
    'Habit status should auto-transition back to healthy upon revival'
);

-- Set habit back to withered for nudge checks
UPDATE public.habits 
SET consecutive_misses = 3 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- 7. Verify Wither Nudges Constraints & Triggers
-- Friend A nudges User B's withered habit
SELECT lives_ok(
    $$INSERT INTO public.wither_nudges (sender_id, receiver_id, habit_id) 
      VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111')$$,
    'Friend A should be able to send a nudge to B''s withered plant'
);

-- Friend A tries to nudge B's habit again on the same day (duplicate check)
SELECT throws_ok(
    $$INSERT INTO public.wither_nudges (sender_id, receiver_id, habit_id) 
      VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111')$$,
    'unique_violation',
    NULL,
    'Should not allow duplicate daily nudges'
);

-- User B (owner) tries to self-nudge
SELECT throws_ok(
    $$INSERT INTO public.wither_nudges (sender_id, receiver_id, habit_id) 
      VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111')$$,
    'Cannot nudge your own habit',
    'Owner cannot self-nudge'
);

-- Non-friend C tries to nudge B's habit
SELECT throws_ok(
    $$INSERT INTO public.wither_nudges (sender_id, receiver_id, habit_id) 
      VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111')$$,
    'Users must be friends to send a nudge',
    'Cannot nudge if not mutual friends'
);

-- Revive the habit to healthy and try to nudge
UPDATE public.habits 
SET consecutive_misses = 0 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Clear the daily nudge to test this condition
DELETE FROM public.wither_nudges;

SELECT throws_ok(
    $$INSERT INTO public.wither_nudges (sender_id, receiver_id, habit_id) 
      VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111')$$,
    'Cannot nudge a habit that is not withered',
    'Cannot nudge healthy plant'
);

-- 8. Verify Row Level Security (RLS) Behavior
-- Set habit back to withered and insert a nudge
UPDATE public.habits 
SET consecutive_misses = 3 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Mock User A's session to insert nudge
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);

INSERT INTO public.wither_nudges (sender_id, receiver_id, habit_id) 
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111');

-- A (sender) should be able to view their sent nudge
SELECT results_eq(
    $$SELECT COUNT(*)::integer FROM public.wither_nudges WHERE sender_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$,
    $$VALUES (1)$$,
    'User A (sender) should be able to read the nudge'
);

-- Mock User B's session to view nudge
SELECT set_config('request.jwt.claims', '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true);

-- B (receiver) should be able to view the received nudge
SELECT results_eq(
    $$SELECT COUNT(*)::integer FROM public.wither_nudges WHERE receiver_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'$$,
    $$VALUES (1)$$,
    'User B (receiver) should be able to read the nudge'
);

-- Mock User C's session (third party)
SELECT set_config('request.jwt.claims', '{"sub": "cccccccc-cccc-cccc-cccc-cccccccccccc"}', true);

-- C should see 0 nudges
SELECT results_eq(
    $$SELECT COUNT(*)::integer FROM public.wither_nudges$$,
    $$VALUES (0)$$,
    'User C should see zero nudges'
);

-- C should not be able to insert on behalf of A
SELECT throws_ok(
    $$INSERT INTO public.wither_nudges (sender_id, receiver_id, habit_id) 
      VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111')$$,
    'new row violates row-level security policy for table "wither_nudges"',
    'User C should fail to insert on behalf of User A'
);

-- Reset JWT configuration
SELECT set_config('request.jwt.claims', '', true);

-- Finish tests and rollback changes
SELECT * FROM finish();
ROLLBACK;
