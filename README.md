# GitHub Payroll Calculator - Production OAuth Edition

A production-ready, secure Next.js application for calculating contributor payroll based on points assigned to merged GitHub pull requests. Features OAuth 2.0 authentication, encrypted token storage, and database persistence.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)
![Security](https://img.shields.io/badge/Security-OAuth_2.0-green)
![Database](https://img.shields.io/badge/Database-Prisma-2D3748)

## Features

### ✨ Core Functionality

- **GitHub Integration**: Fetch merged PRs from any public or private repository using GitHub Personal Access Token
- **Point Assignment**: Manually assign points to each PR with inline editing
- **Auto-Detection**: Automatically detect points from PR comments and descriptions
- **Real-time Calculations**: Summary updates instantly as you assign points
- **Contributor Breakdown**: See payroll breakdown by contributor with collapsible details

### 📊 Export Options

- **CSV Export**: Download payroll data in CSV format
- **Markdown Export**: Generate formatted markdown reports
- **JSON Export**: Export complete data structure as JSON
- **Copy to Clipboard**: Quick copy markdown summary

### 🎨 User Experience

- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Data Persistence**: Configuration and point assignments saved to localStorage
- **Search & Filter**: Filter PRs by author, search by title/number
- **Sorting**: Sort by date, points, or author (ascending/descending)

### 🔒 Security (Production-Ready)

- **OAuth 2.0 Authentication**: Industry-standard GitHub OAuth flow
- **Encrypted Token Storage**: AES-256-GCM encryption for GitHub tokens
- **Database Sessions**: Secure session management with Prisma
- **Server-Side API Proxy**: Tokens never exposed to browser
- **HTTPS Required**: Enforced in production
- **No Token in Browser**: Zero client-side token exposure

## Getting Started

### Prerequisites

- Node.js 18+ installed
- GitHub account
- Domain name (production) or localhost (development)
- Database (SQLite for dev, PostgreSQL recommended for production)

### Quick Start

**⚡ For detailed setup instructions, see [SETUP.md](./SETUP.md)**

1. Install dependencies:
```bash
npm install
```

2. Generate security keys:
```bash
node scripts/generate-env.js
```

3. Create GitHub OAuth App:
   - Go to https://github.com/settings/developers
   - Create new OAuth App
   - Set callback URL: `http://localhost:3000/api/auth/callback/github`
   - Save Client ID and Client Secret

4. Configure environment:
```bash
cp .env.example .env
# Edit .env with your values (see SETUP.md for details)
```

5. Set up database:
```bash
npx prisma migrate dev
npx prisma generate
```

6. Run development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) and sign in with GitHub

### 📚 Documentation

- **[QUICK_START_OAUTH.md](./QUICK_START_OAUTH.md)** - 10-minute getting started guide ⚡
- **[SETUP.md](./SETUP.md)** - Complete production setup guide
- **[MIGRATION.md](./MIGRATION.md)** - Upgrading from client-side version

## Usage

### Step 1: Sign In

1. Click "Sign in with GitHub"
2. Authorize the app (one-time)
3. You'll be redirected back to the app

**Your GitHub token is:**
- ✅ Encrypted with AES-256-GCM
- ✅ Stored securely in the database
- ✅ Never visible in the browser
- ✅ Only used server-side

### Step 2: Configuration

Fill in the configuration form:

- **Repository**: Enter in `owner/repo` format (e.g., `facebook/react`)
- **Start Date**: Beginning of the payroll period
- **End Date**: End of the payroll period
- **Rate per Point**: Payment amount per point (e.g., 25)
- **Currency Symbol**: Currency to display (default: ₳)

Click **Fetch PRs** to retrieve merged pull requests.

### Step 2: Review & Assign Points

- PRs are listed with detected points (if found in comments)
- Edit the "Points" field for each PR to assign custom values
- Toggle the checkmark to exclude PRs from the payroll calculation
- Use search and filters to find specific PRs

**Auto-detected Point Patterns:**
- `points: 5`
- `[8 points]`
- `10 pts`

### Step 3: Review Summary

The summary section shows:
- Total number of PRs
- Total points assigned
- Total payout amount
- Number of contributors
- Breakdown by contributor (expandable)

### Step 4: Export

Choose your export format:
- **Export CSV**: Download spreadsheet-compatible file
- **Export Markdown**: Download formatted report
- **Export JSON**: Download raw data structure
- **Copy Summary**: Copy markdown summary to clipboard

## Project Structure

```
github-payroll-app/
├── app/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main application page
├── components/
│   ├── ConfigForm.tsx      # Configuration form with validation
│   ├── PRTable.tsx         # PR table with search, filter, sort
│   ├── Summary.tsx         # Summary cards and contributor breakdown
│   └── ExportButtons.tsx   # Export functionality buttons
├── lib/
│   ├── github.ts           # GitHub API integration
│   ├── storage.ts          # localStorage utilities
│   ├── export.ts           # Export generation (CSV, MD, JSON)
│   └── calculations.ts     # Summary calculations and formatting
├── types.ts                # TypeScript type definitions
└── README.md               # This file
```

## Technologies Used

### Core Stack

- **[Next.js 14](https://nextjs.org/)**: React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework

### Authentication & Security

- **[NextAuth.js](https://next-auth.js.org/)**: OAuth 2.0 authentication
- **[Prisma](https://www.prisma.io/)**: Type-safe database ORM
- **Node.js Crypto**: AES-256-GCM token encryption
- **bcryptjs**: Additional security utilities

### API & Data

- **[Octokit](https://github.com/octokit/rest.js)**: GitHub REST API client
- **[date-fns](https://date-fns.org/)**: Date formatting
- **SQLite/PostgreSQL**: Database (configurable)

### UI Components

- **[Lucide React](https://lucide.dev/)**: Icon library
- **Custom Components**: Built from scratch for performance

## Keyboard Shortcuts

- **Tab**: Navigate through point input fields
- **Enter**: Save current point input (when focused)

## Security Architecture

### Token Encryption Flow

```
GitHub OAuth → Access Token → AES-256-GCM Encryption → Database
                                    ↓
                            Encrypted at Rest
                                    ↓
                    Decrypted only for API calls (server-side)
```

### Authentication Flow

1. User clicks "Sign in with GitHub"
2. Redirected to GitHub OAuth consent screen
3. User authorizes app
4. GitHub returns authorization code
5. Server exchanges code for access token
6. Token encrypted with AES-256-GCM
7. Encrypted token stored in database
8. Session created with secure cookie

### API Request Flow

```
Browser → API Request → Server validates session
                            ↓
                    Retrieves encrypted token
                            ↓
                    Decrypts token (in memory only)
                            ↓
                    Makes GitHub API call
                            ↓
                    Returns data to browser
                            ↓
                    Token discarded (never sent to browser)
```

### Security Features

- ✅ **AES-256-GCM encryption** for token storage
- ✅ **Database sessions** (not JWT/cookies)
- ✅ **HTTPS enforced** in production
- ✅ **Secure cookies** with httpOnly flag
- ✅ **CSRF protection** via NextAuth
- ✅ **Rate limiting** (via GitHub API limits)
- ✅ **No client-side secrets**

## FAQ

### How is my GitHub token secured?

Your token is encrypted using AES-256-GCM encryption before being stored in the database. It's only decrypted server-side when making GitHub API calls and is never exposed to your browser.

### Can I use this for private repositories?

Yes! The OAuth flow requests the `repo` scope which grants access to both public and private repositories.

### What happens if I refresh the page?

Your session is maintained via secure database sessions. PR data and configurations are saved to the database and automatically loaded when you return.

### Can I revoke access?

Yes! Go to GitHub Settings → Applications → Authorized OAuth Apps and revoke access anytime. This will sign you out and delete your encrypted token.

### Is this GDPR compliant?

The app stores minimal data (user ID, email, encrypted token, PR data). You can delete all your data by revoking OAuth access on GitHub and asking the admin to purge your account.

### What database is used?

Development uses SQLite (no setup required). Production should use PostgreSQL for better performance and reliability.

## Building for Production

```bash
npm run build
npm start
```

## Contributing

This is a standalone tool. Feel free to fork and customize for your needs!

## License

MIT License - feel free to use this tool for your payroll calculations.

## Support

For issues or questions about the GitHub API, visit the [Octokit documentation](https://octokit.github.io/rest.js/).

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
