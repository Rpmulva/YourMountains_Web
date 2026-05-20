/**
 * Handles form submissions that need to be mirrored to the Supabase marketing DB.
 * Routes by form name to the correct table in yourmountains-marketing project,
 * then sends a confirmation email to the submitter and an internal alert to
 * Ryan@yourmountains.life via Resend.
 *
 * Required env vars (set in Netlify site settings):
 *   MARKETING_SUPABASE_URL  = https://jeukkkxmamedvubookiw.supabase.co
 *   MARKETING_SUPABASE_KEY  = service_role key from Supabase dashboard → Settings → API
 *   RESEND_API_KEY          = send-only API key from Resend dashboard
 *
 * To extend: add a new case to FORM_ROUTES below, a mapper function, and a
 * confirmation template in email-templates.mjs.
 */

import { Resend } from 'resend';
import { CONFIRMATION_BUILDERS, internalAlert } from './email-templates.mjs';

const SENDER = 'Ryan Mulvaney <Ryan@yourmountains.life>';
const INTERNAL_ALERT_TO = 'Ryan@yourmountains.life';

const FORM_ROUTES = {
  'form-vendor-survey': {
    table: 'vendor_survey_responses',
    map: mapVendorSurvey,
    submitterEmailFrom: (rec) => rec.email,
  },
  'form-influencer-survey': {
    table: 'influencer_survey_responses',
    map: mapInfluencerSurvey,
    submitterEmailFrom: (rec) => rec.email,
  },
  'form-core-partner-survey': {
    table: 'core_partner_survey_responses',
    map: mapCorePartnerSurvey,
    submitterEmailFrom: (rec) => rec.email,
  },
  'form-explorer-survey': {
    table: 'explorer_survey_responses',
    map: mapExplorerSurvey,
    submitterEmailFrom: (rec) => rec.email,
  },
  'form-contact-founders': {
    table: 'contact_messages',
    map: mapContactFounders,
    submitterEmailFrom: (rec) => rec.email,
  },
  'form-founders-club': {
    // FC writes through an UPSERT RPC instead of direct insert so the
    // members table can merge segment arrays on repeat submissions while
    // preserving the original member_number + created_at. See
    // database/migrations/members_marketing.sql for the RPC definition.
    table: 'members',
    map: mapFoundersClub,
    submitterEmailFrom: (rec) => rec.email,
    write: 'rpc-upsert-member',
  },
};

function mapContactFounders(body) {
  return {
    email:   body.email,
    name:    body.name    || null,
    message: body.message || null,
  };
}

function mapFoundersClub(body) {
  // Schema is now `segments text[]` on the members table. Frontend sends
  // segments as a JSON array. Defensively coerce older shapes (legacy
  // comma-string from a cached frontend bundle, or `role` field from the
  // pre-migration payload) into an array so the cutover window is safe.
  let segments = body.segments;
  if (!Array.isArray(segments)) {
    const raw = body.segments ?? body.role ?? '';
    if (Array.isArray(raw)) {
      segments = raw;
    } else if (typeof raw === 'string' && raw.trim()) {
      segments = raw.split(/,\s*/).map((s) => s.trim()).filter(Boolean);
    } else {
      segments = [];
    }
  }
  // G-2026-05-20-FC-NAMES — capture business_name (Vendor Partners) and
  // org_name (Community Anchors). Trim; empty string becomes null so the
  // DB's NULLIF in upsert_member_segments treats them identically.
  const businessName = typeof body.business_name === 'string' ? body.business_name.trim() : null;
  const orgName      = typeof body.org_name      === 'string' ? body.org_name.trim()      : null;
  return {
    email: body.email,
    segments,
    business_name: businessName || null,
    org_name:      orgName      || null,
  };
}

