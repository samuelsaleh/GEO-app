#!/bin/bash
# Quick deployment script for Railway backend
set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Railway Backend Deployment                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

cd backend

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway!"
    echo "Run: railway login"
    exit 1
fi

echo "✅ Logged in to Railway"
echo ""

# Initialize project
echo "🚀 Step 1: Creating Railway project..."
echo ""
railway init

echo ""
echo "🗄️  Step 2: Adding PostgreSQL database..."
echo ""
railway add

echo ""
echo "🔑 Step 3: Setting environment variables..."
echo ""

# Generate secret key
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')

echo "Generated SECRET_KEY: $SECRET_KEY"
echo ""

# Set variables one by one
railway variables set SECRET_KEY="$SECRET_KEY"
railway variables set DEBUG="false"
railway variables set ALGORITHM="HS256"

echo ""
echo "✅ Basic variables set!"
echo ""
echo "⚠️  You still need to add these in Railway dashboard:"
echo "   - OPENAI_API_KEY (if using AI features)"
echo "   - ANTHROPIC_API_KEY (if using AI features)"
echo "   - GOOGLE_API_KEY (if using AI features)"
echo "   - FRONTEND_URL (after Vercel deployment)"
echo ""

read -p "Press Enter when ready to deploy..."

echo ""
echo "🚀 Step 4: Deploying to Railway..."
echo ""
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Getting your backend URL..."
railway domain

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    NEXT STEPS                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "1. Copy your Railway URL from above"
echo "2. Create admin user in production:"
echo "   railway run python create_admin.py"
echo ""
echo "3. Deploy frontend to Vercel (I'll help with this next)"
echo ""
