#!/bin/bash

# Railway deployment helper script
# This helps verify your Railway deployment is working

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           Railway Deployment Verification                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Get Railway URL from user
echo "📍 Step 1: Get your Railway URL"
echo "   Go to Railway → Your backend service → Settings"
echo "   Copy the public URL (e.g., https://your-app.up.railway.app)"
echo ""
read -p "Enter your Railway URL: " RAILWAY_URL

# Remove trailing slash if present
RAILWAY_URL=${RAILWAY_URL%/}

echo ""
echo "🔍 Testing backend health..."
echo ""

# Test health endpoint
HEALTH_RESPONSE=$(curl -s "$RAILWAY_URL/health")

if [ $? -eq 0 ]; then
    echo "✅ Backend is responding!"
    echo "Response: $HEALTH_RESPONSE"
else
    echo "❌ Backend is not responding"
    echo "Check Railway logs for errors"
    exit 1
fi

echo ""
echo "🔍 Testing API root..."
echo ""

# Test root endpoint
ROOT_RESPONSE=$(curl -s "$RAILWAY_URL/")

if [ $? -eq 0 ]; then
    echo "✅ API root is accessible!"
    echo ""
else
    echo "❌ API root failed"
    exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                  Deployment Checklist                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Backend is deployed and responding"
echo "✅ Health check endpoint works"
echo ""
echo "Next steps:"
echo "1. Add environment variables in Railway dashboard"
echo "2. Create admin user with create_admin.py"
echo "3. Deploy frontend to Vercel"
echo ""
echo "Your Railway URL: $RAILWAY_URL"
echo ""
