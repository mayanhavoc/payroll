# Quick Start Guide

Get up and running with the GitHub Payroll Calculator in 5 minutes!

## 🚀 Installation

```bash
cd /Users/robertom/Documents/Workspace/Projects/github-payroll-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Get Your GitHub Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it: "Payroll Calculator"
4. Select scope: `repo` (for all repos) or `public_repo` (public only)
5. Click "Generate token"
6. **Copy the token immediately!**

## 📝 First Use

1. **Enter Configuration:**
   - Repository: `owner/repo` (e.g., `facebook/react`)
   - Token: Paste your GitHub token
   - Start Date: First day of payroll period
   - End Date: Last day of payroll period
   - Rate: Payment per point (e.g., `25`)
   - Currency: `₳` or `$` or any symbol

2. **Click "Fetch PRs"** - Wait for PRs to load

3. **Assign Points:**
   - Review detected points (auto-filled from PR comments)
   - Edit points directly in the table
   - Uncheck PRs to exclude from payroll

4. **Review Summary:**
   - See total payout
   - Expand contributor breakdown
   - Verify calculations

5. **Export:**
   - Click "Export CSV" for spreadsheet
   - Click "Export Markdown" for formatted report
   - Click "Copy Summary" to paste into Slack/Discord

## 💡 Pro Tips

- **Auto-detect works with:** `points: 5`, `[8 points]`, `10 pts`
- **Search:** Type PR number, title, or author name
- **Filter:** Select specific author from dropdown
- **Sort:** Click column headers (Date, Author, Points)
- **Dark Mode:** Toggle with moon/sun icon in header
- **Data persists:** Your config and points save automatically

## 🎯 Example Point Patterns in PRs

Add these to PR descriptions or comments to auto-detect:

```
points: 5
[3 points]
Effort: 8 pts
```

## ⚡ Keyboard Tips

- **Tab**: Jump between point inputs
- **Enter**: Save and move to next field
- **Cmd/Ctrl + F**: Focus search (when implemented)

## 🔒 Privacy

- Everything runs in your browser
- No data sent to servers
- Token stored in localStorage only
- Safe to use with private repos

## 🆘 Troubleshooting

**"Invalid token"** → Generate new token with correct scopes

**"Repository not found"** → Check repo name format: `owner/repo`

**No PRs showing** → Verify date range includes merged PRs

**Points not saving** → Check browser localStorage is enabled

## 📖 Full Documentation

See [README.md](./README.md) for complete documentation.

## 🎉 You're Ready!

Start calculating payroll for your GitHub contributors!
