create table if not exists entitlements (
  device_id text primary key,
  is_premium boolean default false,
  premium_source text,
  purchase_token text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table entitlements enable row level security;

create policy "Read own entitlement" on entitlements for select using (true);
create policy "Upsert entitlement" on entitlements for insert with check (true);
create policy "Update entitlement" on entitlements for update using (true) with check (true);

