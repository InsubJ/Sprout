alter table public.plant_generation_jobs
  drop constraint if exists plant_generation_jobs_custom_plant_fk;

alter table public.plant_generation_jobs
  add constraint plant_generation_jobs_custom_plant_fk
  foreign key (custom_plant_id)
  references public.custom_plants(id)
  on delete set null;

grant delete on public.custom_plants to authenticated;

create policy "owners delete their custom plants"
on public.custom_plants
for delete
to authenticated
using ((select auth.uid()) = user_id);
