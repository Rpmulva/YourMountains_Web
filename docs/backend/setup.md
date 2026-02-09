# Backend Database Setup Guide

## Recommended: Supabase

Supabase is the best choice for your Expo app because:
- ✅ PostgreSQL database (real SQL)
- ✅ Built-in authentication (replaces your mock auth)
- ✅ Real-time subscriptions
- ✅ File storage for images
- ✅ Generous free tier
- ✅ Great React Native support

## Quick Setup Steps

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Sign up (free)
3. Create a new project
4. Note your project URL and anon key (Settings > API)

### 2. Install Supabase Client
```bash
npx expo install @supabase/supabase-js expo-constants
```

Note: `expo-constants` is likely already installed, but included for completeness.

### 3. Set Up Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Supabase credentials to `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Restart your Expo dev server for changes to take effect.

### 4. Set Up Database Schema
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Run the SQL script to create all tables and policies

### 5. Project Files
- ✅ Database schema is ready (`database/schema.sql`)
- ✅ Supabase client is configured (`lib/supabase.ts`)
- ✅ Example service created (`services/diaryService.ts`)

### 6. Next Steps
- 🔄 Replace mock auth with Supabase Auth (see [Authentication Guide](../authentication.md))
- 🔄 Update components to use real database queries
- 🔄 Add real-time subscriptions for feed updates

## Scalability

**Supabase scales to millions of users.** See [Scalability Comparison](./scalability.md) for detailed analysis.

**TL;DR:** Start with Supabase. It handles most apps at scale. Only migrate to AWS if you hit specific limits or need custom infrastructure.

## Alternative Options

### AWS (Amplify / RDS / Lambda)
- Pros: Ultimate scalability, full AWS ecosystem, enterprise-grade
- Cons: More complex setup, higher costs initially, requires DevOps expertise
- Best for: Enterprise apps, already using AWS, need specific AWS services
- **See [Scalability Comparison](./scalability.md) for detailed comparison**

### Firebase (Google)
- Pros: Most popular, great docs, NoSQL, Google infrastructure
- Cons: Vendor lock-in, NoSQL (some prefer SQL), can get expensive at scale
- Best for: Quick setup, NoSQL preference, Google ecosystem

### Custom Backend (Node.js + PostgreSQL)
- Pros: Full control, custom logic, any hosting provider
- Cons: More setup, need to host, maintain infrastructure
- Best for: Complex requirements, existing backend team, specific needs
