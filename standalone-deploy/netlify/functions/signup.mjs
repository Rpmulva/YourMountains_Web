/**
 * Proxies Founder's Club signup to Power Automate (YM Signup List). Browser
 * makes same-origin request to avoid CORS. Set MS_FLOW_SIGNUP_URL in Netlify
 * env to your Power Automate HTTP trigger URL that writes to YM Signup List.
 */
export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const url = process.env.MS_FLOW_SIGNUP_URL;
  if (!url) {
    console.error("MS_FLOW_SIGNUP_URL is not set");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const body = await req.text();
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const text = await response.text();
    return new Response(text, {
      status: response.status,
      statusText: response.statusText,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Signup proxy error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to reach signup service" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
};
