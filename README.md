# 📡 Service Pulse | सेवा पल्स

Real-time public service experience tracker for Nepal.

---

## 🚀 Quick Start

### 1. Install
```bash
npm install
```

### 2. Set up Environment Variables
```bash
cp .env.example .env.local
```
Fill in `.env.local`:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

### 3. Push Schema & Seed
```bash
npm run db:push
npm run db:seed
```

### 4. Run
```bash
npm run dev
```

---

## 🔑 Default Accounts (after seeding)

| Role    | Email                   | Password   |
|---------|-------------------------|------------|
| Admin   | admin@servicepulse.np   | admin123   |
| Citizen | ram@example.com         | citizen123 |

---

## 📋 Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run db:push      # Push schema (no history)
npm run db:migrate   # Run migrations
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
```

---

## 🛠️ Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Prisma v6** + **Neon Postgres**
- **NextAuth.js v5** (beta)
- Deploy on **Vercel**

Made with ❤️ for Nepal 🇳🇵
