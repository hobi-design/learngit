#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# setup-mock-repo.sh
# Creates a public GitHub repo with realistic git history for screenshot capture.
# Idempotent: safe to re-run. Will force-push and recreate PRs.
# =============================================================================

REPO_NAME="learning-git-demo"
GENERIC_NAME="Dev"
GENERIC_EMAIL="dev@example.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# -----------------------------------------------------------------------------
# Prerequisite checks
# -----------------------------------------------------------------------------
info "Checking prerequisites..."

# Check gh CLI
if ! command -v gh &> /dev/null; then
  err "GitHub CLI (gh) is not installed. Install it: https://cli.github.com/"
fi

# Check gh auth
if ! gh auth status &> /dev/null 2>&1; then
  err "GitHub CLI is not authenticated. Run: gh auth login"
fi

ok "gh CLI installed and authenticated"

# Check git signing config (optional)
SIGN_FLAG=""
if git config --global user.signingkey &> /dev/null && git config --global commit.gpgsign &> /dev/null; then
  ok "Git signing configured — commits will be signed"
  SIGN_FLAG="-S"
else
  warn "Git signing not configured — commits will NOT be signed (this is fine)"
fi

# Get GitHub username
GH_USER=$(gh api user --jq '.login')
info "GitHub user: $GH_USER"
REPO_FULL="$GH_USER/$REPO_NAME"

# -----------------------------------------------------------------------------
# Create or reuse repo
# -----------------------------------------------------------------------------
info "Checking if repo $REPO_FULL exists..."

if gh repo view "$REPO_FULL" &> /dev/null 2>&1; then
  ok "Repo $REPO_FULL already exists — will force-push"
else
  info "Creating public repo $REPO_FULL..."
  gh repo create "$REPO_NAME" --public --description "Demo repo for learning Git concepts" || err "Failed to create repo"
  ok "Created repo $REPO_FULL"
fi

# -----------------------------------------------------------------------------
# Work in temp directory
# -----------------------------------------------------------------------------
WORK_DIR=$(mktemp -d)
info "Working in temp directory: $WORK_DIR"
cd "$WORK_DIR"

git init -b main
git remote add origin "https://github.com/$REPO_FULL.git"

# Helper to commit with generic author
gc() {
  local msg="$1"
  shift
  git -c user.name="$GENERIC_NAME" -c user.email="$GENERIC_EMAIL" commit $SIGN_FLAG "$@" -m "$msg"
}

# -----------------------------------------------------------------------------
# Build git history
# -----------------------------------------------------------------------------
info "Building git history..."

# --- Initial commit: .gitignore ---
cat > .gitignore << 'EOF'
# Environment variables
.env
.env.local
.env.*.local

# Model weights
*.pt
*.pth
*.onnx

# Dependencies
node_modules/
__pycache__/
*.pyc

# OS files
.DS_Store
Thumbs.db
EOF

git add .gitignore
gc "Initial commit: add .gitignore" --allow-empty

# --- pipeline.py ---
cat > pipeline.py << 'EOF'
"""
Data pipeline for processing training datasets.
Handles ingestion, cleaning, and feature extraction.
"""

import json
from pathlib import Path


def load_dataset(filepath: str) -> list[dict]:
    """Load a JSON dataset from disk."""
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {filepath}")
    with open(path) as f:
        return json.load(f)


def clean_records(records: list[dict]) -> list[dict]:
    """Remove records with missing required fields."""
    required_fields = ["id", "text", "label"]
    cleaned = []
    for record in records:
        if all(field in record and record[field] for field in required_fields):
            cleaned.append(record)
    return cleaned


def extract_features(records: list[dict]) -> list[dict]:
    """Extract basic text features from records."""
    features = []
    for record in records:
        features.append({
            "id": record["id"],
            "word_count": len(record["text"].split()),
            "char_count": len(record["text"]),
            "label": record["label"],
        })
    return features


def run_pipeline(input_path: str, output_path: str) -> dict:
    """Execute the full pipeline: load → clean → extract → save."""
    raw = load_dataset(input_path)
    cleaned = clean_records(raw)
    features = extract_features(cleaned)

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    with open(output, "w") as f:
        json.dump(features, f, indent=2)

    return {
        "raw_count": len(raw),
        "cleaned_count": len(cleaned),
        "features_count": len(features),
        "output_path": str(output),
    }


if __name__ == "__main__":
    result = run_pipeline("data/input.json", "data/output.json")
    print(f"Pipeline complete: {result}")
EOF

git add pipeline.py
gc "Add data pipeline with load, clean, and extract stages"

