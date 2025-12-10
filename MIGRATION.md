# Migration Guide: Client-Side to OAuth Version

This guide helps you understand the differences and migrate from the client-side token version to the secure OAuth version.

## 🔄 What Changed?

### Before (Client-Side Version)

```
┌─────────────┐
│   Browser   │
│             │──► Stores GitHub Token in localStorage
│             │──► Makes GitHub API calls directly
│             │──► All data stays in browser
└─────────────┘
```

**Security Issues:**
- ❌ Token exposed in localStorage (XSS vulnerable)
- ❌ Token visible in browser dev tools
- ❌ Broad permissions (full `repo` access)
- ❌ No token rotation
- ❌ Shared computer risk

### After (OAuth Version)

```
┌─────────────┐      ┌──────────────┐      ┌──────────┐
│   Browser   │─────►│   Backend    │─────►│ Database │
│             │      │              │      │          │
│  No Token!  │      │ Encrypted    │      │ Encrypted│
│             │      │ Token Storage│      │ Tokens   │
└─────────────┘      └──────────────┘      └──────────┘
                           │
                           ▼
                     GitHub API
```

**Security Improvements:**
- ✅ OAuth 2.0 flow (industry standard)
- ✅ Tokens never exposed to browser
- ✅ AES-256-GCM encryption at rest
- ✅ Session-based authentication
- ✅ Server-side API proxy
- ✅ Database storage with proper access control

## 📊 Feature Comparison

| Feature | Client-Side | OAuth Version |
|---------|-------------|---------------|
| **Authentication** | Manual PAT entry | GitHub OAuth |
| **Token Storage** | localStorage | Encrypted database |
| **Token Visibility** | Visible in browser | Never exposed |
| **Security** | ⚠️ Moderate | ✅ High |
| **Setup Complexity** | ✅ Easy | ⚠️ Medium |
| **Production Ready** | ❌ No | ✅ Yes |
| **Multi-User** | ❌ No | ✅ Yes |
| **Session Management** | None | ✅ Database sessions |
| **Token Refresh** | Manual | ✅ Automatic |
| **Audit Trail** | None | ✅ Database logs |

## 🚀 Migration Steps

### For Personal Use

If you're the only user and use it on your own computer:

**Option A: Keep Client-Side Version**
- It's in `app/page-old.tsx` (backed up)
- Fine for personal use
- Just add security warnings

**Option B: Upgrade to OAuth**
- Follow `SETUP.md`
- More secure
- Better long-term

### For Team/Production Use

**Must upgrade to OAuth version:**

1. Follow `SETUP.md` for complete setup
2. Create GitHub OAuth App
3. Set up database
4. Configure environment variables
5. Test thoroughly before deploying

## 📁 File Changes

### New Files (OAuth Version)

```
lib/
├── auth.ts                    # NextAuth configuration
├── encryption.ts              # Token encryption utilities
└── prisma.ts                  # Database client

app/api/
├── auth/[...nextauth]/        # OAuth endpoints
│   └── route.ts
└── github/
    ├── prs/route.ts           # Fetch PRs (server-side)
    └── save-prs/route.ts      # Save PR data

app/auth/
└── signin/page.tsx            # Custom sign-in page

prisma/
├── schema.prisma              # Database schema
└── migrations/                # Database migrations

components/
├── Providers.tsx              # NextAuth session provider
└── ConfigFormOAuth.tsx        # Config form (no token input)
```

### Modified Files

```
app/page.tsx                   # OAuth version (new)
app/page-old.tsx              # Client-side version (backup)
app/layout.tsx                # Added Providers wrapper
.env                          # OAuth credentials
```

### Deleted Files

Nothing deleted! Old version backed up as `page-old.tsx`.

## 🔐 Data Migration

### PR Data

The client-side version stored PR data in localStorage:

```javascript
// Old: localStorage
localStorage.getItem('payroll_prs')
```

The OAuth version stores in database:

```sql
-- New: Database
SELECT * FROM "PullRequestData" WHERE userId = ?
```

**Migration Script** (if needed):

```javascript
// Run in browser console on old version
const oldData = localStorage.getItem('payroll_prs');
const oldConfig = localStorage.getItem('payroll_config');

console.log('Old PR Data:', oldData);
console.log('Old Config:', oldConfig);

// Copy this data, then in new version:
// 1. Sign in with OAuth
// 2. Fetch PRs normally
// 3. Points will auto-save to database
```

## ⚙️ Configuration Changes

### Old (.env not needed)

Everything configured in the UI.

### New (Requires .env)

```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="generated-secret"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID="from-oauth-app"
GITHUB_CLIENT_SECRET="from-oauth-app"
ENCRYPTION_KEY="generated-key"
```

Use `node scripts/generate-env.js` to generate keys.

## 🧪 Testing Migration

### Test Checklist

1. **Setup**
   - [ ] Environment variables configured
   - [ ] Database migrated
   - [ ] GitHub OAuth App created

2. **Authentication**
   - [ ] Can sign in with GitHub
   - [ ] Redirected correctly after auth
   - [ ] Session persists on refresh
   - [ ] Can sign out successfully

3. **Functionality**
   - [ ] Can fetch PRs from repository
   - [ ] Points can be assigned
   - [ ] PRs can be excluded
   - [ ] Data persists after refresh
   - [ ] Export features work

4. **Security**
   - [ ] Token not visible in browser
   - [ ] localStorage doesn't contain token
   - [ ] HTTPS in production
   - [ ] Database connection secure

## 🐛 Common Migration Issues

### Issue: "Invalid client" during OAuth

**Solution:**
```bash
# Check GitHub OAuth App settings
Callback URL must match exactly:
http://localhost:3000/api/auth/callback/github
```

### Issue: Database connection fails

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Re-run migrations
npx prisma migrate dev
```

### Issue: Session not persisting

**Solution:**
```bash
# Verify NEXTAUTH_SECRET is set
echo $NEXTAUTH_SECRET

# Check database has Session table
npx prisma studio
```

### Issue: Lost my old PR data

**Solution:**
Old data is in localStorage. Open old version (`page-old.tsx`) and export to CSV first.

## 📈 Performance Impact

### Client-Side Version
- Fast (all local)
- No server needed
- Limited by browser GitHub API rate limits

### OAuth Version
- Slightly slower (database + API calls)
- Requires server
- Better rate limit handling
- Caching possible (future)

## 🎯 Decision Matrix

**Use Client-Side Version if:**
- ✅ Only you use it
- ✅ On your personal computer
- ✅ For quick, temporary calculations
- ✅ Trust your environment

**Use OAuth Version if:**
- ✅ Multiple users
- ✅ Production/commercial use
- ✅ Compliance requirements
- ✅ Long-term deployment
- ✅ Need audit trails

## 🔄 Rolling Back

If you need to revert to client-side version:

```bash
# Rename files back
mv app/page.tsx app/page-oauth-backup.tsx
mv app/page-old.tsx app/page.tsx

# Remove OAuth routes (optional)
rm -rf app/api/auth
rm -rf app/auth

# Keep database files (no harm)
```

## 📚 Additional Reading

- [OAuth 2.0 Explained](https://oauth.net/2/)
- [Why Client-Side Tokens Are Risky](https://owasp.org/www-community/vulnerabilities/Insecure_Storage)
- [NextAuth.js Best Practices](https://next-auth.js.org/configuration/options)

---

**Need help?** Check `SETUP.md` for detailed setup instructions or review the troubleshooting section.