function mapVendorSurvey(body) {
  return {
    business_type:             body.business_type             || null,
    primary_goals:             body.primary_goals             ? (Array.isArray(body.primary_goals) ? body.primary_goals : [body.primary_goals]) : [],
    marketing_roi_score:       body.marketing_roi_score       ? parseInt(body.marketing_roi_score, 10) : null,
    biggest_pain_point:        body.biggest_pain_point        || null,
    high_intent_value:         body.high_intent_value         || null,
    commission_model_pref:     body.commission_model_pref     || null,
    fair_commission_rate:      body.fair_commission_rate      || null,
    biggest_hesitation:        body.biggest_hesitation        || null,
    partner_threshold:         body.partner_threshold         || null,
    trust_builders:            body.trust_builders            ? (Array.isArray(body.trust_builders) ? body.trust_builders : [body.trust_builders]) : [],
    mental_load_value:         body.mental_load_value         || null,
    uses_booking_software:     body.uses_booking_software     || null,
    booking_software_name:     body.booking_software_name     || null,
    open_to_discount:          body.open_to_discount          || null,
    open_to_events:            body.open_to_events            || null,
    founding_partner_interest: body.founding_partner_interest || null,
    loi_ask:                   body.loi_ask                   || null,
    business_name:             body.business_name,
    contact_person:            body.contact_person,
    email:                     body.email,
    phone:                     body.phone                     || null,
  };
}

function mapInfluencerSurvey(body) {
  const toArr = (val) => val ? (Array.isArray(val) ? val : [val]) : [];
  const toInt = (val) => val ? parseInt(val, 10) : null;
  return {
    platforms:                 toArr(body.platforms),
    total_followers:           body.total_followers           || null,
    content_niches:            toArr(body.content_niches),
    audience_location:         body.audience_location         || null,
    audience_skill_level:      body.audience_skill_level      || null,
    monetization_methods:      toArr(body.monetization_methods),
    brand_deal_frustrations:   body.brand_deal_frustrations   || null,
    promotion_values:          toArr(body.promotion_values),
    best_current_platforms:    toArr(body.best_current_platforms),
    ym_audience_value:         body.ym_audience_value         || null,
    gear_locker_interest:      body.gear_locker_interest      || null,
    compensation_model_vision: body.compensation_model_vision || null,
    desired_creator_tools:     toArr(body.desired_creator_tools),
    promotion_likelihood:      toInt(body.promotion_likelihood),
    colorado_presence:         body.colorado_presence         || null,
    event_interest:            body.event_interest            || null,
    in_person_preferences:     toArr(body.in_person_preferences),
    founding_creator_vision:   body.founding_creator_vision   || null,
    founding_creator_interest: body.founding_creator_interest || null,
    creator_name:              body.creator_name,
    social_handle:             body.social_handle,
    email:                     body.email,
  };
}

function mapCorePartnerSurvey(body) {
  const toArr = (val) => val ? (Array.isArray(val) ? val : [val]) : [];
  const toInt = (val) => val ? parseInt(val, 10) : null;
  return {
    org_type:                     body.org_type                     || null,
    geography:                    body.geography                    || null,
    audiences_served:             toArr(body.audiences_served),
    annual_reach:                 body.annual_reach                 || null,
    barriers_observed:            toArr(body.barriers_observed),
    digital_tools_effectiveness:  toInt(body.digital_tools_effectiveness),
    missing_resource:             body.missing_resource             || null,
    programming_types:            toArr(body.programming_types),
    attendance_challenge:         body.attendance_challenge         || null,
    promotion_channels:           toArr(body.promotion_channels),
    platform_promotion_value:     toInt(body.platform_promotion_value),
    relevant_platform_aspects:    toArr(body.relevant_platform_aspects),
    partnership_support_vision:   toArr(body.partnership_support_vision),
    partnership_priorities:       toArr(body.partnership_priorities),
    partnership_expectations:     body.partnership_expectations     || null,
    collaboration_openness:       body.collaboration_openness       || null,
    additional_context:           body.additional_context           || null,
    org_name:                     body.org_name,
    contact_name:                 body.contact_name,
    contact_title:                body.contact_title                || null,
    email:                        body.email,
  };
}

