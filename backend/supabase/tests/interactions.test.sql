-- Start transaction and plan tests
BEGIN;

-- We plan to run 46 assertions
SELECT plan(46);

-- 1. Verify Table Existence
SELECT has_table('public', 'log_comments', 'Table log_comments should exist in public schema');
SELECT has_table('public', 'log_reactions', 'Table log_reactions should exist in public schema');

-- 2. Verify Columns in log_comments Table
SELECT col_is_pk('public', 'log_comments', 'id', 'log_comments.id should be primary key');
SELECT col_type_is('public', 'log_comments', 'id', 'uuid', 'log_comments.id should be of type uuid');
SELECT fk_ok('public', 'log_comments', 'log_id', 'public', 'habit_logs', 'id', 'log_comments.log_id should reference habit_logs.id');
SELECT fk_ok('public', 'log_comments', 'user_id', 'public', 'profiles', 'id', 'log_comments.user_id should reference profiles.id');
SELECT col_type_is('public', 'log_comments', 'content', 'text', 'log_comments.content should be text');
SELECT col_type_is('public', 'log_comments', 'created_at', 'timestamp with time zone', 'log_comments.created_at should be timestamp with time zone');

-- 3. Verify Columns in log_reactions Table
SELECT col_is_pk('public', 'log_reactions', 'id', 'log_reactions.id should be primary key');
SELECT col_type_is('public', 'log_reactions', 'id', 'uuid', 'log_reactions.id should be of type uuid');
SELECT fk_ok('public', 'log_reactions', 'log_id', 'public', 'habit_logs', 'id', 'log_reactions.log_id should reference habit_logs.id');
SELECT fk_ok('public', 'log_reactions', 'user_id', 'public', 'profiles', 'id', 'log_reactions.user_id should reference profiles.id');
SELECT col_type_is('public', 'log_reactions', 'reaction_type', 'character varying(50)', 'log_reactions.reaction_type should be varchar(50)');
SELECT col_type_is('public', 'log_reactions', 'created_at', 'timestamp with time zone', 'log_reactions.created_at should be timestamp with time zone');

-- 4. Verify Constraints
SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'log_comments_content_not_empty' AND contype = 'c'
    ),
    'Constraint log_comments_content_not_empty should exist'
);

SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'log_reactions_type_not_empty' AND contype = 'c'
    ),
    'Constraint log_reactions_type_not_empty should exist'
);

SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'log_reactions_unique_user_reaction' AND contype = 'u'
    ),
    'Constraint log_reactions_unique_user_reaction should exist'
);

-- 5. Verify Row Level Security (RLS) is enabled
SELECT ok(
    (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'log_comments'),
    'Row Level Security should be enabled on log_comments table'
);

SELECT ok(
    (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'log_reactions'),
    'Row Level Security should be enabled on log_reactions table'
);

-- 6. Verify Indexes
SELECT has_index('public', 'log_comments', 'log_comments_log_id_idx', ARRAY['log_id'], 'log_comments should have index on log_id');
SELECT has_index('public', 'log_comments', 'log_comments_user_id_idx', ARRAY['user_id'], 'log_comments should have index on user_id');
SELECT has_index('public', 'log_comments', 'log_comments_created_at_idx', ARRAY['created_at'], 'log_comments should have index on created_at');

SELECT has_index('public', 'log_reactions', 'log_reactions_log_id_idx', ARRAY['log_id'], 'log_reactions should have index on log_id');
SELECT has_index('public', 'log_reactions', 'log_reactions_user_id_idx', ARRAY['user_id'], 'log_reactions should have index on user_id');
SELECT has_index('public', 'log_reactions', 'log_reactions_type_idx', ARRAY['reaction_type'], 'log_reactions should have index on reaction_type');

-- 7. Set up Mock Data for testing behavior
-- Insert test users into auth.users (triggers profile creation via trigger)
INSERT INTO auth.users (id, email) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user_a@test.com'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'user_b@test.com'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'user_c@test.com');

-- Insert a habit for User A
INSERT INTO public.habits (id, user_id, name, plant_type, difficulty_tier, frequency, target_waterings, current_waterings, status)
VALUES ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A''s Habit', 'bonsai', 'common', 'daily', 10, 0, 'healthy');

-- Insert a habit log
INSERT INTO public.habit_logs (id, habit_id, user_id)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- 8. Test Constraints
-- Comment content not empty
SELECT throws_ok(
    $$INSERT INTO public.log_comments (log_id, user_id, content) VALUES ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '   ')$$,
    'check_violation',
    NULL,
    'Should not allow empty comment content'
);

-- Reaction type not empty
SELECT throws_ok(
    $$INSERT INTO public.log_reactions (log_id, user_id, reaction_type) VALUES ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '   ')$$,
    'check_violation',
    NULL,
    'Should not allow empty reaction type'
);

-- Reaction type uniqueness
-- First reaction (A, like) -> should succeed
SELECT lives_ok(
    $$INSERT INTO public.log_reactions (log_id, user_id, reaction_type) VALUES ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'like')$$,
    'Inserting first reaction should succeed'
);

-- Duplicate reaction (A, like) -> should throw unique violation
SELECT throws_ok(
    $$INSERT INTO public.log_reactions (log_id, user_id, reaction_type) VALUES ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'like')$$,
    'unique_violation',
    NULL,
    'Should not allow duplicate reaction of same type by same user on same log'
);

-- Different reaction type (A, love) -> should succeed
SELECT lives_ok(
    $$INSERT INTO public.log_reactions (log_id, user_id, reaction_type) VALUES ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'love')$$,
    'Inserting different reaction type by same user should succeed'
);

