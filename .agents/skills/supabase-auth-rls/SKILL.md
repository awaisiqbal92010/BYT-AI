---
name: supabase-auth-rls
description: Managing Supabase Authentication, Row Level Security (RLS) policies, session cookies, and user profiles.
---

# Supabase Auth & RLS Skill

Use this skill when implementing authentication, user session persistence, and Postgres security policies with Supabase.

## Guidelines

1. **Client vs Server Supabase Clients**
   - Use `@supabase/ssr` with `createServerClient` in Server Components, Route Handlers, and Middleware.
   - Use `createBrowserClient` in Client Components.

2. **Row Level Security (RLS)**
   - Always enable RLS on every table: `ALTER TABLE tableName ENABLE ROW LEVEL SECURITY;`
   - Grant users access only to their own rows:
     ```sql
     CREATE POLICY "Users can manage own records" ON projects
     FOR ALL USING (auth.uid() = user_id);
     ```

3. **Session Cookies & Middleware**
   - Refresh auth tokens in `middleware.ts` to keep user sessions alive across page transitions.
