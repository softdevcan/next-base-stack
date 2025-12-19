# CLAUDE.md - Development Standards & Best Practices

This document outlines the architectural decisions, coding standards, and best practices for this Next.js base stack.

## 🏗️ Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.5.9 (App Router)
- **React**: 19.0.0
- **Database**: PostgreSQL 18
- **ORM**: Drizzle ORM
- **Auth**: Auth.js v5 (next-auth beta)
- **i18n**: next-intl
- **Styling**: Tailwind CSS + shadcn/ui (Vega theme)
- **Validation**: Zod
- **Linting/Formatting**: Biome.js

### Design Patterns

#### BFF (Backend for Frontend)
- No separate backend server
- All business logic runs server-side in Next.js
- Server Components for data fetching
- Server Actions for mutations

#### DAL (Data Access Layer)
All database queries must go through the DAL (`lib/db/queries/`):
- **Security**: Every query includes `auth()` checks
- **Performance**: Queries use React `cache()` for deduplication
- **Type Safety**: Full TypeScript types from Drizzle
- **Server-Only**: Imports `"server-only"` to prevent client bundling

```typescript
// ✅ GOOD: Using DAL
import { getCurrentUser } from "@/lib/db/queries";
const user = await getCurrentUser(); // Built-in auth check

// ❌ BAD: Direct DB access
import { db } from "@/lib/db";
const user = await db.query.users.findFirst(); // No auth check!
```

## 🔐 Security Guidelines

### Authentication
- Auth.js v5 with JWT strategy
- Session validation on every protected route
- Protected routes use layout-based middleware

### Authorization
```typescript
// Always verify user identity
const session = await auth();
if (!session?.user?.id) throw new Error("Unauthorized");

// Only allow users to access their own data
const userId = session.user.id;
// Never trust client-provided user IDs
```

### Input Validation
- Use Zod schemas for all form inputs
- Validate on server-side (Server Actions)
- Never trust client-side validation alone

```typescript
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
});

const result = schema.safeParse(data);
if (!result.success) {
  return { error: result.error };
}
```

## 🗄️ Database Standards

### Primary Keys: UUIDv7
- **Why**: UUIDv7 provides time-ordered, globally unique identifiers
- **PostgreSQL 18**: Native `gen_random_uuid()` support
- **Drizzle**: `uuid("id").defaultRandom().primaryKey()`

```typescript
// Schema definition
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(), // UUIDv7
  // ... other fields
});
```

### Migrations
```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

### Relations
- Use Drizzle relations for type-safe joins
- Always include `onDelete: "cascade"` for foreign keys
- Keep relations in schema file for clarity

## 🌍 Internationalization (i18n)

### URL Structure
- All routes prefixed with locale: `/tr/dashboard`, `/en/dashboard`
- Middleware handles automatic redirection
- `localePrefix: "always"` for consistency

### Adding New Translations

1. **Add keys to both language files**:
```json
// messages/tr.json
{
  "myFeature": {
    "title": "Başlık",
    "description": "Açıklama"
  }
}

// messages/en.json
{
  "myFeature": {
    "title": "Title",
    "description": "Description"
  }
}
```

2. **Use in components**:
```typescript
// Server Component
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("myFeature");
  return <h1>{t("title")}</h1>;
}

// Client Component
"use client";
import { useTranslations } from "next-intl";
// Same API
```

### Language Switching
- Use `<LanguageSwitcher />` component
- Preserves current route path
- Automatic preference storage (TODO: Add to user profile)

## 📁 File Organization

### Route Groups
```
app/[locale]/
├── (auth)/          # Auth pages (login, register)
├── (protected)/     # Protected pages (dashboard, profile)
├── page.tsx         # Public landing page
├── terms/           # Legal pages
└── privacy/
```

### Component Structure
```
components/
├── ui/              # shadcn/ui primitives
├── navbar.tsx       # Shared navigation
└── language-switcher.tsx
```

### Server Actions
- Co-located with features: `app/[locale]/(protected)/profile/actions.ts`
- Always use `"use server"` directive
- Validate inputs with Zod
- Return typed results: `{ success: boolean; error?: string }`

```typescript
"use server";

import { z } from "zod";

const schema = z.object({ name: z.string() });

export async function updateProfile(formData: FormData) {
  const result = schema.safeParse({
    name: formData.get("name"),
  });

  if (!result.success) {
    return { success: false, error: "Invalid input" };
  }

  // ... update logic
  return { success: true };
}
```

## 🎨 Styling Guidelines

### Tailwind CSS
- Use utility classes for styling
- Use `cn()` helper for conditional classes
- Follow shadcn/ui patterns for components

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className // Allow override
)} />
```

### shadcn/ui Components
- Install via CLI: `npx shadcn@latest add button`
- Customize in `components/ui/`
- Use Vega theme (already configured)

## 🔧 Development Workflow

### Commands
```bash
# Development
npm run dev          # Start dev server with Turbopack

# Code Quality
npm run lint         # Check with Biome
npm run lint:fix     # Auto-fix issues
npm run format       # Format code

# Database
npm run db:generate  # Generate migrations
npm run db:push      # Apply migrations
npm run db:studio    # Open Drizzle Studio

# Production
npm run build        # Build for production
npm start            # Start production server
```

### Environment Variables
- Use `@t3-oss/env-nextjs` for type-safe env vars
- Define schema in `lib/env.ts`
- Never commit `.env` files

```typescript
// lib/env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
```

## 🚀 Performance Best Practices

### Server Components by Default
- Use Server Components unless you need interactivity
- Mark Client Components with `"use client"`
- Keep client bundles small

### Data Fetching
- Use React `cache()` for request deduplication
- Fetch data in layouts for shared data
- Use `loading.tsx` for streaming

### Images
- Use Next.js `<Image />` component
- Optimize images automatically
- Set proper width/height

## 🧪 Testing (TODO)

Future testing strategy:
- Unit tests: Vitest
- Integration tests: Playwright
- Type checking: `tsc --noEmit`

## 📝 Code Review Checklist

Before submitting PR:
- [ ] All queries go through DAL with auth checks
- [ ] Server Actions validate inputs with Zod
- [ ] i18n keys exist in both TR and EN
- [ ] No direct database access from components
- [ ] Server/Client Component boundaries are correct
- [ ] TypeScript has no errors
- [ ] Biome linting passes
- [ ] Environment variables are in `lib/env.ts`

## 🔄 Future Enhancements (See TODO.md)

- [ ] Email service integration
- [ ] Stripe payment integration
- [ ] File upload with S3
- [x] Admin dashboard
- [x] Role-based access control (RBAC)
- [ ] API rate limiting
- [ ] Logging and monitoring
- [ ] Testing suite
