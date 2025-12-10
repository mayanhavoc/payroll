# Production Setup Guide

Complete guide for deploying the GitHub Payroll Calculator with OAuth 2.0 and encrypted storage.

## 📋 Prerequisites

- Node.js 18+ installed
- GitHub account (for creating OAuth App)
- Domain name (for production) or localhost (for development)

## 🔐 Step 1: Generate Security Keys

Run the key generation script:

```bash
node scripts/generate-env.js
```

This generates:
- `ENCRYPTION_KEY` - For encrypting GitHub tokens (AES-256-GCM)
- `NEXTAUTH_SECRET` - For NextAuth.js session security

**⚠️ Important:** Save these keys securely! You'll need them in Step 3.

## 🔧 Step 2: Create GitHub OAuth App

### 2.1 Navigate to GitHub Settings

1. Go to https://github.com/settings/developers
2. Click "OAuth Apps" in the left sidebar
3. Click "New OAuth App"

### 2.2 Fill in OAuth App Details

**For Development:**
```
Application name: GitHub Payroll Calculator (Dev)
Homepage URL: http://localhost:3000
Authorization callback URL: http://localhost:3000/api/auth/callback/github
```

**For Production:**
```
Application name: GitHub Payroll Calculator
Homepage URL: https://your-domain.com
Authorization callback URL: https://your-domain.com/api/auth/callback/github
```

### 2.3 Get Client Credentials

After creating the app:

1. Copy the **Client ID**
2. Click "Generate a new client secret"
3. Copy the **Client Secret** (you won't see it again!)

## 📝 Step 3: Configure Environment Variables

### 3.1 Copy Environment Template

```bash
cp .env.example .env
```

### 3.2 Fill in Values

Edit `.env` with your values:

```bash
# Database (default is fine for dev)
DATABASE_URL="file:./dev.db"

# NextAuth.js (from Step 1)
NEXTAUTH_SECRET="<your-generated-secret>"
NEXTAUTH_URL="http://localhost:3000"  # Change in production

# GitHub OAuth App (from Step 2)
GITHUB_CLIENT_ID="<your-client-id>"
GITHUB_CLIENT_SECRET="<your-client-secret>"

# Encryption key (from Step 1)
ENCRYPTION_KEY="<your-generated-key>"
```

### 3.3 Production Environment

For production, update:
```bash
NEXTAUTH_URL="https://your-domain.com"
DATABASE_URL="<your-production-database-url>"
```

## 🗄️ Step 4: Set Up Database

The app uses Prisma with SQLite by default. For production, consider PostgreSQL.

### Development (SQLite)

```bash
npx prisma migrate dev
npx prisma generate
```

### Production (PostgreSQL Recommended)

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
}
```

2. Update `prisma.config.ts`:
```typescript
datasource: {
  url: env("DATABASE_URL"),
}
```

3. Set `DATABASE_URL` to your PostgreSQL connection string:
```bash
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

4. Run migrations:
```bash
npx prisma migrate deploy
npx prisma generate
```

## 🚀 Step 5: Run the Application

### Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Production Build

```bash
npm install
npm run build
npm start
```

## ✅ Step 6: Test OAuth Flow

1. Open the app in your browser
2. Click "Sign in with GitHub"
3. Authorize the app on GitHub
4. You should be redirected back to the app, logged in
5. Try fetching PRs from a repository

## 🔒 Security Checklist

Before going to production:

- [ ] Different encryption keys for dev and production
- [ ] Secure storage for environment variables (not in git)
- [ ] HTTPS enabled (required for production OAuth)
- [ ] Database backups configured
- [ ] Rate limiting on API routes (optional)
- [ ] Log monitoring set up
- [ ] Error tracking (e.g., Sentry)

## 🌐 Deployment Options

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Set up PostgreSQL database (Vercel Postgres or Supabase)
5. Deploy!

**Vercel Environment Variables:**
```
DATABASE_URL=<your-postgres-url>
NEXTAUTH_SECRET=<your-secret>
NEXTAUTH_URL=https://your-app.vercel.app
GITHUB_CLIENT_ID=<your-id>
GITHUB_CLIENT_SECRET=<your-secret>
ENCRYPTION_KEY=<your-key>
```

### Other Platforms

- **Railway:** Similar to Vercel, supports PostgreSQL
- **Fly.io:** Docker-based, full control
- **DigitalOcean App Platform:** Easy PostgreSQL integration
- **AWS/GCP/Azure:** More complex but fully customizable

## 🔄 Database Migrations

When you update the schema:

```bash
# Development
npx prisma migrate dev --name description_of_changes

# Production
npx prisma migrate deploy
```

## 🐛 Troubleshooting

### "Invalid client" error during OAuth

- Check that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct
- Verify callback URL matches exactly: `https://your-domain.com/api/auth/callback/github`

### "ENCRYPTION_KEY environment variable is not set"

- Make sure `.env` file exists
- Check that `ENCRYPTION_KEY` is properly set
- Restart the dev server after changing `.env`

### Database connection errors

- For SQLite: Check file permissions
- For PostgreSQL: Verify connection string format and credentials

### Session not persisting

- Clear browser cookies
- Check that `NEXTAUTH_SECRET` is set
- Verify database is accessible

## 📊 Monitoring

### Recommended Tools

- **Logs:** Vercel Logs, LogDNA, Datadog
- **Errors:** Sentry, Rollbar
- **Performance:** Vercel Analytics, Google Analytics
- **Uptime:** UptimeRobot, Pingdom

## 🔐 Security Best Practices

### Token Storage

- Tokens are encrypted with AES-256-GCM before storage
- Encryption key must be 64 hex characters (32 bytes)
- Never log decrypted tokens
- Rotate encryption keys periodically

### Session Management

- Sessions stored in database, not cookies
- Automatic session expiration
- Secure cookies in production (HTTPS only)

### Database Security

- Use read-only database users where possible
- Enable SSL for database connections
- Regular backups with encryption
- Limit database network access

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [GitHub OAuth Apps](https://docs.github.com/en/apps/oauth-apps)
- [Vercel Deployment](https://vercel.com/docs)

## 🆘 Support

For issues:
1. Check this guide thoroughly
2. Review error logs
3. Verify environment variables
4. Test OAuth flow manually
5. Check GitHub OAuth app settings

---

**Ready to deploy!** Follow these steps carefully and you'll have a secure, production-ready payroll calculator.
