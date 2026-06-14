/**
 * capture-screenshots.js
 *
 * Playwright script that captures 44 closeup element screenshots and 15 full-page
 * viewport screenshots from a public GitHub repository.
 *
 * Usage:
 *   REPO_URL="https://github.com/user/learning-git-demo" node capture-screenshots.js
 *
 * Optional:
 *   GITHUB_TOKEN="ghp_..." — enables authenticated access for private repos or rate limits
 */

import { chromium } from "playwright";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// =============================================================================
// Configuration
// =============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_URL = process.env.REPO_URL;
if (!REPO_URL) {
  console.error("ERROR: REPO_URL environment variable is required.");
  console.error('Example: REPO_URL="https://github.com/user/learning-git-demo" node capture-screenshots.js');
  process.exit(1);
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || null;

const CONFIG = {
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  headless: false, // headed mode for debugging
  timeout: 30_000, // 30s per element
  stabilityDelay: 500, // wait for stable bounding box
  animationDelay: 300, // wait after dropdown/modal open
};

// Output directories
const PROJECT_ROOT = join(__dirname, "..");
const CLOSEUP_DIR = join(PROJECT_ROOT, "screenshots", "closeups");
const FULLPAGE_DIR = join(PROJECT_ROOT, "screenshots", "full-page");
const MANIFEST_PATH = join(PROJECT_ROOT, "screenshots", "MANIFEST.txt");

// Ensure output dirs exist
mkdirSync(CLOSEUP_DIR, { recursive: true });
mkdirSync(FULLPAGE_DIR, { recursive: true });

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Wait for an element's bounding box to stabilize (no size changes).
 */
async function waitForStable(element, ms = CONFIG.stabilityDelay) {
  let prev = await element.boundingBox();
  if (!prev) return false;
  await new Promise((r) => setTimeout(r, ms));
  let curr = await element.boundingBox();
  if (!curr) return false;
  // Check if position/size stayed the same
  const stable =
    Math.abs(prev.x - curr.x) < 2 &&
    Math.abs(prev.y - curr.y) < 2 &&
    Math.abs(prev.width - curr.width) < 2 &&
    Math.abs(prev.height - curr.height) < 2;
  return stable;
}

/**
 * Safely locate and screenshot an element.
 * Returns the element or null if not found.
 */
async function safeElementShot(page, selectors, filename, options = {}) {
  const selectorList = Array.isArray(selectors) ? selectors : [selectors];

  for (const selector of selectorList) {
    try {
      const element = await page.locator(selector).first();
      const isVisible = await element.isVisible({ timeout: 5000 }).catch(() => false);
      if (!isVisible) continue;

      await waitForStable(element);
      await element.screenshot({
        path: join(CLOSEUP_DIR, filename),
        ...options,
      });
      return { success: true };
    } catch {
      continue;
    }
  }
  return { success: false, error: "No matching selector found" };
}

/**
 * Navigate to a URL and wait for network idle.
 */
async function navigate(page, url) {
  await page.goto(url, { waitUntil: "networkidle", timeout: CONFIG.timeout });
  // Extra settle time for GitHub's SPA hydration
  await page.waitForTimeout(1000);
}

/**
 * Take a viewport screenshot (not full page).
 */
async function viewportShot(page, filename) {
  await page.screenshot({
    path: join(FULLPAGE_DIR, filename),
    fullPage: false,
  });
}

// =============================================================================
// Screenshot Definitions
// =============================================================================

/**
 * Each shot is an async function that takes (page, context) and returns
 * { id, success, error? }
 */

// --- CATEGORY A: Repository Structure ---

const closeupShots = [
  // A1: File listing grid
  {
    id: "repo-file-tree.png",
    description: "File listing grid with icons and commit messages",
    capture: async (page, ctx) => {
      await navigate(page, REPO_URL);
      return safeElementShot(page, [
        '[aria-labelledby="files"]',
        ".react-directory-row",
        '[data-testid="repos-file-tree-container"]',
        "table.files",
        ".Box .js-navigation-container",
      ], "repo-file-tree.png");
    },
  },
  // A2: .gitignore row
  {
    id: "gitignore-file-row.png",
    description: "Single .gitignore row with file icon",
    capture: async (page, ctx) => {
      await navigate(page, REPO_URL);
      return safeElementShot(page, [
        'a[title=".gitignore"]',
        'tr:has(a[href*=".gitignore"])',
        '.react-directory-row:has(a[href*="gitignore"])',
        '[data-testid="list-row-item"]:has(a[href*="gitignore"])',
      ], "gitignore-file-row.png");
    },
  },
  // A3: README rendered preview
  {
    id: "readme-rendered-preview.png",
    description: "README card below file tree",
    capture: async (page, ctx) => {
      await navigate(page, REPO_URL);
      return safeElementShot(page, [
        '[data-testid="read-me-header"]',
        "#readme",
        'article[itemprop="text"]',
        ".markdown-body",
        ".Box-body .markdown-body",
      ], "readme-rendered-preview.png");
    },
  },
  // A4: About panel (right sidebar)
  {
    id: "repo-about-panel.png",
    description: "Right sidebar About section",
    capture: async (page, ctx) => {
      await navigate(page, REPO_URL);
      return safeElementShot(page, [
        ".BorderGrid-cell:has(h2:text('About'))",
        '[class*="BorderGrid"] .BorderGrid-row:first-child .BorderGrid-cell',
        ".Layout-sidebar .border-bottom:first-child",
        "div.flex-column:has(> p.f4)",
      ], "repo-about-panel.png");
    },
  },
  // A5: Tab bar
  {
    id: "repo-tab-bar.png",
    description: "Code/Issues/PR/Actions tab row",
    capture: async (page, ctx) => {
      await navigate(page, REPO_URL);
      return safeElementShot(page, [
        'nav[aria-label="Repository"]',
        ".UnderlineNav",
        '[data-testid="underline-nav"]',
        "ul.UnderlineNav-body",
      ], "repo-tab-bar.png");
    },
  },

  // --- CATEGORY B: Branching ---

  // B6: Branch selector closed
  {
    id: "branch-selector-closed.png",
    description: "Branch button closed showing main",
    capture: async (page, ctx) => {
      await navigate(page, REPO_URL);
      return safeElementShot(page, [
        '[data-hotkey="w"]',
        "#branch-select-menu",
        'button:has-text("main")',
        'summary:has-text("main")',
        '[data-testid="branch-picker-ref-selector"]',
      ], "branch-selector-closed.png");
    },
  },
  // B7: Branch selector open (empty search)
  {
    id: "branch-selector-open-empty.png",
    description: "Dropdown open, no search text",
    capture: async (page, ctx) => {
      await navigate(page, REPO_URL);
      // Click to open branch selector
      const trigger = page.locator('[data-hotkey="w"], #branch-select-menu, [data-testid="branch-picker-ref-selector"], summary:has-text("main")').first();
      try {
        await trigger.click({ timeout: 5000 });
        await page.waitForTimeout(CONFIG.animationDelay);
        return safeElementShot(page, [
          '[role="menu"]:visible',
          ".SelectMenu-modal:visible",
          '[data-testid="branch-picker-menu"]',
          ".ref-selector-modal",
          '[aria-label="Switch branches or tags"]',
        ], "branch-selector-open-empty.png");
      } catch {
        return { success: false, error: "Could not open branch selector" };
      }
    },
  },
  // B8: Branch selector with text typed
  {
    id: "branch-selector-typing.png",
    description: "Dropdown with branch name typed, Create branch prompt shown",
    capture: async (page, ctx) => {
      await navigate(page, REPO_URL);
      const trigger = page.locator('[data-hotkey="w"], #branch-select-menu, [data-testid="branch-picker-ref-selector"], summary:has-text("main")').first();
      try {
        await trigger.click({ timeout: 5000 });
        await page.waitForTimeout(CONFIG.animationDelay);
        // Type in search box
        const input = page.locator('[role="menu"] input, .SelectMenu-input, [placeholder*="branch"], [placeholder*="Find"]').first();
        await input.fill("feat/experimental-ai-logic");
        await page.waitForTimeout(CONFIG.animationDelay);
        return safeElementShot(page, [
          '[role="menu"]:visible',
          ".SelectMenu-modal:visible",
          '[data-testid="branch-picker-menu"]',
          ".ref-selector-modal",
        ], "branch-selector-typing.png");
      } catch {
        return { success: false, error: "Could not interact with branch selector" };
      }
    },
  },
  // B9: All branches page
  {
    id: "branch-list-all.png",
    description: "Branches page branch table rows",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/branches`);
      return safeElementShot(page, [
        '[data-testid="branch-list"]',
        ".Box .branch-list",
        'div[data-target="branch-filter.list"]',
        "main .Box",
      ], "branch-list-all.png");
    },
  },
  // B10: Behind badge
  {
    id: "branch-behind-badge.png",
    description: "X commits behind pill",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/branches`);
      return safeElementShot(page, [
        ':text("behind"):visible',
        '.branch-list a:has-text("behind")',
        '[class*="behind"]',
        '.State:has-text("behind")',
      ], "branch-behind-badge.png");
    },
  },
  // B11: Default branch label
  {
    id: "default-branch-label.png",
    description: "Green default badge on main",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/branches`);
      return safeElementShot(page, [
        ':text("default"):visible',
        '.Label:has-text("default")',
        'span:has-text("default")',
        '[class*="Label"]:has-text("default")',
      ], "default-branch-label.png");
    },
  },

  // --- CATEGORY C: Commits & History ---

  // C12: 4 commit rows
  {
    id: "commit-history-four-rows.png",
    description: "4 commit rows block",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/commits/main`);
      // Try to capture the first few commit rows as a group
      return safeElementShot(page, [
        '[data-testid="commit-row-group"]',
        ".TimelineItem:nth-child(-n+4)",
        'ol[data-testid="commit-list"]',
        "main .Box .js-navigation-container",
        "main .commits-listing",
      ], "commit-history-four-rows.png");
    },
  },
  // C13: Verified badge
  {
    id: "commit-verified-badge.png",
    description: "Green Verified badge + hash",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/commits/main`);
      return safeElementShot(page, [
        '[aria-label="Verified"]',
        '.octicon-verified',
        ':text("Verified"):visible',
        '.tooltipped:has-text("Verified")',
      ], "commit-verified-badge.png");
    },
  },
  // C14: Commit hash chip
  {
    id: "commit-hash-chip.png",
    description: "Short hash with copy icon",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/commits/main`);
      return safeElementShot(page, [
        '[data-testid="commit-row-item"] [class*="sha"]',
        'clipboard-copy[aria-label="Copy full SHA"]',
        'a[data-testid="commit-link"]',
        ".sha-block",
        ".commit-tease-sha",
      ], "commit-hash-chip.png");
    },
  },
  // C15: Commit detail header
  {
    id: "commit-detail-header.png",
    description: "Commit page top: message, author, date",
    capture: async (page, ctx) => {
      // Navigate to first commit
      await navigate(page, `${REPO_URL}/commits/main`);
      const commitLink = page.locator('a[data-testid="commit-link"], .TimelineItem a[href*="/commit/"], li a[href*="/commit/"]').first();
      try {
        const href = await commitLink.getAttribute("href", { timeout: 5000 });
        if (href) {
          const commitUrl = href.startsWith("http") ? href : `https://github.com${href}`;
          await navigate(page, commitUrl);
          ctx.commitUrl = commitUrl;
        }
      } catch {
        // Fallback: just use commits page
        await navigate(page, `${REPO_URL}/commits/main`);
      }
      return safeElementShot(page, [
        ".commit-title",
        '[data-testid="commit-header"]',
        ".commit-desc",
        "div.Box-header:has(.commit-title)",
        "main > div:first-child .Box",
      ], "commit-detail-header.png");
    },
  },
  // C16: Diff stat bar
  {
    id: "commit-diff-stat-bar.png",
    description: "+3 −2 colored bar",
    capture: async (page, ctx) => {
      if (ctx.commitUrl) {
        await navigate(page, ctx.commitUrl);
      }
      return safeElementShot(page, [
        '[data-testid="diffstat"]',
        ".diffstat",
        ".toc-diff-stats",
        ".file-info .diffstat",
      ], "commit-diff-stat-bar.png");
    },
  },
  // C17: File diff block
  {
    id: "commit-file-diff-block.png",
    description: "One file unified diff (file header + lines)",
    capture: async (page, ctx) => {
      if (ctx.commitUrl) {
        await navigate(page, ctx.commitUrl);
      }
      return safeElementShot(page, [
        '[data-testid="diff-file-block"]:first-of-type',
        ".file.js-file:first-of-type",
        '.diff-view [data-path]:first-of-type',
        ".file:first-of-type",
        'copilot-diff-entry:first-of-type',
      ], "commit-file-diff-block.png");
    },
  },
  // C18: Parent link
  {
    id: "commit-parent-link.png",
    description: "1 parent link in commit header",
    capture: async (page, ctx) => {
      if (ctx.commitUrl) {
        await navigate(page, ctx.commitUrl);
      }
      return safeElementShot(page, [
        ':text("parent"):visible',
        'a:has-text("parent")',
        ".sha-block:has(a[href*='commit'])",
        '[class*="parent"]',
      ], "commit-parent-link.png");
    },
  },
  // C19: Branch indicator on commit
  {
    id: "commit-tree-indicator.png",
    description: "Branch indicator on commit page",
    capture: async (page, ctx) => {
      if (ctx.commitUrl) {
        await navigate(page, ctx.commitUrl);
      }
      return safeElementShot(page, [
        '[data-testid="commit-branches"]',
        ".commit-branches",
        'span:has-text("main")',
        '[class*="branch-name"]',
      ], "commit-tree-indicator.png");
    },
  },
  // C20: Browse files button
  {
    id: "commit-browse-files-button.png",
    description: "Browse files button",
    capture: async (page, ctx) => {
      if (ctx.commitUrl) {
        await navigate(page, ctx.commitUrl);
      }
      return safeElementShot(page, [
        'a:has-text("Browse files")',
        '[aria-label="Browse files"]',
        'a[href*="/tree/"]',
      ], "commit-browse-files-button.png");
    },
  },

  // --- CATEGORY D: Diffs & Code Review ---

  // D21: Split diff panel
  {
    id: "split-diff-panel.png",
    description: "Full split diff of pipeline.py",
    capture: async (page, ctx) => {
      // Navigate to the conflicting PR's files changed
      if (ctx.conflictPrUrl) {
        await navigate(page, `${ctx.conflictPrUrl}/files`);
        // Try to switch to split view
        const splitBtn = page.locator('button:has-text("Split"), [aria-label="Split view"]').first();
        try {
          await splitBtn.click({ timeout: 3000 });
          await page.waitForTimeout(CONFIG.animationDelay);
        } catch { /* split may already be active */ }
      }
      return safeElementShot(page, [
        '[data-path="pipeline.py"]',
        '.file:has([title="pipeline.py"])',
        'copilot-diff-entry:has([title="pipeline.py"])',
        ".file:first-of-type",
      ], "split-diff-panel.png");
    },
  },
  // D22: Split diff gutter
  {
    id: "split-diff-gutter.png",
    description: "Center gutter between split halves",
    capture: async (page, ctx) => {
      return safeElementShot(page, [
        ".diff-split-lnum",
        'td[data-split-side="right"]:first-of-type',
        ".blob-code-inner:first-of-type",
        "table.diff-table td:nth-child(3)",
      ], "split-diff-gutter.png");
    },
  },
  // D23: Unified diff hunk header
  {
    id: "unified-diff-hunk-header.png",
    description: "@@ hunk header with context",
    capture: async (page, ctx) => {
      if (ctx.conflictPrUrl) {
        await navigate(page, `${ctx.conflictPrUrl}/files`);
      }
      return safeElementShot(page, [
        ".blob-code-hunk",
        'td:has-text("@@")',
        ".diff-table .blob-code-hunk",
        '[data-code-marker="@@"]',
      ], "unified-diff-hunk-header.png");
    },
  },
  // D24: Line comment trigger (blue + button)
  {
    id: "diff-line-comment-trigger.png",
    description: "Blue + button on hover",
    capture: async (page, ctx) => {
      if (ctx.conflictPrUrl) {
        await navigate(page, `${ctx.conflictPrUrl}/files`);
      }
      // Hover over a diff line to reveal the + button
      const diffLine = page.locator(".diff-table tr .blob-code, [data-testid='diff-text-cell']").first();
      try {
        await diffLine.hover({ timeout: 5000 });
        await page.waitForTimeout(CONFIG.animationDelay);
      } catch { /* continue anyway */ }
      return safeElementShot(page, [
        'button[aria-label="Add a comment on this line"]',
        ".js-add-single-line-comment",
        ".add-comment-btn",
        "button.add-line-comment",
      ], "diff-line-comment-trigger.png");
    },
  },
  // D25: Comment textarea expanded
  {
    id: "diff-inline-comment-box.png",
    description: "Comment textarea expanded",
    capture: async (page, ctx) => {
      // Try to click the + button to open comment box
      const addBtn = page.locator('button[aria-label="Add a comment on this line"], .js-add-single-line-comment, button.add-line-comment').first();
      try {
        await addBtn.click({ timeout: 3000 });
        await page.waitForTimeout(CONFIG.animationDelay);
      } catch { /* might not be available */ }
      return safeElementShot(page, [
        ".inline-comment-form",
        '[data-testid="inline-comment-form"]',
        'form:has(textarea[name="comment[body]"])',
        ".review-comment-form",
      ], "diff-inline-comment-box.png");
    },
  },
  // D26: File diff header
  {
    id: "diff-file-header-row.png",
    description: "File diff header bar",
    capture: async (page, ctx) => {
      if (ctx.conflictPrUrl) {
        await navigate(page, `${ctx.conflictPrUrl}/files`);
      }
      return safeElementShot(page, [
        ".file-header:first-of-type",
        '[data-testid="diff-file-header"]:first-of-type',
        ".file-info:first-of-type",
        'div[class*="file-header"]:first-of-type',
      ], "diff-file-header-row.png");
    },
  },
  // D27: Viewed checkbox
  {
    id: "diff-viewed-checkbox.png",
    description: "Viewed checkbox in PR files changed",
    capture: async (page, ctx) => {
      return safeElementShot(page, [
        'input[type="checkbox"][name="viewed"]',
        '[data-testid="viewed-checkbox"]',
        'label:has-text("Viewed")',
        '.js-reviewed-checkbox',
      ], "diff-viewed-checkbox.png");
    },
  },

  // --- CATEGORY E: Pull Requests ---

  // E28: PR list row
  {
    id: "pr-list-row.png",
    description: "One PR in the list",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/pulls`);
      return safeElementShot(page, [
        '[data-testid="issue-row"]:first-of-type',
        ".js-issue-row:first-of-type",
        'div[id^="issue_"]:first-of-type',
        ".Box-row:first-of-type",
      ], "pr-list-row.png");
    },
  },
  // E29: PR header block
  {
    id: "pr-header-block.png",
    description: "PR page header with badges",
    capture: async (page, ctx) => {
      // Find and navigate to the conflicting PR
      await navigate(page, `${REPO_URL}/pulls`);
      const prLink = page.locator('a[data-testid="issue-title-link"], .js-issue-row a[href*="/pull/"], .Box-row a[href*="/pull/"]').first();
      try {
        const href = await prLink.getAttribute("href", { timeout: 5000 });
        if (href) {
          const prUrl = href.startsWith("http") ? href : `https://github.com${href}`;
          await navigate(page, prUrl);
          ctx.conflictPrUrl = prUrl;
        }
      } catch {
        // Fallback
      }
      return safeElementShot(page, [
        '[data-testid="issue-header"]',
        ".gh-header",
        ".gh-header-show",
        "h1.gh-header-title",
        "main > div:first-child",
      ], "pr-header-block.png");
    },
  },
  // E30: PR internal tabs
  {
    id: "pr-tab-row.png",
    description: "PR internal tabs (Conversation, Commits, Files)",
    capture: async (page, ctx) => {
      if (ctx.conflictPrUrl) {
        await navigate(page, ctx.conflictPrUrl);
      }
      return safeElementShot(page, [
        '[data-testid="pull-header-tabs"]',
        'nav[aria-label="Pull request tabs"]',
        ".tabnav-tabs",
        ".UnderlineNav:has(a[href*='commits'])",
      ], "pr-tab-row.png");
    },
  },
  // E31: Merge conflict box
  {
    id: "pr-merge-conflict-box.png",
    description: "Red conflict status box",
    capture: async (page, ctx) => {
      if (ctx.conflictPrUrl) {
        await navigate(page, ctx.conflictPrUrl);
      }
      return safeElementShot(page, [
        '[data-testid="merge-message"]',
        ".mergeability-details",
        ".merge-status-list",
        ".branch-action-state-alert",
        'div:has-text("conflict"):visible',
      ], "pr-merge-conflict-box.png");
    },
  },
  // E32: Can't auto-merge notice
  {
    id: "pr-cant-automerge-box.png",
    description: "Grey can't automerge notice",
    capture: async (page, ctx) => {
      if (ctx.conflictPrUrl) {
        await navigate(page, ctx.conflictPrUrl);
      }
      return safeElementShot(page, [
        ':text("can\'t automatically merge"):visible',
        ':text("Can\'t automatically merge"):visible',
        '.branch-action-state-alert:has-text("merge")',
        '[data-testid="merge-conflict-banner"]',
      ], "pr-cant-automerge-box.png");
    },
  },
  // E33: Green merge button
  {
    id: "pr-merge-button.png",
    description: "Green merge button",
    capture: async (page, ctx) => {
      // Try the merged PR for this
      if (ctx.mergedPrUrl) {
        await navigate(page, ctx.mergedPrUrl);
      }
      return safeElementShot(page, [
        'button:has-text("Merge pull request")',
        ".merge-message .btn-primary",
        '[data-testid="merge-button"]',
        'button[data-details-container=".js-merge-pr"]',
      ], "pr-merge-button.png");
    },
  },
  // E34: Merged badge
  {
    id: "pr-merged-state-badge.png",
    description: "Purple Merged badge",
    capture: async (page, ctx) => {
      // Navigate to closed/merged PRs
      await navigate(page, `${REPO_URL}/pulls?q=is%3Apr+is%3Amerged`);
      const mergedPrLink = page.locator('a[data-testid="issue-title-link"], a[href*="/pull/"]').first();
      try {
        const href = await mergedPrLink.getAttribute("href", { timeout: 5000 });
        if (href) {
          const url = href.startsWith("http") ? href : `https://github.com${href}`;
          await navigate(page, url);
          ctx.mergedPrUrl = url;
        }
      } catch { /* continue */ }
      return safeElementShot(page, [
        '[title="Status: Merged"]',
        '.State--purple',
        ':text("Merged"):visible',
        '.gh-header-meta .State',
      ], "pr-merged-state-badge.png");
    },
  },
  // E35: Closed badge (skip gracefully if none)
  {
    id: "pr-closed-state-badge.png",
    description: "Red Closed badge (if applicable)",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/pulls?q=is%3Apr+is%3Aclosed`);
      const closedPrLink = page.locator('a[data-testid="issue-title-link"], a[href*="/pull/"]').first();
      try {
        const href = await closedPrLink.getAttribute("href", { timeout: 3000 });
        if (href) {
          const url = href.startsWith("http") ? href : `https://github.com${href}`;
          await navigate(page, url);
        }
      } catch {
        return { success: false, error: "No closed PRs found" };
      }
      return safeElementShot(page, [
        '[title="Status: Closed"]',
        '.State--red',
        '.gh-header-meta .State',
      ], "pr-closed-state-badge.png");
    },
  },
  // E36: Restore branch button
  {
    id: "pr-restore-branch-button.png",
    description: "Restore branch button",
    capture: async (page, ctx) => {
      if (ctx.mergedPrUrl) {
        await navigate(page, ctx.mergedPrUrl);
      }
      return safeElementShot(page, [
        'button:has-text("Restore branch")',
        'form:has(button:has-text("Restore"))',
        '[data-testid="restore-branch-button"]',
        '.post-merge-message button',
      ], "pr-restore-branch-button.png");
    },
  },
  // E37: Merge event in timeline
  {
    id: "pr-timeline-merge-event.png",
    description: "Merge event in timeline",
    capture: async (page, ctx) => {
      if (ctx.mergedPrUrl) {
        await navigate(page, ctx.mergedPrUrl);
      }
      return safeElementShot(page, [
        '.TimelineItem:has(.octicon-git-merge)',
        '[data-testid="merge-event"]',
        '.TimelineItem:has-text("merged commit")',
        'div:has(.octicon-git-merge):visible',
      ], "pr-timeline-merge-event.png");
    },
  },

  // --- CATEGORY F: Sync, Blame & Other ---

  // F38: Behind banner
  {
    id: "sync-behind-banner.png",
    description: "Yellow X commits behind banner",
    capture: async (page, ctx) => {
      // Switch to feature branch view
      await navigate(page, `${REPO_URL}/tree/feat/experimental-ai-logic`);
      return safeElementShot(page, [
        ':text("behind"):visible',
        '.branch-infobar',
        '[data-testid="branch-info-bar"]',
        '.flash:has-text("behind")',
        'div:has-text("commits behind"):visible',
      ], "sync-behind-banner.png");
    },
  },
  // F39: Blame view rows
  {
    id: "file-blame-rows.png",
    description: "Blame view with attribution blocks",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/blame/main/pipeline.py`);
      return safeElementShot(page, [
        ".blame-container",
        ".blame-hunk",
        '[data-testid="blame-view"]',
        "table.blame",
        ".blob-blame",
      ], "file-blame-rows.png");
    },
  },
  // F40: File view toolbar
  {
    id: "file-view-toolbar.png",
    description: "Raw/Blame/History buttons above file",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/blob/main/pipeline.py`);
      return safeElementShot(page, [
        '[data-testid="blob-header-edit-and-raw-actions"]',
        '.Box-header:has(a[href*="blame"])',
        '.btn-group:has(a[href*="raw"])',
        '.file-navigation',
        'div:has(> a:has-text("Raw")):visible',
      ], "file-view-toolbar.png");
    },
  },
  // F41: Network graph
  {
    id: "network-graph-crop.png",
    description: "Network graph branch visualization",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/network`);
      await page.waitForTimeout(2000); // Graph takes time to render
      return safeElementShot(page, [
        "#network",
        ".network-graph",
        "canvas",
        "#network-graph",
        ".js-network-graph",
      ], "network-graph-crop.png");
    },
  },
  // F42: Go to file modal
  {
    id: "go-to-file-modal.png",
    description: "Fuzzy finder with pipeline typed",
    capture: async (page, ctx) => {
      await navigate(page, REPO_URL);
      // Trigger file finder with 't' hotkey
      try {
        await page.keyboard.press("t");
        await page.waitForTimeout(CONFIG.animationDelay);
        // Type in search
        await page.keyboard.type("pipeline", { delay: 50 });
        await page.waitForTimeout(CONFIG.animationDelay);
      } catch { /* continue */ }
      return safeElementShot(page, [
        '[data-testid="file-finder"]',
        ".js-tree-finder",
        '[role="dialog"]:has(input)',
        ".file-finder-input",
        'react-app:has(input[placeholder*="Go to file"])',
      ], "go-to-file-modal.png");
    },
  },
  // F43: Branch protection rule (may 404)
  {
    id: "branch-protection-rule-checkbox.png",
    description: "Protection rule checkbox (skip if no access)",
    capture: async (page, ctx) => {
      try {
        const response = await page.goto(`${REPO_URL}/settings/branches`, {
          waitUntil: "networkidle",
          timeout: CONFIG.timeout,
        });
        if (response && response.status() === 404) {
          return { success: false, error: "Settings page not accessible (404)" };
        }
        await page.waitForTimeout(1000);
      } catch {
        return { success: false, error: "Could not navigate to branch settings" };
      }
      return safeElementShot(page, [
        'input[type="checkbox"][name*="protection"]',
        '.branch-protection-rule',
        '[data-testid="branch-protection-checkbox"]',
        'label:has-text("Require")',
      ], "branch-protection-rule-checkbox.png");
    },
  },
  // F44: Commit activity bars (Insights)
  {
    id: "commit-activity-bars.png",
    description: "Insights commit activity chart",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/graphs/commit-activity`);
      await page.waitForTimeout(2000); // Charts take time
      return safeElementShot(page, [
        "svg.js-commit-activity-graph",
        '[data-testid="commit-activity-graph"]',
        ".js-commit-activity-graph",
        "svg:has(rect)",
        "main svg",
        ".graph-canvas",
      ], "commit-activity-bars.png");
    },
  },
];

