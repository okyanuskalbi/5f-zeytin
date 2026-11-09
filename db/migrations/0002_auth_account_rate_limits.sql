-- Forward-only shared account counters; no user identifiers or passwords stored.
-- Removal is a separate reviewed migration after all callers stop using it.
create table public.auth_account_limits (
  key text primary key check (key ~ '^[a-f0-9]{64}$'),
  attempts integer not null check (attempts between 1 and 1000000),
  window_started timestamptz not null,
  blocked_until timestamptz
);
create index auth_account_limits_window on public.auth_account_limits(window_started);
revoke all on public.auth_account_limits from public;
