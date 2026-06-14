# Requirements Document

## Introduction

A Playwright-based screenshot capture pipeline that produces tight-cropped, high-DPI screenshots of GitHub UI elements for use in the learngit project's pixel-dissolve HTML cards. The pipeline consists of three parts: a bash setup script that generates a mock GitHub repository with specific git scenarios, a Playwright capture script that navigates to the live repo and screenshots individual DOM elements, and a manifest file documenting every captured image.

## Glossary

- **Pipeline**: The complete system comprising the Setup_Script, Capture_Script, and Manifest_Generator working together to produce the screenshot assets
- **Setup_Script**: A bash script that creates and configures the mock GitHub repository with all required git scenarios (branches, conflicts, commits, PRs)
- **Capture_Script**: A Playwright script that navigates to the mock repository on GitHub and captures element-level screenshots
- **Mock_Repository**: A dedicated public GitHub repository created solely as a staging environment for screenshot capture
- **Manifest**: A text file in the /screenshots directory that serves as a table of contents for all captured images
- **Shot_List**: The complete set of defined screenshots to capture, each with a unique identifier and target DOM element
- **Element_Screenshot**: A screenshot captured using Playwright's element.screenshot() method, cropping to the bounding box of a specific DOM element
- **Device_Scale_Factor**: The pixel density multiplier used during capture (2x) to produce high-DPI images

## Requirements

### Requirement 1: Mock Repository Initialization

**User Story:** As a developer, I want a bash script that creates a public mock GitHub repository with realistic git history, so that I have an authentic staging environment for screenshot capture.

#### Acceptance Criteria

1. WHEN the Setup_Script is executed, THE Setup_Script SHALL initialize a new git repository with a `.gitignore` file containing entries for `.env`, `*.pt`, and `node_modules/`
2. WHEN the Setup_Script is executed, THE Setup_Script SHALL create an initial commit with the message "chore: initialize repository structure"
3. WHEN the Setup_Script completes initialization, THE Setup_Script SHALL configure the git remote to point to the Mock_Repository on GitHub
4. WHEN the Setup_Script is executed, THE Setup_Script SHALL push all branches and tags to the Mock_Repository remote
5. WHEN the Setup_Script creates or verifies the Mock_Repository on GitHub, THE Setup_Script SHALL ensure the repository visibility is set to public
6. IF the push to the Mock_Repository remote fails due to authentication or network errors, THEN THE Setup_Script SHALL exit with a non-zero exit code and display an error message indicating the failure reason

### Requirement 2: Branch and Conflict Scenario Generation

**User Story:** As a developer, I want the setup script to generate specific branch structures and merge conflicts, so that the mock repository contains all states needed for the screenshot shot list.

#### Acceptance Criteria

1. WHEN the Setup_Script is executed, THE Setup_Script SHALL create a branch named `feat/experimental-ai-logic` from main with at least one commit that modifies overlapping lines in an existing tracked file (the same file created during repository initialization or an early main commit)
2. WHEN the Setup_Script is executed, THE Setup_Script SHALL create at least one commit on main that modifies the same lines in the same file as `feat/experimental-ai-logic`, producing a content-level merge conflict detectable by `git merge --no-commit`
3. WHEN the Setup_Script is executed, THE Setup_Script SHALL produce a state where the `feat/experimental-ai-logic` branch is at least 3 commits behind main and has not been merged into main
4. WHEN the Setup_Script is executed, THE Setup_Script SHALL create at least 3 sequential commits on main (including the divergent commit from criterion 2) with imperative-mood messages using conventional commit prefixes (feat:, fix:, chore:)
5. WHEN the Setup_Script is executed, THE Setup_Script SHALL create the `feat/experimental-ai-logic` branch before adding the divergent commits to main, so that the branch point precedes the conflicting changes

### Requirement 3: Pull Request Scenario Generation

**User Story:** As a developer, I want the setup script to create pull requests with specific states (conflicting, merged, closed), so that I can capture PR-related UI elements.

#### Acceptance Criteria

