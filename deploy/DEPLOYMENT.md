# Deployment Guide

This document covers deploying soulofsoul to production environments.

## Quick reference

| Target | Best for | Guide |
|---|---|---|
| **Vercel + managed Postgres** | Fastest path to production; Next.js-native | [Vercel deployment](#vercel) |
| **AWS (Terraform)** | Full control; HIPAA-eligible infra | [AWS deployment](#aws-terraform) |
| **Docker Compose** | Self-hosted / on-premise | [Docker deployment](#docker-compose) |

---

## Vercel

Best for: rapid deployment, automatic HTTPS, Next.js-native optimizations.

### Prerequisites
- Vercel account
- Managed PostgreSQL (Vercel Postgres, Supabase, Neon, or AWS RDS)
- z-ai-web-dev-sdk API key

### Steps

1. **Push to GitHub** (already done — `github.com/ruhalruhapp/soulofsoul`)

2. **Import to Vercel:**
   ```bash
   npm i -g vercel
   vercel link
   ```

3. **Set environment variables:**
   ```bash
   vercel env add DATABASE_URL production
   vercel env add NEXTAUTH_SECRET production
   vercel env add NEXTAUTH_URL production
   vercel env add ZAI_API_KEY production
   ```

4. **Deploy:**
   ```bash
   ./deploy/scripts/deploy-vercel.sh production
   # or just:
   vercel --prod
   ```

5. **Post-deploy:**
   - Run migrations: `vercel env pull .env.production.local && bun run db:push`
   - Seed demo data (optional): `bun run db:seed`
   - Configure custom domain in Vercel dashboard

### Notes
- The `vercel.json` config sets max durations for API routes (60s for chat/notes, 30s for TTS/ASR/classify)
- Security headers (HSTS, X-Frame-Options, etc.) are configured in `vercel.json`
- Vercel's Edge Network provides TLS automatically
- **For HIPAA:** use Vercel Enterprise plan + BAA-signed with Vercel

---

## AWS (Terraform)

Best for: full control, HIPAA-eligible infrastructure, enterprise compliance.

### Prerequisites
- AWS account with appropriate permissions
- Terraform >= 1.5
- AWS CLI configured
- ACM certificate for your domain
- Route53 hosted zone (optional, for DNS)

### Architecture

```
┌─────────────────────────────────────────────────────┐
│  Route53 → CloudFront → ALB (TLS)                  │
│                              │                       │
│              ┌───────────────┼───────────────┐       │
│              ▼               ▼               ▼       │
│         ECS Fargate    ECS Fargate    ECS Fargate   │
│         (web app)      (crisis-relay)  (workers)   │
│              │               │                       │
│              ▼               ▼                       │
│         RDS PostgreSQL  ElastiCache Redis            │
│         (encrypted,    (sessions, rate limit)        │
│          multi-AZ)                                    │
│              │                                       │
│              ▼                                       │
│         Secrets Manager (DATABASE_URL, etc.)         │
│         CloudWatch Logs + Alarms                     │
└─────────────────────────────────────────────────────┘
```

### Steps

1. **Configure secrets in AWS Secrets Manager:**
   ```bash
   aws secretsmanager create-secret \
     --name soulofsoul/production/db-password \
     --secret-string "$(openssl rand -base64 32)"

   aws secretsmanager create-secret \
     --name soulofsoul/production/nextauth-secret \
     --secret-string "$(openssl rand -base64 32)"

   aws secretsmanager create-secret \
     --name soulofsoul/production/zai-api-key \
     --secret-string "your-zai-api-key"
   ```

2. **Copy and fill in tfvars:**
   ```bash
   cd deploy/aws
   cp production.tfvars.example production.tfvars
   # Edit production.tfvars with your domain, certificate ARN
   ```

3. **Deploy:**
   ```bash
   ./../scripts/deploy-aws.sh production
   ```

4. **Post-deploy:**
   - Push schema to RDS: `DATABASE_URL="..." bun run db:push`
   - Seed: `bun run db:seed`
   - Configure DNS in Route53 to point to ALB
   - Verify health: `curl https://soulofsoul.com/api/health`

### HIPAA notes
- RDS PostgreSQL: encrypted at rest, multi-AZ, 30-day backups
- ElastiCache Redis: encrypted at rest + in transit
- All access logged via CloudWatch
- Secrets in Secrets Manager (never in env vars or code)
- VPC with private subnets for data tier

---

## Docker Compose

Best for: self-hosted / on-premise deployment, testing production-like setup.

### Steps

1. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with:
   # - POSTGRES_PASSWORD (strong password)
   # - NEXTAUTH_SECRET (openssl rand -base64 32)
   # - NEXTAUTH_URL (your domain)
   ```

2. **Build and start:**
   ```bash
   docker-compose up -d
   ```

3. **Run migrations:**
   ```bash
   docker-compose exec web bun run db:push
   ```

4. **Seed demo data:**
   ```bash
   docker-compose exec web bun run db:seed
   ```

5. **Verify:**
   ```bash
   curl http://localhost:3000/api/health
   ```

### Services

| Service | Port | Purpose |
|---|---|---|
| `web` | 3000 | Next.js app |
| `crisis-relay` | 3030 | WebSocket supervisor feed |
| `postgres` | 5432 | Database |
| `redis` | 6379 | Session cache + rate limiting |

---

## Post-deployment checklist

### Required before processing real PHI

- [ ] TLS certificate valid (check `https://your-domain.com` shows 🔒)
- [ ] `NEXTAUTH_SECRET` set to a strong random value
- [ ] `DATABASE_URL` points to production Postgres (not SQLite)
- [ ] Database encrypted at rest (RDS / Cloud SQL encryption enabled)
- [ ] Backups configured (30-day retention minimum for HIPAA)
- [ ] BAA signed with all subprocessors (cloud provider, LLM provider, etc.)
- [ ] HIPAA training completed for all workforce members
- [ ] Security Officer and Privacy Officer designated
- [ ] Incident response plan documented
- [ ] `bun run db:push` succeeded
- [ ] `bun run db:seed` succeeded (verify demo accounts can log in)
- [ ] `bun test` passes (110 tests)
- [ ] `bun run lint` passes
- [ ] Health check returns 200: `curl https://your-domain.com/api/health`
- [ ] Crisis bar visible on every page (test from logged-out state)
- [ ] 988 / 911 / Crisis Text Line links work (test on mobile)
- [ ] Age gate rejects users under 18
- [ ] Consent flows capture all 4 streams (§8.3)
- [ ] Audit logging enabled and writing to CloudWatch / equivalent
- [ ] Monitoring + alerting configured (CloudWatch alarms or equivalent)
- [ ] Rate limiting enabled (Redis or Vercel KV)
- [ ] Replace regex crisis classifier with real fine-tuned model (§5.1 gate)
- [ ] Classifier evaluation passes: `bun run evaluate` → recall ≥ 0.95, false-alarm ≤ 2/1k

### Recommended

- [ ] Custom domain configured
- [ ] CDN configured (CloudFront / Cloudflare / Vercel Edge)
- [ ] WAF rules (AWS WAF or Cloudflare)
- [ ] DDoS protection
- [ ] Log aggregation (CloudWatch / Datadog / Splunk)
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring (PagerDuty / Statuspage)
- [ ] Load testing completed
- [ ] Penetration testing completed (annual requirement for HIPAA)
