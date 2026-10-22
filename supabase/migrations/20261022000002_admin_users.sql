-- Task 062: server-managed assignments only. No account or admin seeds.
-- Local rollback: reset the memory-only test database. After deployment,
-- remove consumers first and use a new forward migration to drop this table.
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.admin_users force row level security;

-- No client grants or policies: membership cannot grant or edit admin roles.
-- Revoke inherited Supabase default grants, including service TRUNCATE.
revoke all on table public.admin_users from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.admin_users to service_role;
