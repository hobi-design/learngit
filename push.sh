#!/usr/bin/env bash
set -e

cd /home/nuxy/DevSpace/learngit

# Get GitHub username
GH_USER=$(gh api user --jq '.login')
echo "GitHub user: $GH_USER"

REPO_NAME="learngit"
REPO_FULL="$GH_USER/$REPO_NAME"

# Create repo if it doesn't exist
if gh repo view "$REPO_FULL" > /dev/null 2>&1; then
  echo "Repo $REPO_FULL already exists"
else
  echo "Creating repo $REPO_FULL..."
  gh repo create "$REPO_NAME" --public --description "Git fundamentals microsite for vibe coders + Playwright screenshot pipeline"
  echo "Created."
fi

# Set up git identity if not set
git config user.email || git config user.email "dev@example.com"
git config user.name || git config user.name "Dev"

# Init and commit
git checkout -b main 2>/dev/null || git checkout main

git add -A
git commit -m "chore: initial commit — learngit microsite + screenshot pipeline" || echo "Nothing to commit or already committed"

# Add remote
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$REPO_FULL.git"

# Push
git push -u origin main --force

echo ""
echo "DONE: https://github.com/$REPO_FULL"
