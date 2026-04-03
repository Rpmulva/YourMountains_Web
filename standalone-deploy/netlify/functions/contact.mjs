/**
 * Proxies Contact Founders form to Power Automate (YM Messages) so the browser
 * makes a same-origin request and avoids CORS. Set MS_FLOW_MESSAGES_URL in
 * Netlify env to your Power Automate HTTP trigger for YM Messages.
 */
export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const url = process.env.MS_FLOW_MESSAGES_URL;
  if (!url) {
    console.error("MS_FLOW_MESSAGES_URL is not set");
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
    console.error("Contact proxy error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to reach contact service" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
};