// --- Full Page Shots ---

const fullPageShots = [
  {
    id: "full-repo-home.png",
    description: "Repository home page Code tab",
    capture: async (page, ctx) => {
      await navigate(page, REPO_URL);
      await viewportShot(page, "full-repo-home.png");
      return { success: true };
    },
  },
  {
    id: "full-commit-history.png",
    description: "Commits history page /commits/main",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/commits/main`);
      await viewportShot(page, "full-commit-history.png");
      return { success: true };
    },
  },
  {
    id: "full-commit-detail.png",
    description: "Single commit page",
    capture: async (page, ctx) => {
      if (ctx.commitUrl) {
        await navigate(page, ctx.commitUrl);
      } else {
        await navigate(page, `${REPO_URL}/commits/main`);
      }
      await viewportShot(page, "full-commit-detail.png");
      return { success: true };
    },
  },
  {
    id: "full-branches-page.png",
    description: "Branches page /branches",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/branches`);
      await viewportShot(page, "full-branches-page.png");
      return { success: true };
    },
  },
  {
    id: "full-pr-list.png",
    description: "Pull requests tab",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/pulls`);
      await viewportShot(page, "full-pr-list.png");
      return { success: true };
    },
  },
  {
    id: "full-pr-open-conflict.png",
    description: "The conflicting PR page",
    capture: async (page, ctx) => {
      if (ctx.conflictPrUrl) {
        await navigate(page, ctx.conflictPrUrl);
      } else {
        await navigate(page, `${REPO_URL}/pulls`);
      }
      await viewportShot(page, "full-pr-open-conflict.png");
      return { success: true };
    },
  },
  {
    id: "full-pr-merged.png",
    description: "The merged PR page",
    capture: async (page, ctx) => {
      if (ctx.mergedPrUrl) {
        await navigate(page, ctx.mergedPrUrl);
      } else {
        await navigate(page, `${REPO_URL}/pulls?q=is%3Apr+is%3Amerged`);
      }
      await viewportShot(page, "full-pr-merged.png");
      return { success: true };
    },
  },
  {
    id: "full-pr-files-changed.png",
    description: "Files changed tab",
    capture: async (page, ctx) => {
      const url = ctx.conflictPrUrl
        ? `${ctx.conflictPrUrl}/files`
        : `${REPO_URL}/pulls`;
      await navigate(page, url);
      await viewportShot(page, "full-pr-files-changed.png");
      return { success: true };
    },
  },
  {
    id: "full-file-view.png",
    description: "pipeline.py file view",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/blob/main/pipeline.py`);
      await viewportShot(page, "full-file-view.png");
      return { success: true };
    },
  },
  {
    id: "full-file-blame.png",
    description: "pipeline.py blame view",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/blame/main/pipeline.py`);
      await viewportShot(page, "full-file-blame.png");
      return { success: true };
    },
  },
  {
    id: "full-network-graph.png",
    description: "Network graph page",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/network`);
      await page.waitForTimeout(2000);
      await viewportShot(page, "full-network-graph.png");
      return { success: true };
    },
  },
  {
    id: "full-insights-traffic.png",
    description: "Insights page",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/graphs/traffic`);
      await page.waitForTimeout(1000);
      await viewportShot(page, "full-insights-traffic.png");
      return { success: true };
    },
  },
  {
    id: "full-releases-page.png",
    description: "Releases page",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/releases`);
      await viewportShot(page, "full-releases-page.png");
      return { success: true };
    },
  },
  {
    id: "full-tags-page.png",
    description: "Tags page",
    capture: async (page, ctx) => {
      await navigate(page, `${REPO_URL}/tags`);
      await viewportShot(page, "full-tags-page.png");
      return { success: true };
    },
  },
  {
    id: "full-repo-settings.png",
    description: "Settings general (skip if 404/auth required)",
    capture: async (page, ctx) => {
      try {
        const response = await page.goto(`${REPO_URL}/settings`, {
          waitUntil: "networkidle",
          timeout: CONFIG.timeout,
        });
        if (response && response.status() === 404) {
          return { success: false, error: "Settings not accessible" };
        }
        await page.waitForTimeout(1000);
        await viewportShot(page, "full-repo-settings.png");
        return { success: true };
      } catch {
        return { success: false, error: "Could not navigate to settings" };
      }
    },
  },
];

