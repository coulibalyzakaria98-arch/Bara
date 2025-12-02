#!/bin/bash
# Pre-deployment test script for BaraCorrespondance
# Run this before deploying to verify everything works locally

set -e

echo "🔍 Pre-Deployment Tests for BaraCorrespondance"
echo "================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Frontend build
echo -e "\n${YELLOW}[1/6] Testing frontend build...${NC}"
cd frontend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi
cd ..

# Test 2: Frontend lint
echo -e "\n${YELLOW}[2/6] Checking frontend lint...${NC}"
cd frontend
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend lint passed${NC}"
else
    echo -e "${YELLOW}⚠ Frontend lint has warnings (non-critical)${NC}"
fi
cd ..

# Test 3: Backend dependencies
echo -e "\n${YELLOW}[3/6] Checking backend dependencies...${NC}"
cd backend
if python -m pip check > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend dependencies OK${NC}"
else
    echo -e "${RED}✗ Backend dependency issues detected${NC}"
    python -m pip check
    exit 1
fi

# Test 4: Backend imports
echo -e "\n${YELLOW}[4/6] Testing backend imports...${NC}"
if python -c "from app import create_app; print('✓ Flask app imports OK')" 2>/dev/null; then
    echo -e "${GREEN}✓ Backend imports successful${NC}"
else
    echo -e "${RED}✗ Backend import failed${NC}"
    exit 1
fi
cd ..

# Test 5: Check required files
echo -e "\n${YELLOW}[5/6] Checking required deployment files...${NC}"
files_ok=true

for file in \
    "frontend/vercel.json" \
    "frontend/.env.local.example" \
    "backend/Procfile" \
    "backend/.env.production.example" \
    "backend/requirements.txt"
do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file missing${NC}"
        files_ok=false
    fi
done

if [ "$files_ok" = false ]; then
    exit 1
fi

# Test 6: Check environment variables
echo -e "\n${YELLOW}[6/6] Checking environment variable setup...${NC}"
cd backend
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file present${NC}"
else
    echo -e "${YELLOW}⚠ .env file not found (required for local dev)${NC}"
fi
cd ..

if [ -f "frontend/.env.local" ]; then
    echo -e "${GREEN}✓ .env.local file present${NC}"
else
    echo -e "${YELLOW}⚠ .env.local file not found (using defaults)${NC}"
fi

echo -e "\n${GREEN}✅ All pre-deployment tests passed!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Create accounts on Vercel (vercel.com) and Railway (railway.app)"
echo "2. Follow DEPLOYMENT_GUIDE.md for step-by-step instructions"
echo "3. Set environment variables in Vercel and Railway dashboards"
echo "4. Deploy frontend: vercel deploy"
echo "5. Deploy backend: railway up"
echo "6. Test end-to-end flow"

