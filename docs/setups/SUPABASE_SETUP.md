# Supabase Setup Guide

This guide will walk you through setting up Supabase for this project.

## 🎯 What We Use From Supabase

This project uses **Supabase PostgreSQL only** for the database. We use:

- ✅ **PostgreSQL Database** - Managed PostgreSQL 18 database
- ✅ **Supabase Studio** - Database GUI for viewing/editing data
- ✅ **Connection Pooling** - Supavisor for connection management
- ❌ **Supabase Auth** - We use Auth.js instead
- ⚠️ **Supabase Storage** - Available via helper (optional)
- ⚠️ **Supabase Realtime** - Available via helper (optional)

## 📋 Prerequisites

- Supabase account ([sign up](https://app.supabase.com))
- Git installed locally
- Node.js 18+ installed

## 🚀 Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project name**: `next-base-stack` (or your choice)
   - **Database password**: Strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development

4. Wait 2-3 minutes for project creation

### 2. Get Database Connection Strings

Once your project is ready:

#### Option A: From Database Settings (Recommended)

1. Go to **Project Settings** → **Database**
2. Scroll to **Connection String**
3. Select **Transaction Mode** (for app queries):
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
   - Copy this to `DATABASE_URL`

4. Select **Session Mode** (for migrations):
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```
   - Copy this to `DIRECT_DATABASE_URL`

#### Option B: Manual Format

If you prefer to construct manually:

**Transaction Mode (Port 6543):**
```
postgresql://postgres.[project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**Session Mode (Port 5432):**
```
postgresql://postgres.[project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

Replace:
- `[project-ref]` - Your project reference (e.g., `abcdefghijklmnop`)
- `[your-password]` - Database password you set
- `[region]` - Your region (e.g., `eu-central-1`)

### 3. Get Supabase API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://[project-ref].supabase.co`
   - **anon public**: The public anon key
   - **service_role**: The service role secret (keep this secure!)

### 4. Configure Environment Variables

Create `.env` file in your project root:

```bash
cp .env.example .env
```

Fill in your values:

```env
# Supabase API
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Database URLs
DATABASE_URL="postgresql://postgres.your-ref:your-password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
DIRECT_DATABASE_URL="postgresql://postgres.your-ref:your-password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Auth.js (generate with: openssl rand -base64 32)
AUTH_SECRET="your-generated-secret-here"
AUTH_URL="http://localhost:3000"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 5. Install Dependencies

```bash
npm install
```

This will install `@supabase/supabase-js` and other dependencies.

### 6. Push Database Schema

```bash
# Generate migration files
npm run db:generate

# Push to Supabase PostgreSQL
npm run db:push
```

**Note:** We use `DIRECT_DATABASE_URL` for migrations to bypass the connection pooler.

### 7. Verify in Supabase Studio

1. Go to **Table Editor** in your Supabase dashboard
2. You should see these tables:
   - `users`
   - `accounts`
   - `sessions`
   - `verification_tokens`
   - `profiles`

### 8. Test the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and:
1. Register a new account
2. Login
3. Check Supabase Studio - you should see the user in `users` table

## 🔧 Understanding Supabase Connection Modes

### Transaction Mode (Port 6543) - `DATABASE_URL`

**Use for:** Application queries (SELECT, INSERT, UPDATE, DELETE)

**Characteristics:**
- Connection pooling enabled (Supavisor)
- Better performance for many concurrent connections
- Limited to transaction-level prepared statements
- **Use this in your application code**

### Session Mode (Port 5432) - `DIRECT_DATABASE_URL`

**Use for:** Migrations and DDL operations (CREATE, ALTER, DROP)

**Characteristics:**
- Direct connection to PostgreSQL
- Supports all PostgreSQL features
- Required for schema changes
- **Use this for Drizzle migrations**

## 📊 Monitoring Your Database

### Supabase Dashboard Features

1. **Table Editor**: Visual interface for data
2. **SQL Editor**: Run custom queries
3. **Database**: View connection stats, logs
4. **Reports**: Performance metrics

### Database Usage

View your database usage:
- Go to **Project Settings** → **Database**
- Check **Database Size** and **Connection Limit**

Free tier limits:
- 500 MB database space
- Unlimited API requests
- 2 GB bandwidth
- 50,000 monthly active users

## 🔐 Security Best Practices

### Row Level Security (RLS)

**Important:** We use Auth.js (not Supabase Auth), so we handle security in the DAL layer, not with RLS.

If you want to enable RLS for extra security:

```sql
-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Since we don't use Supabase Auth, RLS policies won't work
-- Security is handled in the DAL layer with auth() checks
```

### API Keys Security

- ✅ **anon key**: Safe to expose to client (public)
- ❌ **service_role key**: NEVER expose to client (server-only)
- ✅ Store in `.env` and add `.env` to `.gitignore`

## 🚀 Production Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   DATABASE_URL=...
   DIRECT_DATABASE_URL=...
   AUTH_SECRET=...
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

4. Deploy!

### Database Migrations in Production

```bash
# Run migrations against production database
npm run db:push
```

**Warning:** Always backup before running migrations in production!

## 🆘 Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
1. Check connection strings in `.env`
2. Verify password is correct
3. Check region matches your project
4. Ensure ports are correct (6543 for app, 5432 for migrations)

### Issue: "Too many connections"

**Solution:**
- Use Transaction Mode (`DATABASE_URL` with port 6543)
- This uses connection pooling and prevents this issue

### Issue: "Migration failed"

**Solution:**
- Ensure you're using `DIRECT_DATABASE_URL` (port 5432)
- Transaction mode doesn't support DDL operations

### Issue: "RLS policy prevents access"

**Solution:**
- We don't use Supabase Auth, so disable RLS on tables
- Security is handled in the DAL layer

## 📚 Optional Features

### Using Supabase Storage

If you want to use Supabase Storage for file uploads:

```typescript
import { supabase } from "@/lib/supabase/client";

// Upload file
const { data, error } = await supabase.storage
  .from("avatars")
  .upload("user-avatar.png", file);
```

### Using Supabase Realtime

For real-time subscriptions:

```typescript
import { supabase } from "@/lib/supabase/client";

// Subscribe to changes
supabase
  .channel("public:users")
  .on("postgres_changes",
    { event: "*", schema: "public", table: "users" },
    (payload) => console.log(payload)
  )
  .subscribe();
```

## 🔄 Migrating from Local PostgreSQL

If you started with local PostgreSQL and want to migrate:

1. Dump your local database:
   ```bash
   pg_dump your_db > dump.sql
   ```

2. Import to Supabase:
   ```bash
   psql "$DIRECT_DATABASE_URL" < dump.sql
   ```

3. Update `.env` with Supabase connection strings

## 📖 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase PostgreSQL](https://supabase.com/docs/guides/database)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Drizzle with Supabase](https://orm.drizzle.team/docs/get-started-postgresql#supabase)

---

**Next Steps:**
- ✅ Database configured
- ✅ Schema pushed
- ⏭️ Start building your app!