// =============================================================================
// Main Execution
// =============================================================================

async function main() {
  console.log("=".repeat(60));
  console.log(" Screenshot Capture Pipeline");
  console.log("=".repeat(60));
  console.log(`\n  Repo:     ${REPO_URL}`);
  console.log(`  Viewport: ${CONFIG.viewport.width}×${CONFIG.viewport.height} @${CONFIG.deviceScaleFactor}x`);
  console.log(`  Headed:   ${!CONFIG.headless}`);
  console.log(`  Auth:     ${GITHUB_TOKEN ? "Token provided" : "No token (public access)"}`);
  console.log(`\n  Output:`);
  console.log(`    Closeups:  ${CLOSEUP_DIR}`);
  console.log(`    Full-page: ${FULLPAGE_DIR}`);
  console.log("");

  // Launch browser
  const launchOptions = {
    headless: CONFIG.headless,
  };

  const browser = await chromium.launch(launchOptions);

  const contextOptions = {
    viewport: CONFIG.viewport,
    deviceScaleFactor: CONFIG.deviceScaleFactor,
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  };

  // If GitHub token is provided, set it as a cookie
  if (GITHUB_TOKEN) {
    contextOptions.storageState = {
      cookies: [
        {
          name: "user_session",
          value: GITHUB_TOKEN,
          domain: ".github.com",
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "Lax",
        },
      ],
      origins: [],
    };
  }

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  // Set default timeout
  page.setDefaultTimeout(CONFIG.timeout);

  // Shared context for passing data between shots
  const ctx = {
    commitUrl: null,
    conflictPrUrl: null,
    mergedPrUrl: null,
  };

  const results = { closeups: [], fullPage: [] };

  // --- Run Closeup Shots ---
  console.log("\n─── Closeup Screenshots (44) ───\n");

  for (let i = 0; i < closeupShots.length; i++) {
    const shot = closeupShots[i];
    const num = String(i + 1).padStart(2, " ");
    process.stdout.write(`  [${num}/44] ${shot.id} ... `);

    try {
      const result = await shot.capture(page, ctx);
      if (result.success) {
        console.log("✓");
        results.closeups.push({ ...shot, success: true });
      } else {
        console.log(`✗ (${result.error || "unknown"})`);
        results.closeups.push({ ...shot, success: false, error: result.error });
      }
    } catch (err) {
      console.log(`✗ (${err.message})`);
      results.closeups.push({ ...shot, success: false, error: err.message });
    }

    // Small delay between shots to avoid hammering GitHub
    await page.waitForTimeout(500);
  }

  // --- Run Full Page Shots ---
  console.log("\n─── Full Page Screenshots (15) ───\n");

  for (let i = 0; i < fullPageShots.length; i++) {
    const shot = fullPageShots[i];
    const num = String(i + 1).padStart(2, " ");
    process.stdout.write(`  [${num}/15] ${shot.id} ... `);

    try {
      const result = await shot.capture(page, ctx);
      if (result.success) {
        console.log("✓");
        results.fullPage.push({ ...shot, success: true });
      } else {
        console.log(`✗ (${result.error || "unknown"})`);
        results.fullPage.push({ ...shot, success: false, error: result.error });
      }
    } catch (err) {
      console.log(`✗ (${err.message})`);
      results.fullPage.push({ ...shot, success: false, error: err.message });
    }

    await page.waitForTimeout(500);
  }

  // --- Cleanup ---
  await context.close();
  await browser.close();

  // --- Generate MANIFEST.txt ---
  generateManifest(results);

  // --- Print Summary ---
  printSummary(results);
}

