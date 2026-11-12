-- K175. A new website member is handed to the app project's welcome sender.
-- The shared ledger there stops a second welcome. A missing secret or a failed
-- call warns and still lets the signup finish.

create extension if not exists pg_net with schema extensions;

create or replace function public.k175_founders_welcome_notify()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  webhook_secret text;
begin
  begin
    select decrypted_secret
      into webhook_secret
    from vault.decrypted_secrets
    where name = 'ym_webhook_secret'
    limit 1;

    if webhook_secret is null or webhook_secret = '' then
      raise warning 'k175: vault secret ym_webhook_secret is not set; welcome handoff not queued for %', new.id;
      return new;
    end if;

    perform net.http_post(
      url => 'https://sbjaqhsexlwqfowckddk.supabase.co/functions/v1/send-welcome-emails',
      body => jsonb_build_object(
        'source', 'website',
        'email', new.email,
        'member_id', new.id
      ),
      headers => jsonb_build_object(
        'Content-Type', 'application/json',
        'x-ym-webhook-secret', webhook_secret
      ),
      timeout_milliseconds => 5000
    );
  exception
    when others then
      raise warning 'k175: welcome handoff failed for %: %', new.id, sqlerrm;
  end;

  return new;
end;
$$;

revoke all on function public.k175_founders_welcome_notify() from public, anon, authenticated;

create trigger trg_k175_founders_welcome
after insert on public.members
for each row
execute function public.k175_founders_welcome_notify();
