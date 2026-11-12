-- K175. Stamp every existing row before the trigger exists so none of them are emailed.
-- The webhook header is read from Vault when a member is inserted. A missing secret
-- or a failed call warns and still lets the signup finish.

alter table public.members add column if not exists welcome_sent_at timestamptz;

update public.members
set welcome_sent_at = created_at
where welcome_sent_at is null;

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
      raise warning 'k175: vault secret ym_webhook_secret is not set; welcome email not queued for %', new.id;
      return new;
    end if;

    perform net.http_post(
      url => 'https://jeukkkxmamedvubookiw.supabase.co/functions/v1/send-founders-welcome',
      body => jsonb_build_object(
        'type', 'INSERT',
        'table', 'members',
        'record', to_jsonb(new)
      ),
      headers => jsonb_build_object(
        'Content-Type', 'application/json',
        'x-ym-webhook-secret', webhook_secret
      ),
      timeout_milliseconds => 5000
    );
  exception
    when others then
      raise warning 'k175: welcome webhook failed for %: %', new.id, sqlerrm;
  end;

  return new;
end;
$$;

revoke all on function public.k175_founders_welcome_notify() from public, anon, authenticated;

create trigger trg_k175_founders_welcome
after insert on public.members
for each row
execute function public.k175_founders_welcome_notify();
