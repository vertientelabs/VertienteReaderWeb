# Deployment Guide - Vertiente Reader Web

## Environments

| Environment | Branch | URL | Auto-deploy |
|-------------|--------|-----|-------------|
| **Production** | `main` | `vertiente-reader.vercel.app` | ✅ On push |
| **Staging** | `develop` | `vertiente-reader-staging.vercel.app` | ✅ On push |
| **Preview** | PR branches | `vertiente-reader-*.vercel.app` | ✅ On PR |
| **Local** | any | `localhost:3000` | — |

---

## 1. Quick Start (Local Development)

```bash
# Clone and install
git clone <repo-url>
cd VertienteReaderWeb
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Run development server
npm run dev
```

---

## 2. Vercel Deployment (Recommended)

### Initial Setup

1. **Import project** in [vercel.com](https://vercel.com):
   - Connect GitHub repository
   - Framework: Next.js (auto-detected)
   - Root directory: `./`

2. **Configure Environment Variables** in Vercel Dashboard → Settings → Environment Variables:

   | Variable | Environments |
   |----------|-------------|
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | Production, Preview, Development |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Production, Preview, Development |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Production, Preview, Development |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Production, Preview, Development |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Production, Preview, Development |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | Production, Preview, Development |

3. **Configure GitHub Secrets** (for CI/CD workflows):

   | Secret | Description |
   |--------|-------------|
   | `VERCEL_TOKEN` | Vercel API token (Settings → Tokens) |
   | `VERCEL_ORG_ID` | From `.vercel/project.json` after `vercel link` |
   | `VERCEL_PROJECT_ID` | From `.vercel/project.json` after `vercel link` |
   | `FIREBASE_PROJECT_ID` | `vertientefb` |
   | `FIREBASE_TOKEN` | From `firebase login:ci` |
   | All `NEXT_PUBLIC_FIREBASE_*` | Same as Vercel env vars |

### Deploy Manually

```bash
# Install Vercel CLI
npm i -g vercel

# Link project (first time)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 3. Firebase Hosting (Alternative)

```bash
# Install Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Build static export
npm run build

# Deploy
firebase deploy --only hosting --project vertientefb
```

---

## 4. Docker Deployment

```bash
# Build image
docker build \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=your_key \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vertientefb.firebaseapp.com \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=vertientefb \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vertientefb.firebasestorage.app \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id \
  -t vertiente-reader-web .

# Run container
docker run -p 3000:3000 vertiente-reader-web
```

Note: Set `DOCKER_BUILD=1` in next.config.ts to enable standalone output.

---

## 5. Firebase Rules Deployment

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes --project vertientefb

# Deploy Storage rules
firebase deploy --only storage --project vertientefb
```

---

## 6. CI/CD Pipeline

### Workflow Triggers

| Workflow | Trigger | Actions |
|----------|---------|---------|
| `ci.yml` | Push to main/develop, PRs | Lint → TypeCheck → Test → Build |
| `deploy-preview.yml` | PR opened/updated | Build → Deploy Preview → Comment PR |
| `deploy-staging.yml` | Push to develop | Test → Deploy to Staging |
| `deploy-production.yml` | Push to main | CI → Deploy to Production → Deploy Firebase Rules |

### Pipeline Flow

```
PR Created
  └─→ CI (lint + typecheck + test + build)
  └─→ Preview Deploy → Comment URL on PR

Merge to develop
  └─→ Deploy Staging

Merge to main
  └─→ CI (lint + typecheck + test + build)
  └─→ Deploy Production
  └─→ Deploy Firestore Rules
```

---

## 7. Monitoring

### Vercel Analytics
- Enable in Vercel Dashboard → Analytics
- Tracks Web Vitals (LCP, FID, CLS)
- Real-time visitor analytics

### Error Tracking (Recommended)
- Integrate Sentry: `npm install @sentry/nextjs`
- Configure in `sentry.client.config.ts` and `sentry.server.config.ts`

---

## 8. Rollback

```bash
# Vercel: rollback to previous deployment
vercel rollback

# Or promote a specific deployment
vercel promote <deployment-url>
```
