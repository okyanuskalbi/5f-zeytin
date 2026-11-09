-- Return each atomic statement's permission decision without a read/update race.
-- Forward-only addition; old counters retain their current blocked_until value.
alter table public.auth_account_limits add column permitted boolean not null default false;
