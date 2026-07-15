drop index if exists public.friendships_unique_user_pairs;

create unique index friendships_unique_user_pairs
on public.friendships (
  least(user_id, friend_id),
  greatest(user_id, friend_id)
)
where status in ('pending', 'accepted');

drop policy if exists "Allow users to delete their own friendships" on public.friendships;

create policy "Requesters cancel pending friendship requests"
on public.friendships
for delete
to authenticated
using ((select auth.uid()) = user_id and status = 'pending');

create policy "Participants remove accepted friendships"
on public.friendships
for delete
to authenticated
using (
  status = 'accepted'
  and ((select auth.uid()) = user_id or (select auth.uid()) = friend_id)
);
