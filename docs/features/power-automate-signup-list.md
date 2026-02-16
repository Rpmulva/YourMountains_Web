# Power Automate: YM Signup List (Founder's Club)

If SharePoint list rows are created but **blank** (no email, role, etc.), the flow is receiving the request but not mapping the body to columns.

---

## Step 1: Set up the HTTP trigger to parse the JSON body

You need to tell the **"When a HTTP request is received"** trigger what JSON shape to expect so it can expose `email`, `role`, etc. to the rest of the flow.

### 1.1 Open the trigger

1. Open your YM Signup List flow in Power Automate.
2. Click the first step: **"When a HTTP request is received"**.

### 1.2 Use sample payload to generate schema (easiest)

1. In the trigger card, look for a link that says **"Use sample payload to generate schema"** and click it.  
   (If you don’t see it, scroll in the trigger or look under **Request Body JSON Schema** for an option to add a sample.)
2. A text box will open. **Copy and paste this exact sample** (same shape the website sends):

```json
{
  "email": "user@example.com",
  "role": "explorer",
  "message": "",
  "form_source": "Signup",
  "date": "2025-02-12T20:00:00.000Z"
}
```

3. Click **Done** (or **OK**).  
   Power Automate will generate the **Request Body JSON Schema** from this sample.
4. Click **Save** on the flow.

You should now see **email**, **role**, **message**, **form_source**, and **date** available as dynamic content in the next steps.

### 1.3 If you only have "Request Body JSON Schema" (no sample option)

Some flows only show a **Request Body JSON Schema** box:

1. Click inside **Request Body JSON Schema**.
2. Paste this **entire** schema (replace anything that’s there):

```json
{
  "type": "object",
  "properties": {
    "email": { "type": "string" },
    "role": { "type": "string" },
    "message": { "type": "string" },
    "form_source": { "type": "string" },
    "date": { "type": "string" }
  }
}
```

3. Click **Save** on the flow.

---

## Step 2: Map the parsed body to SharePoint (Create item)

In the step that creates the SharePoint list item (e.g. **Create item** or **Add row**):

1. For each column, choose **dynamic content** from the trigger, or use an expression.
2. Map like this (use the **exact** lowercase names):

| SharePoint column (example) | Value / expression |
|-----------------------------|--------------------|
| Title (if required)         | `triggerBody()?['email']` or email from dynamic content |
| Email                      | `triggerBody()?['email']` |
| Role                       | `triggerBody()?['role']` |
| Form Source (if you have it) | `triggerBody()?['form_source']` |
| Date (if you have it)      | `triggerBody()?['date']` |

3. Property names from the website are **lowercase**: `email`, `role`, `form_source`, `date`. Use those in expressions (e.g. `triggerBody()?['email']`, not `triggerBody()?['Email']`).

Save the flow and run a test signup from the site; the new row should show email, role, and other mapped fields.

---

## Reference: request body the website sends

- **email** – string  
- **role** – `"explorer"` | `"vendor"` | `"both"`  
- **message** – always `""` for signup  
- **form_source** – `"Signup"`  
- **date** – ISO 8601 string (e.g. `2025-02-12T20:00:00.000Z`)
