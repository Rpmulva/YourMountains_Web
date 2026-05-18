/**
 * Handles form submissions that need to be mirrored to the Supabase marketing DB.
 * Routes by form name to the correct table in yourmountains-marketing project,
 * then sends a confirmation email to the submitter and an internal alert to
 * rpmulva@gmail.com via Resend.
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

const SENDER = 'Ryan Mulvaney <Ryan@YourMountains.Life>';
const INTERNAL_ALERT_TO = 'rpmulva@gmail.com';

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
    table: 'founders_club_signups',
    map: mapFoundersClub,
    submitterEmailFrom: (rec) => rec.email,
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
  // Frontend collects multi-select `segments` (joined string). Brief schema
  // is `role text` — single column, so we store the joined value here.
  return {
    email: body.email,
    role:  body.role || body.segments || null,
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

  try {
    console.log('form-submission: writing to Supabase', route.table);
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
      console.error('form-submission: Supabase insert failed', res.status, text);
      return new Response(JSON.stringify({ error: 'Database insert failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ── Best-effort email send. DB write is the source of truth; if mail
    //    fails we log and still return success so the user gets the
    //    thank-you state. AC#7/AC#8 verification depends on watching logs.
    if (resendKey) {
      await sendMails({
        resendKey,
        formName,
        route,
        record,
        body,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('form-submission: unhandled error', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

async function sendMails({ resendKey, formName, route, record, body }) {
  const resend = new Resend(resendKey);
  const submittedAt = new Date().toISOString();

  // Internal alert — always sent.
  const alert = internalAlert({ formName, submittedAt, record });
  try {
    console.log('form-submission: sending internal alert to', INTERNAL_ALERT_TO);
    const r = await resend.emails.send({
      from: SENDER,
      to: INTERNAL_ALERT_TO,
      subject: alert.subject,
      text: alert.text,
    });
    if (r?.error) console.error('form-submission: internal alert send error', r.error);
  } catch (err) {
    console.error('form-submission: internal alert threw', err);
  }

  // Submitter confirmation — only when we have an email and a template.
  const builder = CONFIRMATION_BUILDERS[formName];
  const to = route.submitterEmailFrom(record);
  if (builder && to) {
    const template = builder(body);
    try {
      console.log('form-submission: sending confirmation to', to);
      const r = await resend.emails.send({
        from: SENDER,
        to,
        replyTo: 'Ryan@YourMountains.Life',
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
      if (r?.error) console.error('form-submission: confirmation send error', r.error);
    } catch (err) {
      console.error('form-submission: confirmation threw', err);
    }
  } else if (!to) {
    console.warn('form-submission: no submitter email on record — skipping confirmation');
  }
}
