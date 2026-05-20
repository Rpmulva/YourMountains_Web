/**
 * Resend email templates for the six marketing form submissions.
 *
 * Each export returns { subject, html, text } so the function can hand them
 * directly to resend. Confirmations go to the submitter and are signed
 * personally by Ryan to match the Ryan@yourmountains.life sender identity.
 *
 * Constraints (per brief v2):
 *   - minimal HTML, brand orange #db7947 as accent only
 *   - sentence case, no marketing fluff
 *   - one-line "what happens next"
 *   - personally signed
 *   - includes submitter name when available
 */

const ACCENT = '#db7947';
const SIGNOFF = `<p style="margin:24px 0 0 0;color:#111;">Talk soon,<br/>Ryan</p>
<p style="margin:4px 0 0 0;color:#555;font-size:13px;">Ryan Mulvaney · Founder, YourMountains</p>`;

function shell({ heading, body }) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111;line-height:1.5;">
<div style="max-width:560px;margin:0 auto;padding:32px 24px;">
<h1 style="margin:0 0 16px 0;font-size:22px;font-weight:700;color:${ACCENT};">${heading}</h1>
${body}
${SIGNOFF}
</div>
</body></html>`;
}

function firstName(name) {
  if (!name) return null;
  return String(name).trim().split(/\s+/)[0] || null;
}

function greeting(name) {
  const fn = firstName(name);
  return fn ? `<p style="margin:0 0 12px 0;">Hi ${escapeHtml(fn)},</p>` : '';
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Confirmation templates (one per form) ───────────────────────────────────

export function contactFoundersConfirmation(body) {
  return {
    subject: 'Got your note',
    html: shell({
      heading: 'Got your note',
      body: `${greeting(body.name)}
<p style="margin:0 0 12px 0;">Thanks for reaching out. Your message landed in my inbox and I'll personally reply within a couple of days.</p>
<p style="margin:0 0 12px 0;color:#555;">What happens next: I read every contact submission myself. If you need a faster reply, just respond to this email.</p>`,
    }),
    text: `Thanks for reaching out. Your message landed in my inbox and I'll personally reply within a couple of days. What happens next: I read every contact submission myself. — Ryan`,
  };
}

export function foundersClubConfirmation(body) {
  // Defensive normalization: role may arrive as string (canonical), array
  // (future/alternate clients), or null. Always render as a comma-joined
  // string so the template literal never throws on unexpected shape.
  const raw = body.role ?? body.segments ?? '';
  const role = Array.isArray(raw) ? raw.join(', ') : String(raw);

  // G-2026-05-20-FC-NAMES — merge vars with payload-assembly fallbacks
  // (Resend doesn't support Liquid |default; we inject defaults here so
  // template body never sees a literal {{var|default}}). Empty string and
  // null treated identically. Per scope limit, the current HTML body below
  // does not reference these vars yet — Claudia's Welcome Experience
  // workstream owns the actual copy. Variables are exposed via the
  // returned object so future template revisions can drop them in.
  const businessName = (typeof body.business_name === 'string' && body.business_name.trim())
    ? body.business_name.trim()
    : 'your business';
  const orgName = (typeof body.org_name === 'string' && body.org_name.trim())
    ? body.org_name.trim()
    : 'your organization';
  return {
    subject: "You're on the Founder's Club list",
    html: shell({
      heading: "You're in",
      body: `${greeting(body.name)}
<p style="margin:0 0 12px 0;">You're on the Founder's Club waitlist${role ? ` as <strong style="color:${ACCENT};">${escapeHtml(role)}</strong>` : ''}.</p>
<p style="margin:0 0 12px 0;color:#555;">What happens next: I'll reach out with early access details and founding member perks before the public beta opens.</p>`,
    }),
    text: `You're on the Founder's Club waitlist${role ? ` as ${role}` : ''}. What happens next: I'll reach out with early access details and founding member perks before the public beta opens. — Ryan`,
    // Merge vars exposed for the next Welcome Experience revision. Defaults
    // pre-applied — template author can reference these directly without
    // a Liquid fallback pipe.
    mergeVars: {
      business_name: businessName,
      org_name:      orgName,
    },
  };
}

