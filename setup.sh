#!/bin/bash

echo "🚀 Setting up Creed..."
echo ""

# Frontend setup
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed!"
else
    echo "❌ Frontend installation failed"
    exit 1
fi

cd ..

# Backend setup
echo ""
echo "🐍 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed!"
else
    echo "❌ Backend installation failed"
    exit 1
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the app:"
echo "  Frontend: cd frontend && npm run dev"
echo "  Backend:  cd backend && python -m uvicorn app.main:app --reload"
echo ""
