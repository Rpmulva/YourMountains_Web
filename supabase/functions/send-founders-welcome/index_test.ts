import { WELCOME_TEMPLATE_HTML } from "./template.ts";
import {
  type HandlerDeps,
  type MemberRow,
  type MembersDb,
  formatSendDate,
  handleFoundersWelcome,
  renderWelcomeHtml,
} from "./index.ts";

const SECRET = "test-webhook-secret";
const EXPECTED_TEMPLATE_SHA256 = "bfe7e0e79a8f71e405b59a4009df8d944590a96ae5e0ecbf81055473510e1a93";

function denverDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 19, 0, 0));
}

function member(overrides: Partial<MemberRow> = {}): MemberRow {
  return {
    id: "member-1",
    email: "member@example.com",
    is_deleted: false,
    welcome_sent_at: null,
    ...overrides,
  };
}

function harness(row: MemberRow | null = member()) {
  const warnings: string[] = [];
  const errors: string[] = [];
  const dbCalls = { get: 0, claim: 0, clear: 0 };
  let claimResult = true;
  const sends: Array<Record<string, unknown>> = [];
  let resendStatus = 200;
  let resendBody = "{\"id\":\"email_test\"}";
  const db: MembersDb = {
    getMember() {
      dbCalls.get += 1;
      return Promise.resolve(row);
    },
    claimWelcome() {
      dbCalls.claim += 1;
      return Promise.resolve(claimResult);
    },
    clearWelcome() {
      dbCalls.clear += 1;
      return Promise.resolve();
    },
  };
  const deps: HandlerDeps = {
    webhookSecret: SECRET,
    resendApiKey: "re_test",
    now: denverDate(2026, 11, 11),
    fetchFn: (_input, init) => {
      sends.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
      return Promise.resolve(new Response(resendBody, { status: resendStatus }));
    },
    db,
  };
  const warn = console.warn;
  const error = console.error;
  console.warn = (...args: unknown[]) => {
    warnings.push(args.map(String).join(" "));
  };
  console.error = (...args: unknown[]) => {
    errors.push(args.map(String).join(" "));
  };
  return {
    deps,
    dbCalls,
    warnings,
    errors,
    sends,
    setClaim(value: boolean) {
      claimResult = value;
    },
    setResend(status: number, body: string) {
      resendStatus = status;
      resendBody = body;
    },
    restore() {
      console.warn = warn;
      console.error = error;
    },
  };
}