export function vendorSurveyConfirmation(body) {
  return {
    subject: 'Thanks for the vendor survey',
    html: shell({
      heading: 'Thanks for taking the time',
      body: `${greeting(body.contact_person)}
<p style="margin:0 0 12px 0;">Your survey response on running ${body.business_name ? `<strong>${escapeHtml(body.business_name)}</strong>` : 'your business'} is in. This is exactly the kind of detail I need to design the partnership model right.</p>
<p style="margin:0 0 12px 0;color:#555;">What happens next: I'll be in touch directly if there's a fit for the founding partner cohort.</p>`,
    }),
    text: `Your vendor survey response is in. Exactly the kind of detail I need to design the partnership model right. What happens next: I'll be in touch directly if there's a fit for the founding partner cohort. — Ryan`,
  };
}

export function influencerSurveyConfirmation(body) {
  return {
    subject: 'Thanks for the creator survey',
    html: shell({
      heading: 'Thanks for sharing',
      body: `${greeting(body.creator_name)}
<p style="margin:0 0 12px 0;">Your creator survey is in. Your perspective on how the platform should serve outdoor creators is what shapes the founding creator program.</p>
<p style="margin:0 0 12px 0;color:#555;">What happens next: I'll reach out personally if there's a fit for the founding creator cohort.</p>`,
    }),
    text: `Your creator survey is in. Your perspective on how the platform should serve outdoor creators shapes the founding creator program. What happens next: I'll reach out personally if there's a fit. — Ryan`,
  };
}

export function corePartnerSurveyConfirmation(body) {
  return {
    subject: 'Thanks for the partner survey',
    html: shell({
      heading: 'Thanks for the partner survey',
      body: `${greeting(body.contact_name)}
<p style="margin:0 0 12px 0;">Your survey on behalf of ${body.org_name ? `<strong>${escapeHtml(body.org_name)}</strong>` : 'your organization'} is in. Community anchors like you are central to how this works.</p>
<p style="margin:0 0 12px 0;color:#555;">What happens next: I'll follow up with the next round of partner conversations in the coming weeks.</p>`,
    }),
    text: `Your partner survey response is in. Community anchors like you are central to how this works. What happens next: I'll follow up with the next round of partner conversations soon. — Ryan`,
  };
}

export function explorerSurveyConfirmation(body) {
  return {
    subject: 'Thanks for the explorer survey',
    html: shell({
      heading: 'Thanks for taking the time',
      body: `${greeting(body.name)}
<p style="margin:0 0 12px 0;">Your explorer survey is in. Real explorer input is what keeps the product honest — every answer here shapes what we build first.</p>
<p style="margin:0 0 12px 0;color:#555;">What happens next: founding explorer details will come your way before public beta.</p>`,
    }),
    text: `Your explorer survey is in. Real explorer input keeps the product honest — every answer shapes what we build first. What happens next: founding explorer details will come before public beta. — Ryan`,
  };
}

// ─── Internal alert (single parametrized template) ───────────────────────────

export function internalAlert({ formName, submittedAt, record }) {
  const lines = [
    `Form submission: ${formName}`,
    `Timestamp:       ${submittedAt}`,
    `─────────────────────────────────────`,
  ];
  for (const [k, v] of Object.entries(record)) {
    if (v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) continue;
    const val = Array.isArray(v) ? v.join(', ') : String(v);
    lines.push(`${k.padEnd(28)} ${val}`);
  }
  return {
    subject: `[YM form] ${formName}`,
    text: lines.join('\n'),
  };
}

// ─── Confirmation router ────────────────────────────────────────────────────

export const CONFIRMATION_BUILDERS = {
  'form-contact-founders':   contactFoundersConfirmation,
  'form-founders-club':      foundersClubConfirmation,
  'form-vendor-survey':      vendorSurveyConfirmation,
  'form-influencer-survey':  influencerSurveyConfirmation,
  'form-core-partner-survey': corePartnerSurveyConfirmation,
  'form-explorer-survey':    explorerSurveyConfirmation,
};
