#!/bin/bash
# Deploy frontend to Vercel
set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Vercel Frontend Deployment                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

cd frontend

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel!"
    echo "Run: vercel login"
    exit 1
fi

echo "✅ Logged in to Vercel"
echo ""

echo "🚀 Deploying to Vercel..."
echo ""
echo "You'll be asked:"
echo "1. Set up and deploy? → Yes"
echo "2. Which scope? → samuelsaleh (your account)"
echo "3. Link to existing project? → No"
echo "4. Project name? → geo-app (or miageru-app)"
echo "5. In which directory? → ./ (just press Enter)"
echo "6. Override settings? → No (just press Enter)"
echo ""

read -p "Press Enter to start deployment..."

# Deploy to production
vercel --prod

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    DEPLOYMENT COMPLETE                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Your frontend is now live on Vercel!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your Vercel URL (shown above)"
echo "2. You'll need this when we deploy the backend"
echo ""
echo "⚠️  Note: Backend isn't deployed yet, so API calls won't work"
echo "   We'll connect them in the next step!"
echo ""