function mapExplorerSurvey(body) {
  const toArr = (val) => val ? (Array.isArray(val) ? val : [val]) : [];
  return {
    monthly_activity_count:     body.monthly_activity_count     || null,
    wished_activity_count:      body.wished_activity_count      || null,
    barriers_ranked:            body.barriers_ranked            || null,
    logistics_overwhelm:        body.logistics_overwhelm        || null,
    group_participation:        body.group_participation        || null,
    claire_value:               body.claire_value               || null,
    claire_booking_trust:       body.claire_booking_trust       || null,
    direction_feature_pref:     body.direction_feature_pref     || null,
    community_belief:           body.community_belief           || null,
    gear_rental_likelihood:     body.gear_rental_likelihood     || null,
    willingness:                body.willingness                || null,
    trail_buddy_interest:       body.trail_buddy_interest       || null,
    annual_subscription_spend:  body.annual_subscription_spend  || null,
    max_monthly_fee:            body.max_monthly_fee            || null,
    payment_model_pref:         body.payment_model_pref         || null,
    skill_level:                body.skill_level                || null,
    community_identities:       toArr(body.community_identities),
    open_barrier:               body.open_barrier               || null,
    existing_tool_frustrations: body.existing_tool_frustrations || null,
    founders_club_interest:     body.founders_club_interest     || null,
    email:                      body.email,
  };
}

