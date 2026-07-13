create table public.plant_generation_jobs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid not null, status text not null default 'queued' check (status in ('queued','moderating','planning','generating','validating','repairing','preview_ready','saving','completed','failed','cancelled')),
  original_prompt text not null check (char_length(original_prompt) between 3 and 1000), sanitized_prompt text not null,
  suggested_name text, edited_name text, current_step text not null default 'queued', checklist jsonb not null default '[]',
  provider_attempts jsonb not null default '[]', active_provider text, attempt_count integer not null default 0 check (attempt_count between 0 and 3),
  failure_code text, failure_message text, generated_spec jsonb, custom_plant_id uuid, credit_reservation_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(), started_at timestamptz, completed_at timestamptz, updated_at timestamptz not null default now(),
  unique (user_id, request_id)
);

create table public.custom_plants (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60), original_prompt text not null, sanitized_prompt text not null,
  description text not null, plant_spec jsonb not null, render_version integer not null default 1 check (render_version = 1),
  rarity text not null default 'custom' check (rarity = 'custom'), generation_job_id uuid not null unique references public.plant_generation_jobs(id),
  preview_image_url text, visibility text not null default 'friends' check (visibility in ('friends','private')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), archived_at timestamptz
);
alter table public.plant_generation_jobs add constraint plant_generation_jobs_custom_plant_fk foreign key (custom_plant_id) references public.custom_plants(id);

create table public.generation_credit_ledger (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null check (event_type in ('rewarded_ad_completed','stripe_payment_verified','generation_reserved','generation_consumed','generation_refunded','admin_adjustment')),
  credit_delta integer not null, source_event_id text, generation_job_id uuid references public.plant_generation_jobs(id), metadata jsonb not null default '{}', created_at timestamptz not null default now()
);
create unique index generation_credit_source_once on public.generation_credit_ledger(user_id,event_type,source_event_id) where source_event_id is not null;
create unique index generation_credit_reservation_once on public.generation_credit_ledger(generation_job_id,event_type) where generation_job_id is not null and event_type in ('generation_reserved','generation_consumed','generation_refunded');

create table public.rewarded_ad_events (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null, provider_event_id text not null, ad_unit_id text not null, verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected')),
  reward_amount integer not null default 1 check (reward_amount > 0), created_at timestamptz not null default now(), verified_at timestamptz, credited_at timestamptz,
  unique(provider, provider_event_id)
);
create table public.support_payments (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_checkout_session_id text not null unique, stripe_payment_intent_id text unique, stripe_customer_id text,
  amount_usd_cents integer not null check (amount_usd_cents > 0), currency text not null, status text not null check (status in ('pending','paid','failed','refunded')),
  created_at timestamptz not null default now(), verified_at timestamptz, credited_at timestamptz
);
create table public.custom_plant_log_entries (
  id uuid primary key default gen_random_uuid(), custom_plant_id uuid not null references public.custom_plants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, entry_type text not null default 'generation' check (entry_type = 'generation'),
  details jsonb not null, created_at timestamptz not null default now()
);

create index custom_plants_owner_created_idx on public.custom_plants(user_id,created_at desc) where archived_at is null;
create index plant_generation_jobs_owner_updated_idx on public.plant_generation_jobs(user_id,updated_at desc);
create index generation_credit_ledger_owner_created_idx on public.generation_credit_ledger(user_id,created_at desc);
create index rewarded_ad_events_owner_verified_idx on public.rewarded_ad_events(user_id,verified_at);

alter table public.custom_plants enable row level security;
alter table public.plant_generation_jobs enable row level security;
alter table public.generation_credit_ledger enable row level security;
alter table public.rewarded_ad_events enable row level security;
alter table public.support_payments enable row level security;
alter table public.custom_plant_log_entries enable row level security;

grant select on public.custom_plants to authenticated;
grant update (display_name, visibility, updated_at) on public.custom_plants to authenticated;
grant select on public.plant_generation_jobs, public.generation_credit_ledger, public.rewarded_ad_events, public.support_payments, public.custom_plant_log_entries to authenticated;
grant all on public.custom_plants, public.plant_generation_jobs, public.generation_credit_ledger, public.rewarded_ad_events, public.support_payments, public.custom_plant_log_entries to service_role;

create policy "owners and accepted friends read custom plants" on public.custom_plants for select to authenticated using (
  (select auth.uid()) = user_id or (visibility = 'friends' and exists (select 1 from public.friendships f where f.status='accepted' and ((f.user_id=(select auth.uid()) and f.friend_id=custom_plants.user_id) or (f.friend_id=(select auth.uid()) and f.user_id=custom_plants.user_id))))
);
create policy "owners update custom plant names and visibility" on public.custom_plants for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "owners read generation jobs" on public.plant_generation_jobs for select to authenticated using ((select auth.uid())=user_id);
create policy "owners read credit ledger" on public.generation_credit_ledger for select to authenticated using ((select auth.uid())=user_id);
create policy "owners read rewarded ad events" on public.rewarded_ad_events for select to authenticated using ((select auth.uid())=user_id);
create policy "owners read support payments" on public.support_payments for select to authenticated using ((select auth.uid())=user_id);
create policy "owners and accepted friends read custom plant logs" on public.custom_plant_log_entries for select to authenticated using (
  (select auth.uid())=user_id or exists (select 1 from public.custom_plants p where p.id=custom_plant_id and p.visibility='friends' and exists (select 1 from public.friendships f where f.status='accepted' and ((f.user_id=(select auth.uid()) and f.friend_id=p.user_id) or (f.friend_id=(select auth.uid()) and f.user_id=p.user_id))))
);

create or replace function public.issue_rewarded_ad_credit() returns trigger language plpgsql security definer set search_path = '' as $$
declare event_ids uuid[];
begin
  if new.verification_status <> 'verified' or new.credited_at is not null then return new; end if;
  select array_agg(id) into event_ids from (select id from public.rewarded_ad_events where user_id=new.user_id and verification_status='verified' and credited_at is null order by verified_at,created_at limit 20) pending;
  if coalesce(array_length(event_ids,1),0)=20 then
    insert into public.generation_credit_ledger(user_id,event_type,credit_delta,source_event_id,metadata) values(new.user_id,'rewarded_ad_completed',1,'ad-batch:'||event_ids[1]::text,jsonb_build_object('eventIds',event_ids));
    update public.rewarded_ad_events set credited_at=now() where id=any(event_ids);
  end if;
  return new;
end $$;
revoke all on function public.issue_rewarded_ad_credit() from public,anon,authenticated;
create trigger rewarded_ad_credit_after_verification after insert or update of verification_status on public.rewarded_ad_events for each row execute function public.issue_rewarded_ad_credit();
