import { WELCOME_TEMPLATE_HTML } from "./template.ts";

const RESEND_URL = "https://api.resend.com/emails";
const FROM = "Ryan Mulvaney <ryan@yourmountains.life>";
const BCC = "ryan@yourmountains.life";
const REPLY_TO = "Ryan@YourMountains.Life";
const SUBJECT = "Welcome to the Founder's Club";
const TEST_RECIPIENT = "ryan@yourmountains.life";

export type MemberRow = {
  id: string;
  email: string | null;
  is_deleted: boolean | null;
  welcome_sent_at: string | null;
};

export type MembersDb = {
  getMember(id: string): Promise<MemberRow | null>;
  claimWelcome(id: string): Promise<boolean>;
  clearWelcome(id: string): Promise<void>;
};

export type HandlerDeps = {
  webhookSecret: string | undefined;
  resendApiKey: string | undefined;
  now: Date;
  fetchFn: typeof fetch;
  db: MembersDb;
};

type WebhookBody = {
  type?: string;
  table?: string;
  record?: { id?: string };
  test?: boolean;
};

export function dayWithOrdinal(day: number): string {
  const lastTwo = day % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

export function formatSendDate(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).formatToParts(now);
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  return `${month} ${dayWithOrdinal(day)}, ${year}`;
}

export function renderWelcomeHtml(now: Date): string {
  return WELCOME_TEMPLATE_HTML.replaceAll("{{SEND_DATE}}", formatSendDate(now));
}

export function welcomePlainText(html: string): string {
  const withoutComments = html.replace(/<!--[\s\S]*?-->/g, "");
  const withBreaks = withoutComments
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n");
  const stripped = withBreaks.replace(/<[^>]+>/g, "");
  const decoded = stripped
    .replace(/&#(\d+);/g, (_, digits: string) => String.fromCodePoint(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&middot;/g, "·")
    .replace(/&egrave;/g, "è")
    .replace(/&mdash;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
  return decoded
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter((line, index, lines) => line !== "" || (index > 0 && lines[index - 1] !== ""))
    .join("\n")
    .trim();
}

function secretsEqual(left: string, right: string): boolean {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  const length = Math.max(a.length, b.length);
  let diff = a.length === b.length ? 0 : 1;
  for (let i = 0; i < length; i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function skip(reason: string, id?: string): Response {
  console.warn(`founders welcome skipped: ${reason}${id ? ` id=${id}` : ""}`);
  return json({ skipped: true, reason }, 200);
}

function emailOk(email: string | null): email is string {
  return typeof email === "string" && email.includes("@");
}

async function deliver(
  deps: HandlerDeps,
  to: string,
  includeBcc: boolean,
): Promise<{ ok: true } | { ok: false; detail: string }> {
  if (!deps.resendApiKey) {
    return { ok: false, detail: "RESEND_API_KEY is not set" };
  }
  const html = renderWelcomeHtml(deps.now);
  const text = welcomePlainText(html);
  const payload: Record<string, unknown> = {
    from: FROM,
    to: [to],
    reply_to: REPLY_TO,
    subject: SUBJECT,
    html,
    text,
  };
  if (includeBcc) payload.bcc = [BCC];
  let response: Response;
  try {
    response = await deps.fetchFn(RESEND_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${deps.resendApiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, detail: message };
  }
  if (!response.ok) {
    const detail = await response.text();
    return { ok: false, detail: `status ${response.status}: ${detail}` };
  }
  return { ok: true };
}

export async function handleFoundersWelcome(req: Request, deps: HandlerDeps): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const provided = req.headers.get("x-ym-webhook-secret") ?? "";
  const expected = deps.webhookSecret ?? "";
  if (!expected || !secretsEqual(provided, expected)) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: WebhookBody;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return new Response("Bad request", { status: 400 });
  }

  if (body.test === true) {
    const result = await deliver(deps, TEST_RECIPIENT, false);
    if (!result.ok) {
      console.error(`founders welcome resend failed: ${result.detail}`);
      return json({ error: "resend_failed" }, 502);
    }
    return json({ sent: true, test: true }, 200);
  }

  if (body.type !== "INSERT" || body.table !== "members" || typeof body.record?.id !== "string" || body.record.id === "") {
    return new Response("Bad request", { status: 400 });
  }
  const id = body.record.id;

  let member: MemberRow | null;
  try {
    member = await deps.db.getMember(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`founders welcome read failed id=${id}: ${message}`);
    return json({ error: "read_failed" }, 500);
  }
  if (!member) return skip("missing_row", id);
  if (!emailOk(member.email)) return skip("invalid_email", id);
  if (member.is_deleted === true) return skip("deleted", id);
  if (member.welcome_sent_at != null) return skip("already_sent", id);

  let claimed = false;
  try {
    claimed = await deps.db.claimWelcome(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`founders welcome claim failed id=${id}: ${message}`);
    return json({ error: "claim_failed" }, 500);
  }
  if (!claimed) return skip("not_claimed", id);

  const result = await deliver(deps, member.email, true);
  if (!result.ok) {
    console.error(`founders welcome resend failed id=${id}: ${result.detail}`);
    try {
      await deps.db.clearWelcome(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`founders welcome rollback failed id=${id}: ${message}`);
    }
    return json({ error: "resend_failed" }, 502);
  }
  return json({ sent: true }, 200);
}

function productionDeps(): HandlerDeps {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  return {
    webhookSecret: Deno.env.get("YM_WEBHOOK_SECRET"),
    resendApiKey: Deno.env.get("RESEND_API_KEY"),
    now: new Date(),
    fetchFn: fetch,
    db: createServiceDb(url, key),
  };
}

function createServiceDb(url: string, key: string): MembersDb {
  const headers = {
    apikey: key,
    authorization: `Bearer ${key}`,
    "content-type": "application/json",
  };
  return {
    async getMember(id) {
      const response = await fetch(
        `${url}/rest/v1/members?id=eq.${encodeURIComponent(id)}&select=id,email,is_deleted,welcome_sent_at`,
        { headers: { ...headers, accept: "application/json" } },
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const rows = await response.json();
      return Array.isArray(rows) && rows.length > 0 ? rows[0] as MemberRow : null;
    },
    async claimWelcome(id) {
      const response = await fetch(
        `${url}/rest/v1/members?id=eq.${encodeURIComponent(id)}&welcome_sent_at=is.null`,
        {
          method: "PATCH",
          headers: { ...headers, prefer: "return=representation" },
          body: JSON.stringify({ welcome_sent_at: new Date().toISOString() }),
        },
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const rows = await response.json();
      return Array.isArray(rows) && rows.length > 0;
    },
    async clearWelcome(id) {
      const response = await fetch(
        `${url}/rest/v1/members?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { ...headers, prefer: "return=minimal" },
          body: JSON.stringify({ welcome_sent_at: null }),
        },
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }
    },
  };
}

if (import.meta.main) {
  Deno.serve((req) => handleFoundersWelcome(req, productionDeps()));
}
