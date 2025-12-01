#!/bin/bash
# Railway Backend Deployment Script
# This script helps you deploy the backend to Railway with PostgreSQL

set -e  # Exit on error

echo "🚂 Railway Backend Deployment Helper"
echo "===================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo ""
    echo "Install it with: npm install -g @railway/cli"
    echo "Or: brew install railway"
    exit 1
fi

echo "✅ Railway CLI detected"
echo ""

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway:"
    railway login
fi

echo "✅ Logged in to Railway"
echo ""

# Navigate to backend directory
cd backend

echo "📋 Deployment Steps:"
echo "===================="
echo ""
echo "1️⃣  Create a new Railway project (if not exists):"
echo "   railway init"
echo ""
echo "2️⃣  Add PostgreSQL database:"
echo "   railway add --database postgres"
echo ""
echo "3️⃣  Set environment variables:"
echo "   You'll need to set these in Railway dashboard or via CLI:"
echo ""
echo "   Required variables:"
echo "   - SECRET_KEY (generate with: python -c 'import secrets; print(secrets.token_urlsafe(32))')"
echo "   - DEBUG=false"
echo "   - OPENAI_API_KEY=your_key"
echo "   - ANTHROPIC_API_KEY=your_key"
echo "   - GOOGLE_API_KEY=your_key"
echo "   - FRONTEND_URL=https://your-frontend.vercel.app"
echo ""
echo "   Railway will automatically set DATABASE_URL when you add PostgreSQL"
echo ""
echo "4️⃣  Deploy:"
echo "   railway up"
echo ""

read -p "Would you like to continue with deployment? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "🚀 Starting deployment process..."
echo ""

# Initialize project if needed
if [ ! -f ".railway" ]; then
    echo "Creating new Railway project..."
    railway init
fi

# Generate a strong secret key
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')

echo ""
echo "🔑 Generated SECRET_KEY: $SECRET_KEY"
echo ""
echo "⚠️  IMPORTANT: Save this key securely!"
echo ""

# Set basic environment variables via CLI
echo "Setting environment variables..."

railway variables --set "DEBUG=false"
railway variables --set "SECRET_KEY=$SECRET_KEY"

echo ""
echo "✅ Basic variables set!"
echo ""
echo "⚠️  You still need to set these manually in Railway dashboard:"
echo "   - OPENAI_API_KEY"
echo "   - ANTHROPIC_API_KEY"
echo "   - GOOGLE_API_KEY"
echo "   - FRONTEND_URL"
echo ""

read -p "Have you added PostgreSQL database? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Adding PostgreSQL..."
    railway add --database postgres
fi

echo ""
echo "📤 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Get your backend URL:"
echo "   railway domain"
echo ""
echo "📊 View logs:"
echo "   railway logs"
echo ""
echo "💻 Open dashboard:"
echo "   railway open"
echo ""