# --- README.md ---
cat > README.md << 'EOF'
# Learning Git Demo

A sample data pipeline project used to demonstrate Git workflows, branching strategies, and collaboration patterns.

## Overview

This project processes training datasets through a multi-stage pipeline:

1. **Load** — Read raw JSON data from disk
2. **Clean** — Filter out incomplete records
3. **Extract** — Compute text features for downstream tasks

## Quick Start

```bash
python pipeline.py
```

## Project Structure

```
├── pipeline.py      # Main data pipeline
├── .gitignore       # Ignored files config
└── README.md        # This file
```

## License

MIT
EOF

git add README.md
gc "Add README with project overview and quick start"

ok "Main branch base created (3 commits)"

# --- Save the branch point commit ---
BRANCH_POINT=$(git rev-parse HEAD)

# --- Create feature branch from this point ---
info "Creating feature branch: feat/experimental-ai-logic"
git checkout -b feat/experimental-ai-logic

# Modify pipeline.py with AI-generated experimental code
cat > pipeline.py << 'EOF'
"""
Data pipeline for processing training datasets.
Handles ingestion, cleaning, feature extraction, and AI-powered analysis.
"""

import json
from pathlib import Path
from dataclasses import dataclass


@dataclass
class PipelineConfig:
    """Configuration for pipeline execution."""
    batch_size: int = 32
    confidence_threshold: float = 0.85
    enable_ai_analysis: bool = True


def load_dataset(filepath: str) -> list[dict]:
    """Load a JSON dataset from disk."""
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {filepath}")
    with open(path) as f:
        return json.load(f)


def clean_records(records: list[dict]) -> list[dict]:
    """Remove records with missing required fields and apply AI confidence filter."""
    required_fields = ["id", "text", "label"]
    cleaned = []
    for record in records:
        if all(field in record and record[field] for field in required_fields):
            # AI-generated: skip low-confidence predictions
            confidence = record.get("confidence", 1.0)
            if confidence >= PipelineConfig.confidence_threshold:
                cleaned.append(record)
    return cleaned


def extract_features(records: list[dict]) -> list[dict]:
    """Extract AI-enhanced text features from records."""
    features = []
    for record in records:
        feat = {
            "id": record["id"],
            "word_count": len(record["text"].split()),
            "char_count": len(record["text"]),
            "label": record["label"],
            # AI-generated: semantic complexity score
            "complexity_score": _compute_complexity(record["text"]),
            "token_density": len(record["text"].split()) / max(len(record["text"]), 1),
        }
        features.append(feat)
    return features


def _compute_complexity(text: str) -> float:
    """AI-generated: Compute semantic complexity heuristic."""
    words = text.split()
    if not words:
        return 0.0
    avg_word_len = sum(len(w) for w in words) / len(words)
    unique_ratio = len(set(words)) / len(words)
    return round(avg_word_len * unique_ratio, 4)


def run_pipeline(input_path: str, output_path: str, config: PipelineConfig = None) -> dict:
    """Execute the full pipeline: load → clean → extract → save."""
    if config is None:
        config = PipelineConfig()

    raw = load_dataset(input_path)
    cleaned = clean_records(raw)
    features = extract_features(cleaned)

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    with open(output, "w") as f:
        json.dump(features, f, indent=2)

    return {
        "raw_count": len(raw),
        "cleaned_count": len(cleaned),
        "features_count": len(features),
        "output_path": str(output),
        "ai_analysis_enabled": config.enable_ai_analysis,
    }


if __name__ == "__main__":
    config = PipelineConfig(batch_size=64, confidence_threshold=0.9)
    result = run_pipeline("data/input.json", "data/output.json", config)
    print(f"Pipeline complete: {result}")
EOF

git add pipeline.py
gc "feat: add AI-powered confidence filtering and complexity scoring"

# One more commit on the branch
cat > ai_utils.py << 'EOF'
"""Utility functions for AI-enhanced pipeline stages."""


def compute_embeddings(texts: list[str]) -> list[list[float]]:
    """Placeholder for embedding computation."""
    # TODO: integrate actual model
    return [[0.0] * 128 for _ in texts]


def classify_intent(text: str) -> str:
    """Simple keyword-based intent classifier."""
    keywords = {
        "question": ["what", "how", "why", "when"],
        "command": ["do", "run", "execute", "start"],
        "statement": ["is", "are", "was", "were"],
    }
    text_lower = text.lower()
    for intent, words in keywords.items():
        if any(w in text_lower.split() for w in words):
            return intent
    return "unknown"
EOF

git add ai_utils.py
gc "feat: add AI utility functions for embeddings and classification"

ok "Feature branch created with 2 commits"

