-- K175. Stamp every existing row before the trigger exists so none of them are emailed.
-- The webhook header is copied from Vault secret ym_webhook_secret when this
-- migration runs. The secret value is not written in this file.

alter table public.members add column if not exists welcome_sent_at timestamptz;

update public.members
set welcome_sent_at = created_at
where welcome_sent_at is null;

do $$
declare
  webhook_secret text;
begin
  select decrypted_secret
    into webhook_secret
  from vault.decrypted_secrets
  where name = 'ym_webhook_secret'
  limit 1;

  if webhook_secret is null or webhook_secret = '' then
    raise exception 'k175: create vault secret ym_webhook_secret before applying this migration';
  end if;

  execute format(
    $trigger$
      create trigger trg_k175_founders_welcome
      after insert on public.members
      for each row
      execute function supabase_functions.http_request(
        %L,
        'POST',
        %L,
        '{}',
        '5000'
      )
    $trigger$,
    'https://jeukkkxmamedvubookiw.supabase.co/functions/v1/send-founders-welcome',
    jsonb_build_object(
      'Content-Type', 'application/json',
      'x-ym-webhook-secret', webhook_secret
    )::text
  );
end
$$;
