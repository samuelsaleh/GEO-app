#!/bin/bash
# Vercel Frontend Deployment Script
# This script helps you deploy the frontend to Vercel

set -e  # Exit on error

echo "▲ Vercel Frontend Deployment Helper"
echo "===================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo ""
    echo "Install it with: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI detected"
echo ""

# Navigate to frontend directory
cd frontend

echo "📋 Deployment Steps:"
echo "===================="
echo ""
echo "Before deploying, you'll need:"
echo "1. Your Railway backend URL (get it with: cd ../backend && railway domain)"
echo "2. Vercel account (sign up at https://vercel.com)"
echo ""

read -p "Do you have your Railway backend URL? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "⚠️  Please deploy your backend first:"
    echo "   cd backend"
    echo "   railway up"
    echo "   railway domain"
    echo ""
    exit 1
fi

echo ""
read -p "Enter your Railway backend URL (e.g., https://your-app.railway.app): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Backend URL is required"
    exit 1
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo ""
echo "During deployment, Vercel will ask you to:"
echo "1. Link to existing project or create new one"
echo "2. Set up project name"
echo "3. Configure root directory (should be './')"
echo ""
echo "After deployment, you'll need to:"
echo "1. Go to Vercel dashboard"
echo "2. Project Settings → Environment Variables"
echo "3. Add: NEXT_PUBLIC_API_URL = $BACKEND_URL"
echo "4. Redeploy"
echo ""

read -p "Ready to deploy? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "📤 Deploying..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "========================"
echo ""
echo "1. Set environment variable in Vercel:"
echo "   → Go to https://vercel.com/dashboard"
echo "   → Select your project"
echo "   → Settings → Environment Variables"
echo "   → Add: NEXT_PUBLIC_API_URL = $BACKEND_URL"
echo ""
echo "2. Redeploy to apply environment variables:"
echo "   vercel --prod"
echo ""
echo "3. Update Railway backend CORS:"
echo "   → Go to Railway dashboard"
echo "   → Add your Vercel URL to FRONTEND_URL variable"
echo ""
