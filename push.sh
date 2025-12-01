#!/bin/bash
# Easy push script - pushes to both branches automatically

echo "🚀 Pushing to both branches..."

git push origin main
git push origin main:claude/geo-market-analysis-01Xo6GWLoTd3cjGmVjppCfUB

echo "✅ Done! Vercel will now deploy your changes."
