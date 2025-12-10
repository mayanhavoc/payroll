# Quick Start Guide - OAuth Production Version

Get the secure, production-ready GitHub Payroll Calculator running in 10 minutes!

## 🎯 What You'll Need

- ✅ Node.js 18+ installed
- ✅ GitHub account
- ✅ 10 minutes of your time

## 🚀 Step-by-Step Setup

### Step 1: Generate Security Keys (2 minutes)

Run this command to generate encryption keys:

```bash
node scripts/generate-env.js
```

**You'll see output like this:**

```
🔐 Generated Security Keys

═══════════════════════════════════════════════════════════

📋 Copy these values to your .env file:

ENCRYPTION_KEY="a1b2c3d4e5f6...64-character-hex-string"
NEXTAUTH_SECRET="xyz123abc456...base64-string"

═══════════════════════════════════════════════════════════

⚠️  IMPORTANT:
  - Keep these keys SECRET
  - Never commit them to version control
```

**Save these values!** You'll need them in Step 3.

---

### Step 2: Create GitHub OAuth App (3 minutes)

#### 2.1 Go to GitHub Settings

Open: https://github.com/settings/developers

#### 2.2 Create New OAuth App

Click **"New OAuth App"** button

#### 2.3 Fill in the Form

**For Development:**

```
Application name:           GitHub Payroll Calculator (Dev)
Homepage URL:              http://localhost:3000
Authorization callback URL: http://localhost:3000/api/auth/callback/github
```

**Important:** The callback URL must be **exact**!

#### 2.4 Get Your Credentials

After creating:

1. Copy the **Client ID** (Ov23liti6JkWF0HoapXI)
2. Click **"Generate a new client secret"**
3. Copy the **Client Secret** immediately (you won't see it again!) (6986fb905cf2bec2c5209acbdfa7500b01e2fa7a)

**Save these values!** You'll need them in Step 3.

---

### Step 3: Configure Environment (2 minutes)

#### 3.1 Copy Environment Template

```bash
cp .env.example .env
```

#### 3.2 Edit .env File

Open `.env` in your text editor and fill in:

```bash
# Database (leave as-is for dev)
DATABASE_URL="file:./dev.db"

# NextAuth.js (from Step 1)
NEXTAUTH_SECRET="<paste-your-generated-secret>"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth App (from Step 2)
GITHUB_CLIENT_ID="<paste-your-client-id>"
GITHUB_CLIENT_SECRET="<paste-your-client-secret>"

# Encryption key (from Step 1)
ENCRYPTION_KEY="<paste-your-generated-key>"
```

**Save the file!**

---

### Step 4: Install & Set Up Database (2 minutes)

Run these commands:

```bash
# Install dependencies (if not already done)
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# When prompted for a migration name, press Enter (uses default)
```

**You should see:**

```
✔ Generated Prisma Client
Applying migration `20251201001847_init`
Your database is now in sync with your schema.
```

---

### Step 5: Start the App (1 minute)

```bash
npm run dev
```

**You should see:**

```
▲ Next.js 16.0.6
- Local:        http://localhost:3000
- Ready in 2.3s
```

---

### Step 6: Sign In & Test (2 minutes)

#### 6.1 Open the App

Navigate to: **http://localhost:3000**

#### 6.2 Click "Sign in with GitHub"

You'll be redirected to GitHub

#### 6.3 Authorize the App

Click **"Authorize"** on the GitHub consent screen

#### 6.4 You're In!

You should be redirected back to the app, now logged in!

---

## 🎉 Success! Now What?

### Test the App

1. **Enter a repository**: `facebook/react`
2. **Set date range**: Last month
3. **Set rate**: `25`
4. **Click "Fetch PRs"**

Watch as it fetches PRs, auto-detects points, and calculates payroll!

### Your Data is Secure

- ✅ Your GitHub token is **encrypted** in the database
- ✅ Token is **never visible** in your browser
- ✅ All API calls happen **server-side**
- ✅ You can **revoke access** anytime on GitHub

---

## 🔧 Troubleshooting

### "Invalid client" Error

**Problem:** OAuth callback fails

**Solution:**

```bash
# Double-check your .env file:
# 1. GITHUB_CLIENT_ID matches GitHub OAuth App
# 2. GITHUB_CLIENT_SECRET matches GitHub OAuth App
# 3. No extra spaces or quotes

# Restart the dev server:
npm run dev
```

### "ENCRYPTION_KEY not set" Error

**Problem:** Missing encryption key

**Solution:**

```bash
# Run the key generator again:
node scripts/generate-env.js

# Copy the ENCRYPTION_KEY to .env
# Restart the dev server
```

### Database Connection Error

**Problem:** Can't connect to database

**Solution:**

```bash
# Regenerate Prisma client:
npx prisma generate

# Re-run migrations:
npx prisma migrate dev

# Restart the dev server
```

### Session Not Persisting

**Problem:** Logged out after refresh

**Solution:**

```bash
# Check NEXTAUTH_SECRET is set in .env
# Clear browser cookies
# Try signing in again
```

### Can't Fetch PRs

**Problem:** "Unauthorized" or "Repository not found"

**Solutions:**

- **For private repos:** Make sure you authorized the app with `repo` scope
- **For public repos:** Check repository name format: `owner/repo`
- **Token expired:** Sign out and sign in again

---

## 📚 Next Steps

### Learn More

- **Full Setup Guide**: See [SETUP.md](./SETUP.md) for production deployment
- **Security Details**: See [README.md](./README.md#security-architecture)
- **Upgrade Guide**: See [MIGRATION.md](./MIGRATION.md) if coming from client-side version

### Customize

- **Change database**: Switch to PostgreSQL for production (see SETUP.md)
- **Deploy**: Use Vercel, Railway, or other platforms (see SETUP.md)
- **Configure**: Adjust rate, currency, date ranges as needed

### Use It

1. Fetch PRs from your repositories
2. Assign points to contributors
3. Export payroll reports (CSV, Markdown, JSON)
4. Share with your team!

---

## 🆘 Still Having Issues?

### Check These Common Problems

1. **Node.js version**: Run `node --version` (should be 18+)
2. **Port 3000 in use**: Kill other processes or change port
3. **Environment variables**: Verify all 5 variables in `.env`
4. **GitHub OAuth App**: Verify callback URL is exact
5. **Database**: Make sure migrations ran successfully

### Debug Mode

Run with verbose logging:

```bash
# Set NODE_ENV to development
export NODE_ENV=development
npm run dev
```

Check the terminal for detailed error messages.

### Reset Everything

If all else fails:

```bash
# Delete database
rm -rf prisma/dev.db

# Delete generated files
rm -rf node_modules/.prisma
rm -rf .next

# Reinstall
npm install

# Regenerate
npx prisma generate
npx prisma migrate dev

# Restart
npm run dev
```

---

## 💡 Pro Tips

### Development Workflow

```bash
# Terminal 1: Run dev server
npm run dev

# Terminal 2: Watch database (optional)
npx prisma studio
# Opens database viewer at http://localhost:5555
```

### Keyboard Shortcuts

- **Tab**: Navigate between point inputs
- **Enter**: Save point value
- **Cmd/Ctrl + R**: Refresh PRs

### Data Persistence

- Your point assignments are **saved to the database**
- No need to re-enter after refresh
- Data persists across sign-ins

### Multiple Repositories

You can fetch PRs from different repositories:

1. Sign in once
2. Change repository name in config
3. Fetch new PRs
4. All data saved separately per repository

---

## 🎯 Quick Reference Card

Save this for easy access:

```bash
# Start app
npm run dev

# View database
npx prisma studio

# Generate new keys
node scripts/generate-env.js

# Update database after schema changes
npx prisma migrate dev

# Production build
npm run build
npm start
```

**URLs:**

- App: http://localhost:3000
- GitHub OAuth: https://github.com/settings/developers
- Database Viewer: http://localhost:5555 (if running prisma studio)

**Environment Variables:**

- `GITHUB_CLIENT_ID` - From GitHub OAuth App
- `GITHUB_CLIENT_SECRET` - From GitHub OAuth App
- `NEXTAUTH_SECRET` - Generated by script
- `ENCRYPTION_KEY` - Generated by script
- `DATABASE_URL` - Database connection

---

## ✅ Checklist

Use this to verify everything is working:

- [ ] Generated encryption keys
- [ ] Created GitHub OAuth App
- [ ] Configured `.env` file
- [ ] Ran `npm install`
- [ ] Ran `npx prisma generate`
- [ ] Ran `npx prisma migrate dev`
- [ ] Started dev server (`npm run dev`)
- [ ] Opened http://localhost:3000
- [ ] Signed in with GitHub successfully
- [ ] Fetched PRs from a repository
- [ ] Assigned points to PRs
- [ ] Exported payroll report

**All checked?** You're ready to use the app! 🎉

---

## 🔒 Security Reminder

Your GitHub token is:

- ✅ **Encrypted** with AES-256-GCM
- ✅ **Stored** securely in the database
- ✅ **Never exposed** to your browser
- ✅ **Only used** server-side for GitHub API calls
- ✅ **Revocable** anytime from GitHub settings

You can revoke access anytime:

1. Go to https://github.com/settings/applications
2. Find "GitHub Payroll Calculator"
3. Click "Revoke"

---

**Need more help?** See the full [SETUP.md](./SETUP.md) guide or [README.md](./README.md) documentation.

**Happy calculating!** 🎉
