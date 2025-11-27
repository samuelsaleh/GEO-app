#!/bin/bash
cd backend
echo "🔧 Starting Creed API..."
echo "Visit: http://localhost:8000/docs"
python -m uvicorn app.main:app --reload --host 0.0.0.0
