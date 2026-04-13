# Backend

This folder now contains the Supabase schema setup needed by the frontend.

Run the SQL in [supabase/migrations/001_public_portal_tables.sql](supabase/migrations/001_public_portal_tables.sql) inside the Supabase SQL Editor for your project.

That migration creates the missing public tables currently referenced by the frontend:

- `attendance`
- `fees`
- `teachers`
- `events`
- `app_settings`
- `chat_messages`
- `scores`
- `results`

It also adds indexes, `updated_at` triggers, and permissive RLS policies so the current frontend anon key can read and write those tables.

Security note: the generated policies are intentionally open because the current app already uses public client-side reads and writes. For production, replace them with proper authenticated policies.