function request(body: unknown, secret: string | null = SECRET): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (secret !== null) headers.set("x-ym-webhook-secret", secret);
  return new Request("https://example.test/send-founders-welcome", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

function insertBody(id = "member-1") {
  return { type: "INSERT", table: "members", record: { id } };
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.test("template string matches the approved file", async () => {
  const digest = await sha256(WELCOME_TEMPLATE_HTML);
  if (digest !== EXPECTED_TEMPLATE_SHA256) {
    throw new Error(`template sha256 ${digest}`);
  }
});

const dates: Array<[number, number, number, string]> = [
  [2026, 1, 1, "Jan 1st, 2026"],
  [2026, 1, 2, "Jan 2nd, 2026"],
  [2026, 1, 3, "Jan 3rd, 2026"],
  [2026, 1, 11, "Jan 11th, 2026"],
  [2026, 1, 12, "Jan 12th, 2026"],
  [2026, 1, 13, "Jan 13th, 2026"],
  [2026, 1, 21, "Jan 21st, 2026"],
  [2026, 1, 22, "Jan 22nd, 2026"],
  [2026, 1, 31, "Jan 31st, 2026"],
  [2026, 11, 11, "Nov 11th, 2026"],
];

for (const [year, month, day, expected] of dates) {
  Deno.test(`send date ${expected}`, () => {
    const actual = formatSendDate(denverDate(year, month, day));
    if (actual !== expected) throw new Error(`${actual} !== ${expected}`);
  });
}

Deno.test("skips a null email without claiming or sending", async () => {
  const box = harness(member({ email: null }));
  try {
    const response = await handleFoundersWelcome(request(insertBody()), box.deps);
    if (response.status !== 200) throw new Error(String(response.status));
    const body = await response.json();
    if (body.reason !== "invalid_email") throw new Error(JSON.stringify(body));
    if (box.dbCalls.claim !== 0 || box.sends.length !== 0) throw new Error("email was not skipped");
    if (!box.warnings.some((line) => line.includes("invalid_email"))) throw new Error("reason was not logged");
  } finally {
    box.restore();
  }
});

Deno.test("skips an email with no @", async () => {
  const box = harness(member({ email: "not-an-email" }));
  try {
    const response = await handleFoundersWelcome(request(insertBody()), box.deps);
    const body = await response.json();
    if (response.status !== 200 || body.reason !== "invalid_email") throw new Error(JSON.stringify(body));
    if (box.dbCalls.claim !== 0 || box.sends.length !== 0) throw new Error("email was not skipped");
  } finally {
    box.restore();
  }
});

Deno.test("skips a deleted member", async () => {
  const box = harness(member({ is_deleted: true }));
  try {
    const response = await handleFoundersWelcome(request(insertBody()), box.deps);
    const body = await response.json();
    if (response.status !== 200 || body.reason !== "deleted") throw new Error(JSON.stringify(body));
    if (box.dbCalls.claim !== 0 || box.sends.length !== 0) throw new Error("deleted member was not skipped");
    if (!box.warnings.some((line) => line.includes("deleted"))) throw new Error("reason was not logged");
  } finally {
    box.restore();
  }
});

Deno.test("skips when welcome_sent_at is already set", async () => {
  const box = harness(member({ welcome_sent_at: "2026-11-11T00:00:00Z" }));
  try {
    const response = await handleFoundersWelcome(request(insertBody()), box.deps);
    const body = await response.json();
    if (response.status !== 200 || body.reason !== "already_sent") throw new Error(JSON.stringify(body));
    if (box.dbCalls.claim !== 0 || box.sends.length !== 0) throw new Error("sent member was not skipped");
  } finally {
    box.restore();
  }
});

Deno.test("claim guard skips when the update returns no row", async () => {
  const box = harness();
  box.setClaim(false);
  try {
    const response = await handleFoundersWelcome(request(insertBody()), box.deps);
    const body = await response.json();
    if (response.status !== 200 || body.reason !== "not_claimed") throw new Error(JSON.stringify(body));
    if (box.dbCalls.claim !== 1 || box.sends.length !== 0 || box.dbCalls.clear !== 0) {
      throw new Error("claim guard did not stop the send");
    }
  } finally {
    box.restore();
  }
});

Deno.test("Resend failure clears welcome_sent_at and returns 502", async () => {
  const box = harness();
  box.setResend(502, "resend rejected the message");
  try {
    const response = await handleFoundersWelcome(request(insertBody()), box.deps);
    if (response.status !== 502) throw new Error(String(response.status));
    if (box.dbCalls.claim !== 1 || box.dbCalls.clear !== 1) throw new Error("welcome claim was not rolled back");
    if (!box.errors.some((line) => line.includes("resend rejected the message"))) {
      throw new Error("Resend error was not logged");
    }
  } finally {
    box.restore();
  }
});

Deno.test("test mode sends only to Ryan and does not touch the table", async () => {
  const box = harness();
  try {
    const response = await handleFoundersWelcome(request({ test: true }), box.deps);
    const body = await response.json();
    if (response.status !== 200 || body.test !== true) throw new Error(JSON.stringify(body));
    if (box.dbCalls.get !== 0 || box.dbCalls.claim !== 0 || box.dbCalls.clear !== 0) {
      throw new Error("test mode touched the table");
    }
    if (box.sends.length !== 1) throw new Error("test email was not sent");
    const mail = box.sends[0];
    if (JSON.stringify(mail.to) !== JSON.stringify(["ryan@yourmountains.life"])) {
      throw new Error(`unexpected to ${JSON.stringify(mail.to)}`);
    }
    if ("bcc" in mail) throw new Error("test mode included a bcc");
    const html = String(mail.html);
    if (html.includes("{{")) throw new Error("token left in test html");
    if (!html.includes("Nov 11th, 2026")) throw new Error("send date missing");
    if (!String(mail.text).includes("Welcome to the Founder's Club")) throw new Error("plain text missing copy");
    if (String(mail.text).includes("Do not restyle")) throw new Error("template comment leaked into text");
  } finally {
    box.restore();
  }
});

Deno.test("sent html has no unreplaced token", () => {
  const html = renderWelcomeHtml(denverDate(2026, 11, 11));
  if (html.includes("{{")) throw new Error("token left after render");
  if (!html.includes("Nov 11th, 2026")) throw new Error("date was not rendered");
  if ((WELCOME_TEMPLATE_HTML.match(/\{\{SEND_DATE\}\}/g) ?? []).length !== 2) {
    throw new Error("template token count changed");
  }
});

Deno.test("missing webhook secret is rejected", async () => {
  const box = harness();
  try {
    const response = await handleFoundersWelcome(request(insertBody(), null), box.deps);
    if (response.status !== 401) throw new Error(String(response.status));
    if (box.dbCalls.get !== 0 || box.sends.length !== 0) throw new Error("unauthorized request was processed");
  } finally {
    box.restore();
  }
});
