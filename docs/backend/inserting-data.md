# Inserting Data (Committing Entries)

You **don’t write SQL in the app** to add rows. You use the **Supabase client in TypeScript**: it runs the right SQL for you.

---

## 1. User table (when someone creates an account)

**Flow:**

1. App calls **Supabase Auth** (e.g. `signUp`).
2. Supabase inserts into **`auth.users`** (its built‑in table).
3. A **database trigger** in your schema runs and inserts a row into **`public.users`**.

So the **user table** row is created by the trigger; you never `INSERT` into `public.users` yourself from the app.

**In the app you only do:**

```ts
import { supabase } from '../lib/supabase';

// Sign up (creates auth.users row → trigger creates public.users row)
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secret123',
  options: {
    data: { name: 'Jane' },  // goes into public.users via trigger
  },
});
```

The trigger in `database/schema.sql` is:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

`handle_new_user()` does the `INSERT INTO public.users (...)`.

---

## 2. Other tables (e.g. diary entries, posts)

For **your** tables (`diary_entries`, `feed_posts`, etc.), you **insert from TypeScript** using the Supabase client:

```ts
import { supabase } from '../lib/supabase';

// Get current user (must be signed in)
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error('Not signed in');

// Insert one row
const { data, error } = await supabase
  .from('diary_entries')
  .insert({
    user_id: user.id,
    date: '2025-02-03',
    type: 'Hike',
    duration: '1:30',
    distance: '4.2 mi',
    max_speed: '12 mph',
  })
  .select()
  .single();

if (error) throw error;
// data = the new row
```

- **user table**: add by **Supabase Auth + trigger** (no direct INSERT from app).
- **Other tables**: add by **`supabase.from('table').insert({ ... })`** in TypeScript.

---

## Summary

| Goal                         | Where it happens | How |
|-----------------------------|------------------|-----|
| Add user to `public.users`  | DB trigger       | Use `supabase.auth.signUp()` in app; trigger does the INSERT. |
| Add diary entry             | App (TypeScript) | `supabase.from('diary_entries').insert({ ... })`. |
| Add feed post               | App (TypeScript) | `supabase.from('feed_posts').insert({ ... })`. |

You use **TypeScript** in the app to “commit” entries; **SQL** is only for defining tables and the trigger.
