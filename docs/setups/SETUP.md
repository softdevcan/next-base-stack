# Setup Guide - Next Base Stack

This guide will help you get the project up and running.

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Supabase account ([sign up free](https://app.supabase.com))
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## 🚀 Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, React, Drizzle, Auth.js, Supabase client, etc.

### 2. Setup Supabase Project

**Recommended:** Follow the detailed guide in [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

**Quick Steps:**

1. Go to [app.supabase.com](https://app.supabase.com)
2. Create new project
3. Wait for project to be ready (2-3 minutes)
4. Get connection strings from **Settings** → **Database**
5. Get API keys from **Settings** → **API**

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
# Supabase (from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Database URLs (from Supabase Settings → Database)
DATABASE_URL="postgresql://postgres.[ref]:password@...pooler.supabase.com:6543/postgres"
DIRECT_DATABASE_URL="postgresql://postgres.[ref]:password@...pooler.supabase.com:5432/postgres"

# Auth Secret (generate new one!)
AUTH_SECRET="[run: openssl rand -base64 32]"
AUTH_URL="http://localhost:3000"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Generate AUTH_SECRET:**

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 4. Setup Database Schema

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push
```

**Verify database:**

```bash
# Open Drizzle Studio (database GUI)
npm run db:studio
```

Navigate to `https://local.drizzle.studio` to see your tables.

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

You should see:
- ✅ Landing page with language switcher
- ✅ Navbar with Login/Register buttons
- ✅ Feature cards

### 6. Test Authentication Flow

1. **Register a new account:**
   - Go to `/tr/register`
   - Enter name, email, password
   - Submit form

   **Note:** Password hashing is not implemented yet (see TODO.md)

2. **Login:**
   - Go to `/tr/login`
   - Use credentials from registration
   - Should redirect to `/tr/dashboard`

3. **Test protected routes:**
   - `/tr/dashboard` - Should work when logged in
   - `/tr/profile` - Update your profile
   - `/tr/account` - Account settings
   - `/tr/billing` - Billing page

4. **Test i18n:**
   - Switch language using globe icon in navbar
   - URL should change from `/tr/*` to `/en/*`
   - All text should translate

## 🔧 Common Issues & Solutions

### Issue: "Cannot connect to database"

**Solution:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in `.env`
3. Test connection: `psql $DATABASE_URL`

### Issue: "Module not found" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Authentication not working"

**Solution:**
1. Check AUTH_SECRET is set in `.env`
2. Verify it's at least 32 characters
3. Restart dev server after changing `.env`

### Issue: TypeScript errors

**Solution:**
```bash
# Check for errors
npx tsc --noEmit

# If errors persist
rm -rf .next
npm run dev
```

### Issue: Biome linting errors

**Solution:**
```bash
# Auto-fix most issues
npm run lint:fix
npm run format
```

## 📚 Next Steps

### Recommended Order

1. **Read Documentation:**
   - [ ] Read [README.md](README.md) for overview
   - [ ] Read [CLAUDE.md](CLAUDE.md) for development standards
   - [ ] Review [TODO.md](TODO.md) for planned features

2. **Customize for Your Project:**
   - [ ] Update app name in `messages/*.json`
   - [ ] Customize color scheme in `tailwind.config.ts`
   - [ ] Add your logo to navbar
   - [ ] Update Terms and Privacy pages

3. **Implement Core Features:**
   - [ ] Add password hashing (bcrypt)
   - [ ] Setup email service (Resend, SendGrid)
   - [ ] Add OAuth providers (Google, GitHub)
   - [ ] Implement email verification

4. **Deploy to Production:**
   - [ ] Push to GitHub
   - [ ] Deploy to Vercel
   - [ ] Setup production database
   - [ ] Configure environment variables

## 🎯 Quick Tests

Run these to verify everything works:

```bash
# 1. Type check
npx tsc --noEmit

# 2. Lint check
npm run lint

# 3. Build test
npm run build

# 4. Database connection test
npm run db:studio
```

All should complete without errors.

## 🆘 Getting Help

1. **Check existing documentation:**
   - [README.md](README.md) - Main documentation
   - [CLAUDE.md](CLAUDE.md) - Development standards
   - [TODO.md](TODO.md) - Planned features

2. **Common Next.js issues:**
   - [Next.js Documentation](https://nextjs.org/docs)
   - [Next.js GitHub Issues](https://github.com/vercel/next.js/issues)

3. **Auth.js issues:**
   - [Auth.js Documentation](https://authjs.dev/)
   - [Auth.js Discussions](https://github.com/nextauthjs/next-auth/discussions)

## ✅ Setup Complete!

If all steps worked, you should have:
- ✅ Working development server
- ✅ Database connected and migrated
- ✅ Authentication flow working
- ✅ i18n switching between TR/EN
- ✅ All protected routes accessible when logged in

Happy coding! 🎉