# --- Go back to main and add diverging commits ---
info "Adding diverging commits on main..."
git checkout main

# Commit 4: Add config file
cat > config.json << 'EOF'
{
  "pipeline": {
    "input_dir": "data/raw",
    "output_dir": "data/processed",
    "batch_size": 100,
    "log_level": "INFO"
  },
  "validation": {
    "min_text_length": 10,
    "max_text_length": 5000,
    "required_fields": ["id", "text", "label"]
  }
}
EOF

git add config.json
gc "Add pipeline configuration file"

# Commit 5: Update pipeline.py (creates merge conflict)
cat > pipeline.py << 'EOF'
"""
Data pipeline for processing training datasets.
Handles ingestion, cleaning, and feature extraction.
"""

import json
from pathlib import Path


def load_dataset(filepath: str) -> list[dict]:
    """Load a JSON dataset from disk."""
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {filepath}")
    with open(path) as f:
        return json.load(f)


def clean_records(records: list[dict], min_length: int = 10) -> list[dict]:
    """Remove records with missing required fields or short text."""
    required_fields = ["id", "text", "label"]
    cleaned = []
    for record in records:
        if all(field in record and record[field] for field in required_fields):
            if len(record["text"]) >= min_length:
                cleaned.append(record)
    return cleaned


def validate_record(record: dict) -> bool:
    """Validate a single record against schema rules."""
    if not isinstance(record.get("id"), (int, str)):
        return False
    if not isinstance(record.get("text"), str):
        return False
    if len(record.get("text", "")) > 5000:
        return False
    return True


def extract_features(records: list[dict]) -> list[dict]:
    """Extract basic text features from records."""
    features = []
    for record in records:
        if not validate_record(record):
            continue
        features.append({
            "id": record["id"],
            "word_count": len(record["text"].split()),
            "char_count": len(record["text"]),
            "label": record["label"],
            "avg_word_length": _avg_word_length(record["text"]),
        })
    return features


def _avg_word_length(text: str) -> float:
    """Compute average word length."""
    words = text.split()
    if not words:
        return 0.0
    return round(sum(len(w) for w in words) / len(words), 2)


def run_pipeline(input_path: str, output_path: str) -> dict:
    """Execute the full pipeline: load → clean → extract → save."""
    raw = load_dataset(input_path)
    cleaned = clean_records(raw)
    features = extract_features(cleaned)

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    with open(output, "w") as f:
        json.dump(features, f, indent=2)

    return {
        "raw_count": len(raw),
        "cleaned_count": len(cleaned),
        "features_count": len(features),
        "output_path": str(output),
    }


if __name__ == "__main__":
    result = run_pipeline("data/input.json", "data/output.json")
    print(f"Pipeline complete: {result}")
EOF

git add pipeline.py
gc "Refactor: add validation, min_length filter, and avg_word_length"

# Commit 6: Add tests
cat > test_pipeline.py << 'EOF'
"""Unit tests for the data pipeline."""

import pytest
from pipeline import clean_records, extract_features, validate_record


def test_clean_removes_incomplete():
    records = [
        {"id": 1, "text": "hello world test", "label": "greeting"},
        {"id": 2, "text": "", "label": "empty"},
        {"id": 3, "label": "missing_text"},
    ]
    result = clean_records(records)
    assert len(result) == 1
    assert result[0]["id"] == 1


def test_clean_min_length():
    records = [
        {"id": 1, "text": "short", "label": "a"},
        {"id": 2, "text": "this is long enough text", "label": "b"},
    ]
    result = clean_records(records, min_length=10)
    assert len(result) == 1
    assert result[0]["id"] == 2


def test_validate_record():
    assert validate_record({"id": 1, "text": "hello", "label": "x"}) is True
    assert validate_record({"id": None, "text": "hello"}) is False
    assert validate_record({"id": 1, "text": "x" * 6000}) is False


def test_extract_features():
    records = [{"id": 1, "text": "hello world", "label": "test"}]
    features = extract_features(records)
    assert len(features) == 1
    assert features[0]["word_count"] == 2
    assert features[0]["avg_word_length"] == 5.0
EOF

git add test_pipeline.py
gc "Add unit tests for pipeline functions"

# Commit 7: Update README
cat >> README.md << 'EOF'

## Testing

```bash
pip install pytest
pytest test_pipeline.py -v
```

## Configuration

Edit `config.json` to customize pipeline behavior:
- `batch_size` — Number of records per processing batch
- `min_text_length` — Minimum character count for valid records
- `log_level` — Logging verbosity (DEBUG, INFO, WARN, ERROR)
EOF

