/**
 * Handles form submissions that need to be mirrored to the Supabase marketing DB.
 * Routes by form name to the correct table in yourmountains-marketing project.
 *
 * Required env vars (set in Netlify site settings):
 *   MARKETING_SUPABASE_URL  = https://jeukkkxmamedvubookiw.supabase.co
 *   MARKETING_SUPABASE_KEY  = service_role key from Supabase dashboard → Settings → API
 *
 * To extend: add a new case to FORM_ROUTES below and a mapper function.
 */

const FORM_ROUTES = {
  'form-vendor-survey': {
    table: 'vendor_survey_responses',
    map: mapVendorSurvey,
  },
  // Future forms:
  // 'founders-signup': { table: 'founders_signups', map: mapFoundersSignup },
  // 'contact':         { table: 'contact_messages', map: mapContact },
};

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

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseUrl = process.env.MARKETING_SUPABASE_URL;
  const supabaseKey = process.env.MARKETING_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('MARKETING_SUPABASE_URL or MARKETING_SUPABASE_KEY not set');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
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

  try {
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
      console.error('Supabase insert failed:', res.status, text);
      return new Response(JSON.stringify({ error: 'Database insert failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('form-submission error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