1. WHEN the Setup_Script is executed, THE Setup_Script SHALL create a pull request from `feat/experimental-ai-logic` to main that cannot be automatically merged due to conflicts
2. WHEN the Setup_Script is executed, THE Setup_Script SHALL create at least one merged pull request whose source branch has been deleted, so that the "Restore branch" button appears in its timeline
3. WHEN the Setup_Script is executed, THE Setup_Script SHALL use the `gh` CLI tool to create pull requests programmatically
4. IF the `gh` CLI tool is not authenticated, THEN THE Setup_Script SHALL display an error message instructing the user to run `gh auth login` before proceeding
5. IF the `gh` CLI tool is not installed on the system, THEN THE Setup_Script SHALL display an error message instructing the user to install the GitHub CLI and exit with a non-zero status code

### Requirement 4: Commit Signing Scenario

**User Story:** As a developer, I want the mock repository to contain verified (signed) commits, so that I can capture the green "Verified" badge in the commit timeline.

#### Acceptance Criteria

1. WHEN the Setup_Script creates commits intended for the commit-timeline screenshot, THE Setup_Script SHALL sign at least 3 of those commits using GPG or SSH signing (matching the local git configuration's `commit.gpgsign` and `gpg.format` settings) so they display as "Verified" on GitHub
2. WHEN the Setup_Script begins execution, THE Setup_Script SHALL verify that commit signing is configured by checking that `git config user.signingkey` returns a non-empty value and that the corresponding signing program (gpg or ssh-keygen) is available on the system
3. IF the signing key check fails or the signing program is unavailable, THEN THE Setup_Script SHALL print a warning to stdout indicating which configuration is missing, print the list of commit messages that will lack the "Verified" badge, and continue execution without signing
4. WHEN the Setup_Script signs commits successfully, THE Setup_Script SHALL print a notice to stdout reminding the user that the signing key must be registered in their GitHub account settings for the "Verified" badge to appear

### Requirement 5: Playwright Capture Configuration

**User Story:** As a developer, I want the Playwright capture script to use a full desktop viewport with high-DPI scaling, so that screenshots are sharp and represent real desktop usage.

#### Acceptance Criteria

1. THE Capture_Script SHALL configure the browser viewport to a width of 1440 pixels and a height of 900 pixels
2. THE Capture_Script SHALL set the device scale factor to 2x for all captures
3. THE Capture_Script SHALL launch the Chromium browser in headed mode with JavaScript execution enabled and SHALL wait for web fonts to finish loading before considering a page render complete
4. IF the Mock_Repository requires authentication to access any target page, THEN THE Capture_Script SHALL authenticate using a stored browser session state file before navigating to that page
5. IF no stored browser session state file is present and authentication is required, THEN THE Capture_Script SHALL log an error message indicating the missing session state and skip captures that require authentication

### Requirement 6: Element-Level Screenshot Capture — Closeups (44 shots)

**User Story:** As a developer, I want the Playwright script to capture tight-cropped screenshots of specific GitHub UI elements that are genuinely useful as teaching assets on the learngit microsite.

All shots: `element.screenshot()`, 1440×900 viewport, deviceScaleFactor 2, full-color PNG, no filters applied. Output to `/screenshots/closeups/`.

---

**CATEGORY A — Repository Structure (shots 1–5)**

1. `repo-file-tree.png` — The full file listing grid showing `pipeline.py`, `.gitignore`, `README.md` with file icons, names, and commit messages side by side. The whole table, no surrounding chrome.

2. `gitignore-file-row.png` — Single isolated row for `.gitignore`: file icon, filename, and its commit message. One row, nothing else.

3. `readme-rendered-preview.png` — The rendered README.md card below the file tree. First heading and first paragraph only. Crop at the bottom of the first paragraph.

4. `repo-about-panel.png` — The right-side "About" sidebar: description text, topics chips, stars, forks, watchers. No surrounding page chrome.

5. `repo-tab-bar.png` — The full tab row: Code, Issues, Pull Requests, Actions, Projects, Security, Insights, Settings. Active tab highlighted. Nothing above or below.

---

**CATEGORY B — Branching (shots 6–11)**

6. `branch-selector-closed.png` — The branch/tag selector button in closed state showing the branch icon and "main" label. Button only, no surrounding toolbar.

7. `branch-selector-open-empty.png` — Dropdown open, search field empty, showing both `main` and `feat/experimental-ai-logic` in the list. The full dropdown panel.

8. `branch-selector-typing.png` — Dropdown open, `feat/experimental-ai-logic` typed in search, "Create branch: feat/experimental-ai-logic from 'main'" prompt visible. The full dropdown panel.

9. `branch-list-all.png` — The `/branches` page branch table: default branch row for `main`, active branch row for `feat/experimental-ai-logic` showing last commit message, time, and the "3 commits behind" badge. Table rows only.

10. `branch-behind-badge.png` — Ultra-tight crop: just the orange/yellow "3 commits behind" pill badge from the branch list row. Nothing else.

11. `default-branch-label.png` — The green "default" badge next to `main` on the branches page. Tight crop on just that badge and the branch name.

---

**CATEGORY C — Commits & History (shots 12–20)**

12. `commit-history-four-rows.png` — Four consecutive commit rows in the commit timeline: conventional commit messages (`feat:`, `fix:`, `chore:`), short hashes, relative timestamps. The four rows as a block.

13. `commit-verified-badge.png` — One commit row cropped to show only the green "Verified" badge and the short hash next to it. Macro close.

14. `commit-hash-chip.png` — The 7-character short hash chip with copy icon. One row, cropped to just the hash area on the right side.

15. `commit-detail-header.png` — Top of a single commit detail page: full commit message, author avatar + name, date, and "1 parent" link. No diff below.

16. `commit-diff-stat-bar.png` — The colored additions/deletions stat bar at the top of a commit page: `+3 −2` with the green/red proportional bar. Tight horizontal crop.

17. `commit-file-diff-block.png` — One file's unified diff: the file header row (`pipeline.py`) plus 6–8 lines of diff showing `+` green and `−` red lines with line numbers.

18. `commit-parent-link.png` — The "1 parent" link in a commit header that references the parent commit hash. Shows the relationship between commits.

19. `commit-tree-indicator.png` — The branch+commit topology indicator on a commit detail page showing which branch the commit belongs to.

20. `commit-browse-files-button.png` — The "Browse files" button on a commit detail page that takes you to the repo tree at that point in history.

---

**CATEGORY D — Diffs & Code Review (shots 21–27)**

21. `split-diff-panel.png` — Full split diff of `pipeline.py`: left (red, deleted `return 'clean data'`), right (green, added `return torch.tensor([1,2,3])`). Line numbers visible. The diff panel, no PR chrome above.

22. `split-diff-gutter.png` — Extreme macro: just the center gutter column between the two halves of the split diff — the line numbers and the +/- indicators at the boundary.

23. `unified-diff-hunk-header.png` — The `@@ -1,4 +1,4 @@` hunk header line plus 2 context lines above and 2 below. Shows hunk notation in context.

24. `diff-line-comment-trigger.png` — The blue `+` button that appears when hovering a diff line number, before clicking. Shows the inline comment entry point.

25. `diff-inline-comment-box.png` — The expanded inline comment textarea that opens after clicking a diff line, with the "Add single comment" and "Start a review" buttons.

26. `diff-file-header-row.png` — The file header bar at the top of a diff: filename, `+3 −2` stat, "View file" link, and the diff settings gear icon.

27. `diff-viewed-checkbox.png` — The "Viewed" checkbox in the top-right of a PR file diff header — the mechanism for marking a file reviewed.

---

**CATEGORY E — Pull Requests (shots 28–37)**

28. `pr-list-row.png` — One PR row in the PR list: title, open/closed badge, branch label, author, and comment count. Single row isolation.

29. `pr-header-block.png` — The PR page header: title, "Open" green badge, author, `feat/experimental-ai-logic → main` branch arrow, commit count pill.

30. `pr-tab-row.png` — The PR internal tab bar: Conversation, Commits, Checks, Files changed — with the active tab and file count badge.

31. `pr-merge-conflict-box.png` — The red conflict status box: X icon, "This branch has conflicts that must be resolved", and the "Resolve conflicts" button.

32. `pr-cant-automerge-box.png` — The grey box: "Can't automatically merge. You can still create the pull request." Teaches the open-despite-conflict pattern.

33. `pr-merge-button.png` — The green "Merge pull request" button with its dropdown arrow on a clean (mergeable) PR. Button only.

34. `pr-merged-state-badge.png` — The purple "Merged" badge in a merged PR header. Tight crop on the badge + surrounding title area.

35. `pr-closed-state-badge.png` — The red "Closed" badge in a closed PR header.

36. `pr-restore-branch-button.png` — The "Restore branch" button in the timeline of a merged PR whose branch was deleted.

37. `pr-timeline-merge-event.png` — The merge event in a PR activity timeline: the purple merge icon, commit hash reference, and "merged into main" text.

---

**CATEGORY F — Sync, Blame & File Views (shots 38–44)**

38. `sync-behind-banner.png` — The full yellow warning banner: "This branch is 3 commits behind main." with the "Sync fork" button. Banner element only.

39. `file-blame-rows.png` — The blame view of `pipeline.py`: left-side commit blocks (short hash, author, relative date) aligned with each line of code. 6–8 rows.

40. `file-view-toolbar.png` — The toolbar above a file's source view: "Raw", "Blame", "History" buttons, lines/size metadata, copy/download icons.

41. `network-graph-crop.png` — The `/network` graph showing the `main` and `feat/experimental-ai-logic` branches diverging as colored lines with commit dots.

42. `go-to-file-modal.png` — The "Go to file" fuzzy finder modal: search field with `pipeline` typed, `pipeline.py` highlighted as top result.

43. `branch-protection-rule-checkbox.png` — The "Require a pull request before merging" checkbox in the branch protection rules settings, checked. Just the checkbox, label, and description text.

44. `commit-activity-bars.png` — The weekly commit activity bar chart from the Insights tab. 12 weeks of bars showing project activity rhythm.

---

#### Acceptance Criteria

1. THE Capture_Script SHALL use Playwright's `element.screenshot()` for all 44 closeup shots and save them to `/screenshots/closeups/`
2. FOR each shot, THE Capture_Script SHALL navigate to the required URL, perform any required interactions (clicks, typing, keyboard shortcuts), wait for stability, then capture the named element
3. WHEN capturing branch selector shots (8, 9, 10, 11), THE Capture_Script SHALL click the selector and type the required text before capturing
4. WHEN capturing diff shots (21–27), THE Capture_Script SHALL navigate to the conflicting PR and ensure split mode is active before capturing split diff shots
5. WHEN capturing the blame view (shot 39), THE Capture_Script SHALL click the "Blame" button on the file view before capturing
6. WHEN capturing the go-to-file modal (shot 42), THE Capture_Script SHALL press `t` to open the modal and type `pipeline` before capturing
7. IF an element's bounding box is 0×0 pixels, THE Capture_Script SHALL log a warning with the shot ID and skip it
8. THE Capture_Script SHALL attempt all 44 closeup shots exactly once per session

### Requirement 7: Full-Page Screenshots (15 shots)

**User Story:** As a developer, I want full-page screenshots of every major GitHub page in the mock repository, so I have reference material for any context where a full layout view is needed.

All shots: `page.screenshot({ fullPage: false })` at 1440×900 viewport, deviceScaleFactor 2. Captures the visible viewport only (no infinite scroll). Output to `/screenshots/full-page/`. No identifiable username, email, or private data — mock repo only, generic commit author name.

---

**Full-Page Shot List**

FP-1. `full-repo-home.png` — The repository home page (Code tab): file tree, README preview, About sidebar. The complete 1440×900 viewport.

FP-2. `full-commit-history.png` — The `/commits/main` page showing the commit list with pagination. Full viewport.

FP-3. `full-commit-detail.png` — A single commit detail page: header, stat bar, and the full diff of `pipeline.py`. Full viewport.

FP-4. `full-branches-page.png` — The `/branches` page showing the branch table with both `main` and `feat/experimental-ai-logic`. Full viewport.

FP-5. `full-pr-list.png` — The Pull Requests tab showing the open PR and the merged PR. Full viewport.

FP-6. `full-pr-open-conflict.png` — The full page of the open conflicting PR: header, conversation tab, merge conflict box. Full viewport.

FP-7. `full-pr-merged.png` — The full page of the merged PR: purple header, timeline with merge event, restore branch button. Full viewport.

FP-8. `full-pr-files-changed.png` — The "Files changed" tab of the conflicting PR showing the full split diff. Full viewport.

FP-9. `full-file-view.png` — The `pipeline.py` file view: toolbar, line-numbered source, about/metadata sidebar. Full viewport.

FP-10. `full-file-blame.png` — The blame view of `pipeline.py` with full commit attribution sidebar. Full viewport.

FP-11. `full-network-graph.png` — The `/network` page showing the complete branch topology graph. Full viewport.

FP-12. `full-insights-traffic.png` — The Insights → Traffic page showing views/clones graphs. Full viewport.

FP-13. `full-releases-page.png` — The `/releases` page with the `v1.0.0` release entry. Full viewport.

FP-14. `full-tags-page.png` — The `/tags` page listing the `v1.0.0` tag. Full viewport.

FP-15. `full-repo-settings.png` — The General settings page (repo name, default branch, danger zone). Full viewport. No identifying info — mock repo only.

---

#### Acceptance Criteria

1. THE Capture_Script SHALL use `page.screenshot({ fullPage: false })` for all 15 full-page shots, capturing exactly the 1440×900 viewport
2. THE Capture_Script SHALL save full-page shots to `/screenshots/full-page/` using the kebab-case filenames defined in the shot list
3. THE Capture_Script SHALL navigate to each required URL and wait for the page to be fully loaded (network idle, fonts rendered) before capturing
4. THE Capture_Script SHALL not capture any page that displays a real username, email address, or any private repository data — all captures use the public mock repository only
5. IF a full-page shot navigation fails, THE Capture_Script SHALL log the failure and continue to the next shot

### Requirement 7: Screenshot Output Format

**User Story:** As a developer, I want all screenshots saved as PNG files with consistent naming in the /screenshots directory, so that they integrate predictably with the build pipeline.

#### Acceptance Criteria

1. THE Capture_Script SHALL save all captured images as PNG files in the `/screenshots` directory at the project root
2. THE Capture_Script SHALL create the `/screenshots` directory if it does not already exist before writing any output files
3. THE Capture_Script SHALL name each output file using the kebab-case identifier from the Shot_List (e.g., `branches-dropdown.png`, `split-diff-verification.png`)
4. IF a file with the same name already exists in the `/screenshots` directory, THEN THE Capture_Script SHALL overwrite it with the new capture
5. THE Capture_Script SHALL produce PNG files at 2x resolution relative to the captured element's CSS dimensions
6. IF a screenshot capture fails for any element, THEN THE Capture_Script SHALL log the error with the shot identifier to stderr and continue capturing remaining shots
7. WHEN all captures are complete, THE Capture_Script SHALL print a summary to stdout listing the count of successful captures and the count of failed or skipped captures

### Requirement 8: Screenshot Output Format

**User Story:** As a developer, I want all screenshots saved as PNG files with consistent naming in organized subdirectories, so that they integrate predictably.

#### Acceptance Criteria

1. THE Capture_Script SHALL save closeup shots to `/screenshots/closeups/` and full-page shots to `/screenshots/full-page/`, creating both directories if they do not exist
2. THE Capture_Script SHALL name each file using the kebab-case identifier from the Shot_List with `.png` extension
3. IF a file already exists, THE Capture_Script SHALL overwrite it
4. THE Capture_Script SHALL produce PNG files at 2x resolution (deviceScaleFactor 2)
5. IF a capture fails, THE Capture_Script SHALL log the error with the shot ID to stderr and continue
6. WHEN all captures are complete, THE Capture_Script SHALL print a summary: total attempted, successful, failed/skipped

### Requirement 9: Manifest Generation

**User Story:** As a developer, I want a manifest file that documents every screenshot with filename, type, and context, so I have a quick reference for all 59 assets.

#### Acceptance Criteria

1. WHEN the Capture_Script finishes all captures, THE Pipeline SHALL generate `MANIFEST.txt` in `/screenshots/`
2. THE Manifest SHALL have two sections: `## Closeups (44)` listing shots from `/screenshots/closeups/` and `## Full Page (15)` listing shots from `/screenshots/full-page/`
3. Each entry SHALL follow the format: `number | filename | one-line description | source URL or page`
4. IF a shot failed or was skipped, THE Manifest SHALL include it with `[PENDING]` after the filename
5. THE Manifest SHALL be regenerated fresh on every run, overwriting the previous version

### Requirement 10: Image Integration Compatibility

**User Story:** As a developer, I want screenshots captured without baked-in color filters, so that CSS grayscale and contrast adjustments can be applied dynamically in the pixel-dissolve cards.

#### Acceptance Criteria

1. THE Capture_Script SHALL capture all screenshots in full native color in the sRGB color space without applying any grayscale, contrast, or color manipulation filters, ensuring no Playwright image processing options (such as `omitBackground` or color adjustments) alter the output
2. THE Capture_Script SHALL produce images with an opaque background and no pre-applied CSS-equivalent filters, so that the CSS filter `grayscale(100%) contrast(1.1)` applied at display time in the HTML cards produces a uniform grayscale appearance across all screenshots
3. THE Capture_Script SHALL capture elements using Playwright's element bounding box without additional clipping inward, so that all text, icons, and interactive controls rendered within the element's computed dimensions are fully visible in the output image
4. IF a captured element's bounding box is partially obscured by an overlay, dropdown, or viewport edge, THEN THE Capture_Script SHALL scroll or dismiss the obstruction before capture to ensure the full element is visible

### Requirement 11: Setup Script Idempotency

**User Story:** As a developer, I want to re-run the setup script without manual cleanup, so that I can regenerate the mock repository state when GitHub UI changes require new screenshots.

#### Acceptance Criteria

1. WHEN the Setup_Script is run against an existing Mock_Repository, THE Setup_Script SHALL force-push all branches and force-update all tags to reset the repository to the state defined by the script's scenario generation steps
2. WHEN the Setup_Script is run, IF pull requests matching the script's defined titles already exist on the remote, THEN THE Setup_Script SHALL close and delete those pull requests before recreating them
3. IF the Mock_Repository remote does not exist, THEN THE Setup_Script SHALL create a public repository using the `gh` CLI before pushing
4. IF any idempotent reset operation fails (force-push, tag update, or pull request recreation), THEN THE Setup_Script SHALL exit with a non-zero status code and display an error message indicating which operation failed and the affected branch or pull request

### Requirement 12: Capture Script Resilience

**User Story:** As a developer, I want the capture script to handle GitHub UI loading delays and dynamic content gracefully, so that captures are reliable without manual intervention.

#### Acceptance Criteria

1. WHEN navigating to a GitHub page, THE Capture_Script SHALL wait for the target element to be visible and for no layout shifts or size changes to occur on that element for at least 500 milliseconds before capturing
2. THE Capture_Script SHALL accept a configurable timeout value via environment variable or command-line argument, defaulting to 30 seconds, that governs the maximum wait time for element visibility and stability
3. IF an element does not become visible and stable within the timeout period, THEN THE Capture_Script SHALL log a failure message containing the shot identifier and the timeout duration, then skip to the next capture without terminating the session
4. WHEN interacting with dropdown or expandable UI elements, THE Capture_Script SHALL wait until no CSS transitions or DOM mutations occur on the target element for at least 300 milliseconds before capturing
5. IF a page navigation fails due to a network error or returns a non-2xx HTTP status, THEN THE Capture_Script SHALL retry the navigation once after a 5-second delay, and if the retry also fails, log the failure with the shot identifier and skip to the next capture
