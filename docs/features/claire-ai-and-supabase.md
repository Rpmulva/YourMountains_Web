# How Supabase Supports Claire AI

Claire is your custom in-app AI. **Supabase doesn’t run the AI model** (no built-in LLM). It supports Claire by handling **conversation storage**, **auth**, and **server-side API calls** to a real AI provider (OpenAI, Anthropic, etc.).

---

## What Supabase Does for Claire

| Role | How Supabase helps |
|------|--------------------|
| **Who is talking** | Uses `auth.uid()` so every conversation is tied to a user. |
| **Conversation history** | Table `claire_conversations` stores threads (messages as JSONB). |
| **Calling the real AI** | Edge Function runs your code that calls OpenAI/Anthropic; API keys stay on the server. |
| **Custom context** | You can load user profile, location, or preferences from the DB and send them to the LLM. |

So: **Supabase = storage + auth + a secure place to call the LLM.** The “brain” is still an external API (OpenAI, Anthropic, etc.).

---

## Architecture (with Supabase)

```
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  App       │     │  Supabase            │     │  AI Provider     │
│  (Claire   │────▶│  Edge Function       │────▶│  (OpenAI,       │
│   UI)      │     │  (your server code)   │     │   Anthropic…)   │
│            │◀────│  - read/write DB      │◀────│                 │
└─────────────┘     │  - call LLM API      │     └─────────────────┘
                    │  - keep API key safe │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Supabase DB         │
                    │  - claire_conversations
                    │  - users (for context)│
                    └──────────────────────┘
```

1. **App** sends the user message (and optional `conversation_id`) to a **Supabase Edge Function**.
2. **Edge Function** (TypeScript/Deno):
   - Optionally loads or creates a row in `claire_conversations` (so you have history).
   - Calls OpenAI/Anthropic with the message (and past messages / user context if you want).
   - Saves the new turn (user + assistant messages) into `claire_conversations`.
   - Returns the assistant reply to the app.
3. **App** shows the reply in the Claire UI (and can optionally load history from Supabase).

So Supabase supports Claire by: **storing conversations**, **knowing the user**, and **hosting the code that talks to the real AI**.

---

## What You Already Have (schema)

In `database/schema.sql` you have:

```sql
-- Claire Conversations (AI chat history)
CREATE TABLE IF NOT EXISTS public.claire_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  messages JSONB NOT NULL,   -- array of { id, text, sender, timestamp }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

So Supabase is already set up to **store** Claire threads per user. You just need to:

- Call an Edge Function (or your own backend) to get the next reply.
- In that function, call the LLM and then **insert or update** `claire_conversations`.

---

## What You’d Add

1. **Supabase Edge Function** (e.g. `claire-chat`)
   - Input: `{ message: string, conversationId?: string }` (and auth from Supabase).
   - Load or create `claire_conversations` row for this user.
   - Build a messages array for the LLM (e.g. last N turns + system prompt).
   - Call OpenAI/Anthropic; append user + assistant messages to the row; return assistant reply.

2. **App**
   - Replace the mock `getClaireResponse` with a call to that Edge Function (e.g. `supabase.functions.invoke('claire-chat', { body: { message, conversationId } })`).
   - Optionally load conversation history from `claire_conversations` when opening Claire.

3. **Secrets**
   - Store the LLM API key in Supabase (e.g. Edge Function secrets). Never put it in the app.

---

## Summary

- **Supabase supports Claire** by: storing conversations in `claire_conversations`, identifying the user via auth, and running server-side logic (Edge Function) that calls your chosen AI provider and keeps keys safe.
- **The “custom Claire AI”** is: your prompts + your context (user, location, etc.) + a real LLM (OpenAI/Anthropic, etc.). Supabase is the backend layer that ties that to your app and your database.

If you want, next step can be a minimal Edge Function example (e.g. “claire-chat” with OpenAI) and the exact `supabase.functions.invoke` call from `ClaireExperience`.