function generateManifest(results) {
  const lines = [];
  const closeupSuccess = results.closeups.filter((r) => r.success).length;
  const fullSuccess = results.fullPage.filter((r) => r.success).length;

  lines.push(`# Screenshot Manifest`);
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push(`# Repo: ${REPO_URL}`);
  lines.push(`# Closeups: ${closeupSuccess}/${results.closeups.length} captured`);
  lines.push(`# Full Page: ${fullSuccess}/${results.fullPage.length} captured`);
  lines.push("");

  lines.push(`## Closeups (${results.closeups.length})`);
  results.closeups.forEach((shot, i) => {
    const status = shot.success ? "" : " [PENDING]";
    lines.push(
      `${i + 1} | ${shot.id}${status} | ${shot.description} | ${REPO_URL}`
    );
  });

  lines.push("");
  lines.push(`## Full Page (${results.fullPage.length})`);
  results.fullPage.forEach((shot, i) => {
    const status = shot.success ? "" : " [PENDING]";
    lines.push(
      `${i + 1} | ${shot.id}${status} | ${shot.description} | ${REPO_URL}`
    );
  });

  writeFileSync(MANIFEST_PATH, lines.join("\n") + "\n");
  console.log(`\n  Manifest written to: ${MANIFEST_PATH}`);
}

