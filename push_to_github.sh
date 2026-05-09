#!/bin/bash
# GitHub Push Script for RFID Tool Tracker
# Run this once from the Replit Shell:  bash push_to_github.sh

GITHUB_TOKEN="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"
REPO_URL="https://Ankitshukla63:${GITHUB_TOKEN}@github.com/Ankitshukla63/tool_tracker.git"

echo "Setting up git config..."
git config user.email "ankit@rfid-tool-tracker.com"
git config user.name "Ankit Shukla"

echo "Setting remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo "Pushing to GitHub..."
git push -u origin main --force

echo ""
echo "Done! Check your repo at: https://github.com/Ankitshukla63/tool_tracker"
