# Screenshot Capture Pipeline

Automated Playwright pipeline that captures GitHub UI screenshots for the Git tutorial website. Creates a mock repository with realistic history, then screenshots specific UI elements and full pages.

## Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **GitHub CLI (`gh`)** — [cli.github.com](https://cli.github.com)
- **Playwright browsers** — installed via `npx playwright install chromium`

### macOS Quick Setup

```bash
# Install Node.js (if not present)
brew install node

# Install GitHub CLI and authenticate
brew install gh
gh auth login

# Install dependencies and browsers
cd scripts/
npm install
npx playwright install chromium
```

## Usage

### Step 1: Create the Mock Repository

The setup script creates a public GitHub repo (`learning-git-demo`) with branches, commits, PRs, tags, and merge conflicts.

```bash
cd scripts/
bash setup-mock-repo.sh
```

This will:
- Create a public repo under your GitHub account
- Build a realistic git history with diverging branches
- Create a merge conflict between branches
- Tag a release (`v1.0.0`)
- Open a conflicting PR and a merged PR (with "Restore branch" button)
- Print the repo URL when done

The script is **idempotent** — safe to re-run. It will force-push and recreate PRs.

### Step 2: Capture Screenshots

```bash
export REPO_URL="https://github.com/YOUR_USERNAME/learning-git-demo"
npm run capture
```

Or run directly:

```bash
REPO_URL="https://github.com/YOUR_USERNAME/learning-git-demo" node capture-screenshots.js
```

### Output

Screenshots are saved to:

```
learngit/
├── screenshots/
│   ├── closeups/       # 44 element crops
│   ├── full-page/      # 15 viewport captures
│   └── MANIFEST.txt    # Index of all captures with status
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REPO_URL` | Yes | Full GitHub URL (e.g., `https://github.com/user/learning-git-demo`) |
| `GITHUB_TOKEN` | No | GitHub token for authenticated access (private repos, rate limits) |

## Configuration

Edit the `CONFIG` object at the top of `capture-screenshots.js`:

```js
const CONFIG = {
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,        // Retina screenshots
  headless: false,             // Set true for CI
  timeout: 30_000,             // Per-element timeout
  stabilityDelay: 500,         // Wait for stable bounding box
  animationDelay: 300,         // Wait after opening dropdowns
};
```

## Troubleshooting

**"No matching selector found"** — GitHub occasionally updates their DOM structure. Check the selector arrays in `capture-screenshots.js` and update as needed. Each shot has multiple fallback selectors.

**Rate limiting** — If you see 429 errors, set `GITHUB_TOKEN` or increase the delay between shots.

**Browser doesn't launch** — Run `npx playwright install chromium` to install browser binaries.

**Setup script fails at PR creation** — Ensure `gh` is authenticated with repo scope: `gh auth refresh -s repo`.

## Re-running

Both scripts are idempotent:
- `setup-mock-repo.sh` — force-pushes and recreates PRs
- `capture-screenshots.js` — overwrites existing screenshots

## Adding New Screenshots

1. Add a new entry to either `closeupShots` or `fullPageShots` array
2. Include multiple fallback CSS selectors
3. Run the capture script to test
4. Failed shots are marked `[PENDING]` in MANIFEST.txt