-- Same reaction type by different user (B, like) -> should succeed
SELECT lives_ok(
    $$INSERT INTO public.log_reactions (log_id, user_id, reaction_type) VALUES ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'like')$$,
    'Inserting same reaction type by different user should succeed'
);

-- Clean up reactions inserted during constraint tests to isolate RLS testing
DELETE FROM public.log_reactions;

-- 9. Verify RLS Behavior
-- Mock User A's session
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);

-- A should be able to insert comment
SELECT lives_ok(
    $$INSERT INTO public.log_comments (id, log_id, user_id, content) VALUES ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A''s Comment')$$,
    'User A should be able to insert their own comment'
);

-- A should NOT be able to insert comment on behalf of User B
SELECT throws_ok(
    $$INSERT INTO public.log_comments (log_id, user_id, content) VALUES ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Imposter')$$,
    'new row violates row-level security policy for table "log_comments"',
    NULL,
    'User A should not be able to insert comment on behalf of User B'
);

-- A should be able to update their own comment
SELECT lives_ok(
    $$UPDATE public.log_comments SET content = 'A''s Updated Comment' WHERE id = '33333333-3333-3333-3333-333333333333'$$,
    'User A should be able to update their own comment'
);

-- A should be able to delete their own comment
-- Let's insert a second comment to delete
SELECT lives_ok(
    $$INSERT INTO public.log_comments (id, log_id, user_id, content) VALUES ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A''s Temp Comment')$$,
    'User A should be able to insert another comment'
);
SELECT lives_ok(
    $$DELETE FROM public.log_comments WHERE id = '44444444-4444-4444-4444-444444444444'$$,
    'User A should be able to delete their own comment'
);

-- A should be able to insert reaction
SELECT lives_ok(
    $$INSERT INTO public.log_reactions (id, log_id, user_id, reaction_type) VALUES ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'like')$$,
    'User A should be able to insert their own reaction'
);

-- A should NOT be able to insert reaction on behalf of User B
SELECT throws_ok(
    $$INSERT INTO public.log_reactions (id, log_id, user_id, reaction_type) VALUES ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'like')$$,
    'new row violates row-level security policy for table "log_reactions"',
    NULL,
    'User A should not be able to insert reaction on behalf of User B'
);

-- A should be able to delete their own reaction
SELECT lives_ok(
    $$DELETE FROM public.log_reactions WHERE id = '55555555-5555-5555-5555-555555555555'$$,
    'User A should be able to delete their own reaction'
);

-- Mock User B's session
SELECT set_config('request.jwt.claims', '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true);

-- B should NOT be able to update A's comment
SELECT throws_ok(
    $$UPDATE public.log_comments SET content = 'Hacked' WHERE id = '33333333-3333-3333-3333-333333333333'$$,
    'new row violates row-level security policy for table "log_comments"',
    NULL,
    'User B should not be able to update A''s comment'
);

-- B should NOT be able to delete A's comment
SELECT lives_ok(
    $$DELETE FROM public.log_comments WHERE id = '33333333-3333-3333-3333-333333333333'$$,
    'B''s delete call on A''s comment runs, but RLS prevents any row from being affected'
);
-- Verify that A's comment still exists (B's delete did not affect it)
-- To do this, check the database as superuser (reset JWT claim)
SELECT set_config('request.jwt.claims', '', true);
SELECT results_eq(
    $$SELECT COUNT(*)::integer FROM public.log_comments WHERE id = '33333333-3333-3333-3333-333333333333'$$,
    $$VALUES (1)$$,
    'A''s comment should still exist after B attempted to delete it'
);

-- 10. Test Cascade Deletes
-- Insert a reaction (A, like) as superuser
INSERT INTO public.log_reactions (id, log_id, user_id, reaction_type)
VALUES ('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'like');

-- Delete the habit log
DELETE FROM public.habit_logs WHERE id = '22222222-2222-2222-2222-222222222222';

-- Comments and reactions referencing that log should be deleted automatically (cascade)
SELECT results_eq(
    $$SELECT COUNT(*)::integer FROM public.log_comments WHERE log_id = '22222222-2222-2222-2222-222222222222'$$,
    $$VALUES (0)$$,
    'All comments for log should be deleted when log is deleted'
);

SELECT results_eq(
    $$SELECT COUNT(*)::integer FROM public.log_reactions WHERE log_id = '22222222-2222-2222-2222-222222222222'$$,
    $$VALUES (0)$$,
    'All reactions for log should be deleted when log is deleted'
);

-- Re-create log and add comments/reactions to test User cascade deletion
INSERT INTO public.habit_logs (id, habit_id, user_id)
VALUES ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

INSERT INTO public.log_comments (id, log_id, user_id, content)
VALUES ('88888888-8888-8888-8888-888888888888', '77777777-7777-7777-7777-777777777777', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'B''s comment on A''s log');

INSERT INTO public.log_reactions (id, log_id, user_id, reaction_type)
VALUES ('99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'like');

-- Delete User B's profile
DELETE FROM public.profiles WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- B's comment and reaction should be deleted automatically (cascade)
SELECT results_eq(
    $$SELECT COUNT(*)::integer FROM public.log_comments WHERE user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'$$,
    $$VALUES (0)$$,
    'B''s comments should be deleted when B''s profile is deleted'
);

SELECT results_eq(
    $$SELECT COUNT(*)::integer FROM public.log_reactions WHERE user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'$$,
    $$VALUES (0)$$,
    'B''s reactions should be deleted when B''s profile is deleted'
);

-- Finish tests and rollback changes
SELECT * FROM finish();
ROLLBACK;