function printSummary(results) {
  const closeupSuccess = results.closeups.filter((r) => r.success).length;
  const fullSuccess = results.fullPage.filter((r) => r.success).length;
  const total = results.closeups.length + results.fullPage.length;
  const totalSuccess = closeupSuccess + fullSuccess;

  console.log("\n" + "=".repeat(60));
  console.log(" CAPTURE SUMMARY");
  console.log("=".repeat(60));
  console.log(`\n  Closeups:   ${closeupSuccess}/${results.closeups.length} captured`);
  console.log(`  Full Page:  ${fullSuccess}/${results.fullPage.length} captured`);
  console.log(`  Total:      ${totalSuccess}/${total}`);

  // List failures
  const failures = [
    ...results.closeups.filter((r) => !r.success),
    ...results.fullPage.filter((r) => !r.success),
  ];

  if (failures.length > 0) {
    console.log(`\n  Failed (${failures.length}):`);
    failures.forEach((f) => {
      console.log(`    ✗ ${f.id} — ${f.error || "unknown error"}`);
    });
  }

  console.log("\n" + "=".repeat(60));
  console.log(
    totalSuccess === total
      ? "  All screenshots captured successfully! 🎉"
      : `  ${failures.length} screenshot(s) need manual review.`
  );
  console.log("=".repeat(60) + "\n");
}

// Run
main().catch((err) => {
  console.error("\nFATAL ERROR:", err.message);
  process.exit(1);
});