git add README.md
gc "Update README with testing and configuration sections"

ok "Main branch now has 4 commits after branch point (total 7)"

# --- Create tag and release ---
info "Creating tag v1.0.0..."
git -c user.name="$GENERIC_NAME" -c user.email="$GENERIC_EMAIL" tag -a v1.0.0 -m "Release v1.0.0 — initial stable pipeline"

ok "Tag v1.0.0 created"

# --- Create a clean branch for the "merge then restore" PR ---
info "Creating clean branch: fix/update-readme-typo"
git checkout -b fix/update-readme-typo

# Make a small innocuous change
sed -i.bak 's/## License/## License\n\nThis project is released under the MIT License./' README.md 2>/dev/null || \
  sed 's/## License/## License\n\nThis project is released under the MIT License./' README.md > README.tmp && mv README.tmp README.md
rm -f README.md.bak

git add README.md
gc "docs: expand license section in README"

ok "Clean branch fix/update-readme-typo created"

# --- Push everything ---
info "Force-pushing all branches..."
git checkout main

git push --force origin main
git push --force origin feat/experimental-ai-logic
git push --force origin fix/update-readme-typo
git push --force --tags origin

ok "All branches and tags pushed"

# --- Create GitHub release ---
info "Creating GitHub release for v1.0.0..."
gh release delete v1.0.0 --repo "$REPO_FULL" --yes 2>/dev/null || true
gh release create v1.0.0 \
  --repo "$REPO_FULL" \
  --title "v1.0.0 — Initial Stable Pipeline" \
  --notes "First stable release of the data processing pipeline.

## What's Included
- JSON dataset loading
- Record cleaning with validation
- Feature extraction (word count, char count, avg word length)
- Configuration file support
- Unit tests

## Usage
\`\`\`bash
python pipeline.py
\`\`\`" \
  --latest

ok "Release v1.0.0 created"

# --- Clean up old PRs ---
info "Cleaning up any existing PRs..."
EXISTING_PRS=$(gh pr list --repo "$REPO_FULL" --state all --json number --jq '.[].number' 2>/dev/null || echo "")
for pr_num in $EXISTING_PRS; do
  gh pr close "$pr_num" --repo "$REPO_FULL" --delete-branch 2>/dev/null || true
done

# Re-push branches that might have been deleted
git push --force origin feat/experimental-ai-logic 2>/dev/null || true
git push --force origin fix/update-readme-typo 2>/dev/null || true

# --- Create PRs ---
info "Creating conflicting PR (feat/experimental-ai-logic → main)..."
gh pr create \
  --repo "$REPO_FULL" \
  --base main \
  --head feat/experimental-ai-logic \
  --title "feat: Add AI-powered analysis to pipeline" \
  --body "## Summary
Adds AI-powered confidence filtering and semantic complexity scoring to the data pipeline.

## Changes
- Added \`PipelineConfig\` dataclass for configuration
- Confidence threshold filtering in \`clean_records()\`
- Complexity score computation in \`extract_features()\`
- New \`ai_utils.py\` with embedding and classification utilities

## ⚠️ Known Issue
This branch has merge conflicts with main due to concurrent refactoring of \`pipeline.py\`.
Needs manual conflict resolution before merging.

## Testing
- [ ] Unit tests updated
- [ ] Integration test passed
- [ ] Manual review of AI scoring logic"

ok "Conflicting PR created"

# --- Create and merge the clean PR ---
info "Creating clean PR (fix/update-readme-typo → main)..."
CLEAN_PR_URL=$(gh pr create \
  --repo "$REPO_FULL" \
  --base main \
  --head fix/update-readme-typo \
  --title "docs: Expand license section in README" \
  --body "Small documentation update — adds explicit MIT license text to the README.

No code changes.")

info "Merging clean PR..."
sleep 2  # Give GitHub a moment to process
gh pr merge \
  --repo "$REPO_FULL" \
  --merge \
  --delete-branch \
  --subject "Merge pull request: docs: Expand license section in README" \
  $(echo "$CLEAN_PR_URL" | grep -o '[0-9]*$' || gh pr list --repo "$REPO_FULL" --head fix/update-readme-typo --json number --jq '.[0].number')

ok "Clean PR merged and branch deleted (Restore branch button now available)"

# --- Done ---
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN} Setup complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "Repository: ${BLUE}https://github.com/$REPO_FULL${NC}"
echo ""
echo "To capture screenshots, run:"
echo "  export REPO_URL=\"https://github.com/$REPO_FULL\""
echo "  npm run capture"
echo ""

# Cleanup
rm -rf "$WORK_DIR"
