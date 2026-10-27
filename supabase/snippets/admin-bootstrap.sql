-- Usage: psql -v admin_email=owner@example.com -f supabase/snippets/admin-bootstrap.sql
-- Task 135: operational snippet, NOT a migration or automatic seed.
-- Claude runs this in Task 077 only after the owner has confirmed their email.
-- If the account already existed, complete password reset, global sign-out and
-- old access-token expiry BEFORE assigning admin (docs/yayin/admin-bootstrap.md).
insert into public.admin_users (user_id)
select id
from auth.users
where email = :'admin_email'
  and email_confirmed_at is not null
on conflict (user_id) do nothing
returning user_id;