export default async (req) => {
  console.log('form-submission: entry, method:', req.method);

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseUrl = process.env.MARKETING_SUPABASE_URL;
  const supabaseKey = process.env.MARKETING_SUPABASE_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('form-submission: MARKETING_SUPABASE_URL or MARKETING_SUPABASE_KEY not set');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!resendKey) {
    // We still want the DB write to succeed; mail is best-effort downstream.
    console.warn('form-submission: RESEND_API_KEY not set — DB write will proceed, mail will be skipped');
  }

  let body;
  try {
    body = await req.json();
  } catch {
    console.error('form-submission: invalid JSON body');
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const formName = body['form-name'] || body.form_name;
  const route = FORM_ROUTES[formName];

  if (!route) {
    console.warn('form-submission: unknown form name:', formName);
    return new Response(JSON.stringify({ error: `Unknown form: ${formName}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const record = route.map(body);
  console.log('form-submission: routed', formName, '→', route.table);

  // Lead capture into Supabase. FC route uses an UPSERT RPC for segment-union
  // semantics; all others use a direct insert.
  let memberNumber = null;
  try {
    if (route.write === 'rpc-upsert-member') {
      console.log(`[${formName}] form-submission: rpc upsert_member_segments`);
      const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/upsert_member_segments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          p_email:         record.email,
          p_segments:      record.segments,
          p_business_name: record.business_name,
          p_org_name:      record.org_name,
        }),
      });
      if (!rpcRes.ok) {
        const text = await rpcRes.text();
        console.error(`[${formName}] form-submission: upsert RPC failed`, rpcRes.status, text);
        return new Response(JSON.stringify({ error: 'Database write failed' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const arr = await rpcRes.json();
      if (Array.isArray(arr) && arr[0]) {
        memberNumber = arr[0].member_number ?? null;
        // Annotate the body so the template builder downstream can pick up
        // the canonical (DB-resolved) business_name/org_name — covers the
        // COALESCE-protect case where an existing row already had values.
        body.business_name = arr[0].business_name ?? body.business_name ?? null;
        body.org_name      = arr[0].org_name      ?? body.org_name      ?? null;
        console.log(`[${formName}] form-submission: upsert complete`, JSON.stringify({ memberNumber, wasNew: arr[0].was_new, segments: arr[0].segments }));
      }
    } else {
      console.log(`[${formName}] form-submission: writing to Supabase`, route.table);
      const res = await fetch(`${supabaseUrl}/rest/v1/${route.table}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(record),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`[${formName}] form-submission: Supabase insert failed`, res.status, text);
        return new Response(JSON.stringify({ error: 'Database insert failed' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Lead capture success is decoupled from email-send success.
    //    DB write is the source of truth: row exists ⇒ frontend gets 200.
    //    Email is best-effort; any failure is logged and surfaced in the
    //    response body (`emailSent` + `errors`) but never causes a 5xx.
    //    AC#6 — frontend must not show "didn't go through" when row landed.
    let emailSent = { confirmation: null, internal: null };
    const mailErrors = [];
    if (resendKey) {
      try {
        emailSent = await sendMails({ resendKey, formName, route, record, body, mailErrors });
      } catch (err) {
        // Final safety net — should never trip given sendMails' own guards,
        // but keep it so a thrown template build can't ever surface as 5xx.
        console.error(`[${formName}] form-submission: sendMails outer catch`, err);
        mailErrors.push({ stage: 'sendMails-outer', message: String(err?.message ?? err) });
      }
    } else {
      console.warn(`[${formName}] form-submission: skipping mail — RESEND_API_KEY missing`);
    }

    return new Response(
      JSON.stringify({ ok: true, leadSaved: true, memberNumber, emailSent, errors: mailErrors }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error(`[${formName ?? 'unknown'}] form-submission: unhandled error before/at DB write`, err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

async function sendMails({ resendKey, formName, route, record, body, mailErrors }) {
  const resend = new Resend(resendKey);
  const submittedAt = new Date().toISOString();
  const result = { confirmation: null, internal: null };

  // ─── Internal alert ─────────────────────────────────────────────────────
  try {
    const alert = internalAlert({ formName, submittedAt, record });
    console.log(`[${formName}] sending internal alert to`, INTERNAL_ALERT_TO);
    const r = await resend.emails.send({
      from: SENDER,
      to: INTERNAL_ALERT_TO,
      subject: alert.subject,
      text: alert.text,
    });
    if (r?.error) {
      console.error(`[${formName}] internal alert Resend error`, JSON.stringify(r.error));
      mailErrors.push({ stage: 'internal-alert', message: r.error?.message ?? String(r.error), code: r.error?.statusCode });
      result.internal = false;
    } else {
      console.log(`[${formName}] internal alert sent`, r?.data?.id ?? '(no id)');
      result.internal = true;
    }
  } catch (err) {
    console.error(`[${formName}] internal alert threw`, err);
    mailErrors.push({ stage: 'internal-alert-throw', message: String(err?.message ?? err) });
    result.internal = false;
  }

  // ─── Submitter confirmation ─────────────────────────────────────────────
  const builder = CONFIRMATION_BUILDERS[formName];
  const to = route.submitterEmailFrom(record);

  if (!to) {
    console.warn(`[${formName}] no submitter email on record — skipping confirmation`);
    result.confirmation = 'skipped-no-email';
    return result;
  }
  if (!builder) {
    console.warn(`[${formName}] no confirmation builder registered — skipping confirmation`);
    result.confirmation = 'skipped-no-template';
    return result;
  }

  let template;
  try {
    template = builder(body);
  } catch (err) {
    console.error(`[${formName}] confirmation template build threw`, err);
    mailErrors.push({ stage: 'template-build', message: String(err?.message ?? err) });
    result.confirmation = false;
    return result;
  }

  try {
    console.log(`[${formName}] sending confirmation to`, to);
    const r = await resend.emails.send({
      from: SENDER,
      to,
      replyTo: 'Ryan@yourmountains.life',
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    if (r?.error) {
      // Surface the full error shape — this is the critical log for diagnosing
      // why surveys don't deliver. Resend errors include name + message + statusCode.
      console.error(`[${formName}] confirmation Resend error`, JSON.stringify(r.error));
      mailErrors.push({ stage: 'confirmation', message: r.error?.message ?? String(r.error), code: r.error?.statusCode, name: r.error?.name });
      result.confirmation = false;
    } else {
      console.log(`[${formName}] confirmation sent`, r?.data?.id ?? '(no id)');
      result.confirmation = true;
    }
  } catch (err) {
    console.error(`[${formName}] confirmation send threw`, err);
    mailErrors.push({ stage: 'confirmation-throw', message: String(err?.message ?? err) });
    result.confirmation = false;
  }

  return result;
}
