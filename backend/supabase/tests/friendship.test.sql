-- Start transaction and plan tests
BEGIN;

-- We plan to run 28 assertions
SELECT plan(28);

-- 1. Verify Table Existence
SELECT has_table('public', 'friendships', 'Table friendships should exist in public schema');

-- 2. Verify Columns in friendships Table
SELECT has_column('public', 'friendships', 'id', 'friendships should have id column');
SELECT col_type_is('public', 'friendships', 'id', 'uuid', 'friendships.id should be of type uuid');
SELECT col_is_pk('public', 'friendships', 'id', 'friendships.id should be primary key');

SELECT has_column('public', 'friendships', 'user_id', 'friendships should have user_id column');
SELECT fk_ok('public', 'friendships', 'user_id', 'public', 'profiles', 'id', 'friendships.user_id should reference profiles.id');

SELECT has_column('public', 'friendships', 'friend_id', 'friendships should have friend_id column');
SELECT fk_ok('public', 'friendships', 'friend_id', 'public', 'profiles', 'id', 'friendships.friend_id should reference profiles.id');

SELECT has_column('public', 'friendships', 'status', 'friendships should have status column');
SELECT col_type_is('public', 'friendships', 'status', 'character varying(20)', 'friendships.status should be varchar(20)');

SELECT has_column('public', 'friendships', 'created_at', 'friendships should have created_at column');
SELECT col_type_is('public', 'friendships', 'created_at', 'timestamp with time zone', 'friendships.created_at should be timestamp with time zone');

-- 3. Verify Constraints and Indexes
SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'friendships_not_self' AND contype = 'c'
    ),
    'Constraint friendships_not_self should exist'
);

SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'friendships_status_val' AND contype = 'c'
    ),
    'Constraint friendships_status_val should exist'
);

SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_index i
        JOIN pg_class c ON c.oid = i.indexrelid
        WHERE c.relname = 'friendships_unique_user_pairs' AND i.indisunique = true
    ),
    'Unique index friendships_unique_user_pairs should exist'
);

SELECT has_index('public', 'friendships', 'friendships_user_id_idx', ARRAY['user_id'], 'friendships should have index on user_id');
SELECT has_index('public', 'friendships', 'friendships_friend_id_idx', ARRAY['friend_id'], 'friendships should have index on friend_id');
SELECT has_index('public', 'friendships', 'friendships_status_idx', ARRAY['status'], 'friendships should have index on status');

-- 4. Verify Row Level Security (RLS) is enabled
SELECT ok(
    (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'friendships'),
    'Row Level Security should be enabled on friendships table'
);

-- 5. Set up Mock Data for RLS and Constraints Testing
-- Insert test users into auth.users (which triggers profile creation)
INSERT INTO auth.users (id, email) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user_a@test.com'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'user_b@test.com'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'user_c@test.com');

-- 6. Verify Constraints Behavior
-- Test self-friendship constraint (friendships_not_self)
SELECT throws_ok(
    $$INSERT INTO public.friendships (user_id, friend_id, status) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'pending')$$,
    'check_violation',
    NULL,
    'Should not allow self-friendship'
);

-- Test invalid status constraint (friendships_status_val)
SELECT throws_ok(
    $$INSERT INTO public.friendships (user_id, friend_id, status) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'invalid')$$,
    'check_violation',
    NULL,
    'Should not allow invalid friendship status'
);

-- Mock User A's session to insert friendship request
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);

-- Insert friendship request (A -> B)
INSERT INTO public.friendships (user_id, friend_id, status)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pending');

-- Test unique user pair constraint - duplicate same request (A -> B)
SELECT throws_ok(
    $$INSERT INTO public.friendships (user_id, friend_id, status) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pending')$$,
    'unique_violation',
    NULL,
    'Should not allow duplicate friendship request (A -> B)'
);

-- Test unique user pair constraint - reverse request (B -> A)
SELECT throws_ok(
    $$INSERT INTO public.friendships (user_id, friend_id, status) VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'pending')$$,
    'unique_violation',
    NULL,
    'Should not allow duplicate friendship request in reverse direction (B -> A)'
);

-- 7. Verify Row Level Security (RLS) Behavior
-- Mock User C's session (third party, not in friendship)
SELECT set_config('request.jwt.claims', '{"sub": "cccccccc-cccc-cccc-cccc-cccccccccccc"}', true);

-- C should see 0 friendships
SELECT results_eq(
    $$SELECT COUNT(*)::integer FROM public.friendships$$,
    $$VALUES (0)$$,
    'User C should not be able to view A and B''s friendship'
);

-- C should fail to insert a friendship request on behalf of User A
SELECT throws_ok(
    $$INSERT INTO public.friendships (user_id, friend_id, status) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pending')$$,
    'new row violates row-level security policy for table "friendships"',
    NULL,
    'User C should not be able to insert a request on behalf of User A'
);

-- Mock User B's session (receiver of the friendship)
SELECT set_config('request.jwt.claims', '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true);

-- B should see 1 friendship
SELECT results_eq(
    $$SELECT COUNT(*)::integer FROM public.friendships$$,
    $$VALUES (1)$$,
    'User B should be able to view the friendship request from User A'
);

-- B should be able to update status to 'accepted'
SELECT lives_ok(
    $$UPDATE public.friendships SET status = 'accepted' WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND friend_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'$$,
    'User B should be able to update (accept) the friendship request'
);

-- Mock User A's session
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);

-- A should be able to delete the friendship
SELECT lives_ok(
    $$DELETE FROM public.friendships WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND friend_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'$$,
    'User A should be able to delete/cancel the friendship'
);

-- Finish tests and rollback changes
SELECT * FROM finish();
ROLLBACK;